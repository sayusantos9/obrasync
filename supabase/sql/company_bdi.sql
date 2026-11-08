begin;
create table if not exists public.company_bdi_settings (
 company_id uuid primary key references public.companies(id),config jsonb not null,version bigint not null default 1,
 updated_by uuid not null references public.profiles(id),updated_at timestamptz not null default now());
alter table public.company_bdi_settings enable row level security;
revoke all on public.company_bdi_settings from anon,authenticated;
grant select on public.company_bdi_settings to authenticated;
drop policy if exists company_bdi_read on public.company_bdi_settings;
create policy company_bdi_read on public.company_bdi_settings for select to authenticated using(company_id=public.current_company_id() and public.current_app_role() in ('MASTER','ENGINEERING') and exists(select 1 from public.companies c where c.id=company_id and c.active));

create or replace function public.normalize_budget_bdi(p_config jsonb) returns jsonb
language plpgsql immutable set search_path='' as $$ declare enabled boolean;modern boolean;mode text;field text;value numeric;rate numeric:=0;iss numeric:=0;divisor numeric;config jsonb;begin
 if jsonb_typeof(p_config) is distinct from 'object' then raise exception 'Configuração de BDI inválida.';end if;
 if p_config ? 'enabled' and jsonb_typeof(p_config->'enabled') is distinct from 'boolean' then raise exception 'Aplicação do BDI inválida.';end if;
 modern:=p_config ? 'enabled' or p_config ? 'mode' or p_config->>'schemaVersion'='2';
 enabled:=coalesce((p_config->>'enabled')::boolean,not coalesce(modern,false));mode:=coalesce(p_config->>'mode',case when modern then 'PERCENT' else 'COMPONENTS' end);
 if mode not in ('PERCENT','COMPONENTS') then raise exception 'Modo de BDI inválido.';end if;
 config:=jsonb_build_object('schemaVersion',2,'enabled',enabled,'mode',mode,'desonerado',coalesce((p_config->>'desonerado')::boolean,false));
 foreach field in array array['ac','sg','r','df','l','cp','issBase','issRate'] loop
  begin value:=(p_config->>field)::numeric;exception when invalid_text_representation or numeric_value_out_of_range then value:=null;end;
  if modern and not(p_config ? field) then value:=0;end if;
  if value is null or value<0 or value>100 or value::text in ('NaN','Infinity','-Infinity') then
   if enabled and mode='COMPONENTS' then raise exception 'Percentual inválido de BDI: %',field;end if;value:=0;
  end if;
  config:=config||jsonb_build_object(field,value);
 end loop;
 begin value:=(p_config->>'rate')::numeric;exception when invalid_text_representation or numeric_value_out_of_range then value:=null;end;
 if modern and not(p_config ? 'rate') then value:=0;end if;
 if value is null or value<0 or value>100 or value::text in ('NaN','Infinity','-Infinity') then
  if enabled and mode='PERCENT' then raise exception 'Informe um BDI entre 0 e 100%%.';end if;value:=0;
 end if;
 rate:=round(value,2);
 if enabled and mode='COMPONENTS' then
  iss:=(config->>'issBase')::numeric*(config->>'issRate')::numeric/100;
  divisor:=1-((config->>'cp')::numeric+iss)/100;
  if divisor<=0 then raise exception 'CP + ISS efetivo deve ser menor que 100%%.';end if;
  rate:=round(((1+((config->>'ac')::numeric+(config->>'sg')::numeric+(config->>'r')::numeric)/100)*(1+(config->>'df')::numeric/100)*(1+(config->>'l')::numeric/100)/divisor-1)*100,2);
 end if;
 return config||jsonb_build_object('rate',rate,'effectiveRate',case when enabled then rate else 0 end);
end $$;
revoke all on function public.normalize_budget_bdi(jsonb) from public,anon,authenticated;

create or replace function public.get_company_bdi() returns jsonb
language plpgsql stable security definer set search_path='' as $$ declare setting public.company_bdi_settings;begin
 if coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING') or not exists(select 1 from public.companies where id=public.current_company_id() and active) then raise exception 'Perfil não autorizado ao padrão de BDI.';end if;
 select * into setting from public.company_bdi_settings where company_id=public.current_company_id();
 if found then return to_jsonb(setting);end if;
 return jsonb_build_object('company_id',public.current_company_id(),'version',0,'updated_at',null,'config',public.normalize_budget_bdi('{"schemaVersion":2,"enabled":false,"mode":"PERCENT","rate":0}'::jsonb));
end $$;
create or replace function public.save_company_bdi(p_config jsonb,p_expected_version bigint) returns jsonb
language plpgsql security definer set search_path='' as $$ declare setting public.company_bdi_settings;canonical jsonb;cid uuid:=public.current_company_id();begin
 if coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING') or not exists(select 1 from public.companies where id=cid and active) then raise exception 'Perfil não autorizado ao padrão de BDI.';end if;
 perform pg_advisory_xact_lock(hashtextextended(cid::text,73));
 select * into setting from public.company_bdi_settings where company_id=cid for update;
 if p_expected_version is null or p_expected_version<>coalesce(setting.version,0) then raise exception 'O padrão da empresa mudou. Atualize antes de salvar.';end if;
 canonical:=public.normalize_budget_bdi(p_config);
 insert into public.company_bdi_settings(company_id,config,version,updated_by) values(cid,canonical,1,auth.uid()) on conflict(company_id) do update set config=excluded.config,version=company_bdi_settings.version+1,updated_by=auth.uid(),updated_at=now();
 insert into public.operation_audit(company_id,actor_id,action,entity_id,details) values(cid,auth.uid(),'COMPANY_BDI',cid,jsonb_build_object('before',to_jsonb(setting),'config',canonical,'previousVersion',coalesce(setting.version,0)));
 return public.get_company_bdi();
end $$;
revoke all on function public.get_company_bdi(),public.save_company_bdi(jsonb,bigint) from public,anon;
grant execute on function public.get_company_bdi(),public.save_company_bdi(jsonb,bigint) to authenticated;

-- Preserve the current budget routine, including project access/import/version checks.
do $$ declare body text;start_at integer;end_at integer;replacement text;begin
 body:=replace(pg_get_functiondef('public.save_budget_version(uuid,jsonb)'::regprocedure),E'\r','');
 if position('-- optional-bdi-v2' in body)>0 then return;end if;
 start_at:=position(' foreach field in array array[' in body);end_at:=position(' if nullif(p_data->>''clientUserId''' in body);
 if start_at=0 or end_at<=start_at then raise exception 'Budget routine changed. Review the BDI integration.';end if;
 replacement:=E' -- optional-bdi-v2\n if bdi is null or bdi=''null''::jsonb then bdi:=public.get_company_bdi()->''config'';end if;\n bdi:=public.normalize_budget_bdi(bdi);\n rate:=(bdi->>''effectiveRate'')::numeric;\n';
 body:=left(body,start_at-1)||replacement||substr(body,end_at);
 execute body;
end $$;
notify pgrst,'reload schema';
commit;
