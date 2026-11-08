begin;
alter table public.budgets add column if not exists base_date date;
alter table public.budgets add column if not exists revision_of uuid references public.budgets(id);
alter table public.budgets add column if not exists revision_root_id uuid references public.budgets(id);
alter table public.budgets add column if not exists revision_number integer not null default 1;
alter table public.budgets add column if not exists revision_reason text;
alter table public.projects add column if not exists baseline_budget_id uuid references public.budgets(id);
create unique index if not exists budgets_revision_unique on public.budgets(revision_root_id,revision_number);
create table if not exists public.budget_import_files(
 budget_id uuid primary key references public.budgets(id),
 filename text not null,
 content_base64 text not null check(length(content_base64)<=2800000),
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.budget_import_files enable row level security;
drop policy if exists budget_import_read on public.budget_import_files;
create policy budget_import_read on public.budget_import_files for select to authenticated using (
 public.current_app_role() in ('MASTER','ENGINEERING') and exists(select 1 from public.budgets b where b.id=budget_id and b.company_id=public.current_company_id())
);
grant select on public.budget_import_files to authenticated;
revoke insert,update,delete on public.budget_import_files from authenticated;
-- All new documents and their lines are committed atomically through the RPC.
revoke insert,update,delete on public.budgets,public.budget_items from authenticated;
create or replace function public.save_budget_version(p_project_id uuid,p_data jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare
 cid uuid:=public.current_company_id(); uid uuid:=auth.uid(); entity uuid:=gen_random_uuid();
 parent public.budgets; root uuid; revision integer:=1; line jsonb; bdi jsonb:=p_data->'bdiConfig';
 source_id uuid; code text; description text; unit text; kind text; qty numeric; price numeric;
 subtotal numeric:=0; rate numeric; amount numeric; n numeric; field text; divisor numeric;
 client public.profiles; imported jsonb:=p_data->'importFile';
begin
 if uid is null or cid is null or coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING')
 or not exists(select 1 from public.companies where id=cid and active)
 or not exists(select 1 from public.projects where id=p_project_id and company_id=cid) then raise exception 'Obra ou perfil não autorizado.'; end if;
 if nullif(btrim(p_data->>'title'),'') is null or nullif(p_data->>'baseDate','') is null then raise exception 'Informe título e data-base.'; end if;
 if jsonb_typeof(p_data->'items') is distinct from 'array' or jsonb_array_length(p_data->'items') not between 1 and 2000 then raise exception 'Informe de 1 a 2000 insumos.'; end if;
 if nullif(p_data->>'revisionOf','') is not null then
  select * into parent from public.budgets where id=(p_data->>'revisionOf')::uuid and company_id=cid and project_id=p_project_id and deleted_at is null;
  if not found or length(btrim(coalesce(p_data->>'revisionReason','')))<5 then raise exception 'Revisão inválida ou motivo ausente (mínimo 5 caracteres).'; end if;
  root:=coalesce(parent.revision_root_id,parent.id);
  perform 1 from public.budgets where id=root for update;
  select coalesce(max(revision_number),1)+1 into revision from public.budgets where id=root or revision_root_id=root;
 else root:=entity; end if;
 foreach field in array array['ac','sg','r','df','l','cp','issBase','issRate'] loop
  n:=(bdi->>field)::numeric;
  if n is null or n<0 or n>100 or n::text in ('NaN','Infinity','-Infinity') then raise exception 'BDI inválido: %',field; end if;
 end loop;
 divisor:=1-((bdi->>'cp')::numeric+(bdi->>'issBase')::numeric*(bdi->>'issRate')::numeric/100)/100;
 if divisor<=0 then raise exception 'BDI inválido.'; end if;
 rate:=round(((1+((bdi->>'ac')::numeric+(bdi->>'sg')::numeric+(bdi->>'r')::numeric)/100)*(1+(bdi->>'df')::numeric/100)*(1+(bdi->>'l')::numeric/100)/divisor-1)*100,2);
 if nullif(p_data->>'clientUserId','') is not null then
  select * into client from public.profiles where id=(p_data->>'clientUserId')::uuid and company_id=cid and role='CLIENT' and active;
  if not found then raise exception 'Cliente não autorizado.'; end if;
 end if;
 insert into public.budgets(id,company_id,project_id,number,title,status,total,created_by,base_date,revision_of,revision_root_id,revision_number,revision_reason,bdi_config,bdi_percent,valid_until,notes,client_user_id,client_name,client_email,client_document,client_phone)
 values(entity,cid,p_project_id,'ORC-'||upper(left(entity::text,8)),btrim(p_data->>'title'),'DRAFT',0,uid,(p_data->>'baseDate')::date,parent.id,root,revision,p_data->>'revisionReason',bdi,rate,nullif(p_data->>'validUntil','')::date,p_data->>'notes',client.id,client.name,client.email,p_data->>'clientDocument',p_data->>'clientPhone');
 for line in select * from jsonb_array_elements(p_data->'items') loop
  source_id:=(line->>'inputId')::uuid; code:=null;
  if line->>'source'='shared' then
   select catalog_code,c.description,c.unit,input_type into code,description,unit,kind from public.input_catalog c where id=source_id and catalog_active;
  elsif line->>'source'='company' then
   select c.code,c.description,c.unit,input_type into code,description,unit,kind from public.cost_inputs c where id=source_id and company_id=cid;
  end if;
  if code is null or kind not in ('MATERIAL','EQUIPMENT') or code is distinct from line->>'code' or lower(btrim(unit)) is distinct from lower(btrim(line->>'unit')) then raise exception 'Insumo, código ou unidade inválido.'; end if;
  qty:=(line->>'quantity')::numeric; price:=(line->>'unitPrice')::numeric;
  if qty is null or price is null or qty<=0 or price<0 or qty::text in ('NaN','Infinity','-Infinity') or price::text in ('NaN','Infinity','-Infinity') then raise exception 'Quantidade ou preço inválido.'; end if;
  insert into public.budget_items(budget_id,input_id,catalog_input_id,input_code,input_type,description,quantity,unit,unit_price)
  values(entity,case when line->>'source'='company' then source_id end,case when line->>'source'='shared' then source_id end,code,kind,description,qty,unit,price);
  subtotal:=subtotal+round(qty*price,2);
 end loop;
 amount:=round(subtotal*rate/100,2);
 update public.budgets set subtotal_without_bdi=subtotal,bdi_amount=amount,total=subtotal+amount where id=entity;
 if imported is not null and imported<>'null'::jsonb then
  if length(imported->>'base64') not between 1 and 2800000 or coalesce(imported->>'name','') !~* '\.(xlsx|csv)$' then raise exception 'Arquivo de importação inválido (máximo 2 MB).'; end if;
  perform decode(imported->>'base64','base64');
  insert into public.budget_import_files(budget_id,filename,content_base64,metadata) values(entity,imported->>'name',imported->>'base64',coalesce(imported->'metadata','{}'::jsonb));
 end if;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(cid,p_project_id,uid,'BUDGET_VERSION',entity,jsonb_build_object('revision',revision,'parent',parent.id,'baseDate',p_data->>'baseDate'));
 return entity;
end $$;
create or replace function public.set_budget_baseline(p_project_id uuid,p_budget_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare b public.budgets; previous uuid;
begin
 if auth.uid() is null or public.current_app_role() is distinct from 'MASTER' or not exists(select 1 from public.companies where id=public.current_company_id() and active) then raise exception 'Somente o Gestor ativo define o orçamento-base.'; end if;
 select * into b from public.budgets where id=p_budget_id and project_id=p_project_id and company_id=public.current_company_id() and deleted_at is null and base_date is not null for update;
 if not found then raise exception 'Orçamento indisponível ou sem data-base. Crie uma revisão com data-base.'; end if;
 select baseline_budget_id into previous from public.projects where id=p_project_id and company_id=public.current_company_id() for update;
 if not found then raise exception 'Obra não autorizada.'; end if;
 update public.projects set baseline_budget_id=b.id,budget=b.total where id=p_project_id;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(public.current_company_id(),p_project_id,auth.uid(),'BUDGET_BASELINE',b.id,jsonb_build_object('previous',previous));
end $$;
-- Prevent archived baselines and cross-project references, including direct project edits.
create or replace function public.guard_budget_baseline() returns trigger language plpgsql set search_path='' as $$
begin
 if TG_TABLE_NAME='budgets' then
  if new.deleted_at is not null and exists(select 1 from public.projects where baseline_budget_id=old.id) then raise exception 'Defina outro orçamento-base antes de arquivar este.'; end if;
 else
  if new.baseline_budget_id is not null then
   if (TG_OP='INSERT' or new.baseline_budget_id is distinct from old.baseline_budget_id) and public.current_app_role() is distinct from 'MASTER' then raise exception 'Somente o Gestor define a base.'; end if;
   if not exists(select 1 from public.budgets where id=new.baseline_budget_id and project_id=new.id and company_id=new.company_id and deleted_at is null and base_date is not null and total=new.budget) then raise exception 'A previsão deve corresponder ao orçamento-base desta obra.'; end if;
  elsif TG_OP='UPDATE' and old.baseline_budget_id is not null then raise exception 'Escolha outro orçamento-base; a base não pode ser removida.';
  end if;
 end if;
 return new;
end $$;
drop trigger if exists guard_baseline_project on public.projects;
create trigger guard_baseline_project before insert or update on public.projects for each row execute function public.guard_budget_baseline();
drop trigger if exists guard_baseline_archive on public.budgets;
create trigger guard_baseline_archive before update on public.budgets for each row execute function public.guard_budget_baseline();
revoke all on function public.save_budget_version(uuid,jsonb),public.set_budget_baseline(uuid,uuid) from public,anon;
grant execute on function public.save_budget_version(uuid,jsonb),public.set_budget_baseline(uuid,uuid) to authenticated;
commit;
