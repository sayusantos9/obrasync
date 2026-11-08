begin;
create table if not exists public.project_dimensions (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id),project_id uuid not null references public.projects(id),
 kind text not null check(kind in ('FRONT','COST_CENTER')),code text not null,name text not null,active boolean not null default true,updated_at timestamptz not null default now(),unique(project_id,kind,code));
create table if not exists public.purchase_plans (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id),project_id uuid not null references public.projects(id),
 front_id uuid not null references public.project_dimensions(id),cost_center_id uuid not null references public.project_dimensions(id),responsible_id uuid not null references public.profiles(id),
 catalog_input_id uuid references public.input_catalog(id),cost_input_id uuid references public.cost_inputs(id),description text not null,unit text not null,quantity numeric(18,6) not null check(quantity>0),
 priority text not null check(priority in ('LOW','NORMAL','HIGH','URGENT')),needed_by date not null,lead_days integer not null check(lead_days between 0 and 3650),acquisition_deadline date not null,
 budget_id uuid references public.budgets(id),origin_snapshot jsonb not null default '{}',estimated_unit_price numeric,notes text,
 status text not null default 'PLANNED' check(status in ('PLANNED','REQUESTED','CANCELLED')),request_id uuid unique references public.material_requests(id),
 created_by uuid not null references public.profiles(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 create_key text not null,create_payload jsonb not null,unique(company_id,created_by,create_key),check(num_nonnulls(catalog_input_id,cost_input_id)=1));
alter table public.material_requests add column if not exists purchase_plan_id uuid unique references public.purchase_plans(id);
alter table public.material_requests add column if not exists front_id uuid references public.project_dimensions(id);
alter table public.material_requests add column if not exists cost_center_id uuid references public.project_dimensions(id);
alter table public.material_requests add column if not exists responsible_id uuid references public.profiles(id);
alter table public.material_requests add column if not exists acquisition_deadline date;
alter table public.project_dimensions enable row level security;
alter table public.purchase_plans enable row level security;
revoke all on public.project_dimensions,public.purchase_plans from anon,authenticated;
grant select on public.project_dimensions,public.purchase_plans to authenticated;
drop policy if exists dimensions_scope on public.project_dimensions;
create policy dimensions_scope on public.project_dimensions for select to authenticated using(public.can_access_project(project_id) and public.current_app_role() in ('MASTER','ENGINEERING','PURCHASING','REQUESTER'));
drop policy if exists plans_scope on public.purchase_plans;
create policy plans_scope on public.purchase_plans for select to authenticated using(public.can_access_project(project_id) and (public.current_app_role() in ('MASTER','ENGINEERING','PURCHASING') or (public.current_app_role()='REQUESTER' and responsible_id=auth.uid())));

create or replace function public.member_has_project_access(p_project uuid,p_user uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.projects p join public.profiles u on u.id=p_user and u.company_id=p.company_id and u.active join public.companies c on c.id=p.company_id and c.active where p.id=p_project and (u.role='MASTER' or (u.role in ('ENGINEERING','PURCHASING','REQUESTER') and exists(select 1 from public.project_memberships m where m.project_id=p.id and m.user_id=u.id and m.active))))
$$;
revoke all on function public.member_has_project_access(uuid,uuid) from public,anon,authenticated;

create or replace function public.list_company_users(p_project_id uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$ begin
 if public.current_app_role() is distinct from 'MASTER' or not exists(select 1 from public.companies where id=public.current_company_id() and active) then raise exception 'Somente o Gestor pode gerenciar usuários.';end if;
 if p_project_id is not null then perform public.require_project_access(p_project_id);end if;
 return coalesce((select jsonb_agg(to_jsonb(u)||jsonb_build_object('projects',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.name)) from public.projects p where p.company_id=u.company_id and u.active and (u.role='MASTER' or (u.role='CLIENT' and p.client_user_id=u.id) or exists(select 1 from public.project_memberships m where m.project_id=p.id and m.user_id=u.id and m.active))),'[]'::jsonb)) order by u.name,u.id) from public.profiles u where u.company_id=public.current_company_id() and (p_project_id is null or (u.active and (u.role='MASTER' or (u.role='CLIENT' and exists(select 1 from public.projects p where p.id=p_project_id and p.client_user_id=u.id)) or exists(select 1 from public.project_memberships m where m.project_id=p_project_id and m.user_id=u.id and m.active))))),'[]'::jsonb);
end $$;

create or replace function public.save_company_user(p_user_id uuid,p_name text,p_role text,p_active boolean,p_expected timestamptz) returns void
language plpgsql security definer set search_path='' as $$ declare target public.profiles; pid uuid;begin
 if public.current_app_role() is distinct from 'MASTER' or not exists(select 1 from public.companies where id=public.current_company_id() and active) then raise exception 'Somente o Gestor pode gerenciar usuários.';end if;
 for pid in select id from public.projects where company_id=public.current_company_id() order by id loop perform pg_advisory_xact_lock(hashtextextended(pid::text,71));end loop;
 select * into target from public.profiles where id=p_user_id and company_id=public.current_company_id() for update;
 if not found then raise exception 'Usuário indisponível nesta empresa.';end if;
 if p_expected is null or target.updated_at<>p_expected then raise exception 'O cadastro mudou. Atualize a lista antes de salvar.';end if;
 if length(btrim(coalesce(p_name,'')))<2 or length(p_name)>120 or p_role is null or p_role not in ('MASTER','ENGINEERING','PURCHASING','REQUESTER','CLIENT') or p_active is null then raise exception 'Revise nome, perfil e situação.';end if;
 if (p_user_id=auth.uid() or target.role='MASTER') and (p_role<>target.role or not p_active) then raise exception 'Contas Gestor são protegidas contra mudança de perfil e desativação.';end if;
 if target.role<>'MASTER' and p_role='MASTER' then raise exception 'A promoção para Gestor não está disponível neste cadastro.';end if;
 if (not p_active or p_role<>target.role) and exists(select 1 from public.purchase_plans where responsible_id=p_user_id and status='PLANNED') then raise exception 'Reatribua os planejamentos abertos deste usuário antes de alterar seu perfil ou desativá-lo.';end if;
 if not p_active or p_role<>target.role then
  update public.project_memberships set active=false,updated_at=now() where user_id=p_user_id;
  delete from public.project_approval_rules where user_id=p_user_id;
  if p_role<>target.role or not p_active then
   update public.projects set client_user_id=null where client_user_id=p_user_id and company_id=target.company_id;
  end if;
 end if;
 update public.profiles set name=btrim(p_name),role=p_role,active=p_active where id=p_user_id;
 insert into public.operation_audit(company_id,actor_id,action,entity_id,details) values(target.company_id,auth.uid(),'MANAGE_USER',p_user_id,jsonb_build_object('before',jsonb_build_object('name',target.name,'role',target.role,'active',target.active),'after',jsonb_build_object('name',btrim(p_name),'role',p_role,'active',p_active)));
end $$;
-- Access/profile mutations go through the audited RPC; ordinary self-name edits remain possible.
revoke update on public.profiles from authenticated;
grant update(name) on public.profiles to authenticated;

create or replace function public.save_project_dimension(p_project_id uuid,p_data jsonb) returns uuid
language plpgsql security definer set search_path='' as $$ declare existing public.project_dimensions;did uuid:=nullif(p_data->>'id','')::uuid; dim_kind text:=p_data->>'kind'; dim_code text:=upper(btrim(p_data->>'code'));dim_name text:=btrim(p_data->>'name');begin
 perform pg_advisory_xact_lock(hashtextextended(p_project_id::text,71));
 perform public.require_project_access(p_project_id);
 if coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING') then raise exception 'Perfil não autorizado ao planejamento.';end if;
 if dim_kind is null or dim_kind not in ('FRONT','COST_CENTER') or coalesce(length(dim_code),0) not between 1 and 30 or coalesce(length(dim_name),0) not between 2 and 120 then raise exception 'Informe tipo, código e nome válidos.';end if;
 if did is null then
  select * into existing from public.project_dimensions where project_id=p_project_id and project_dimensions.kind=dim_kind and project_dimensions.code=dim_code;
  if found then if existing.name=dim_name and existing.active then return existing.id;else raise exception 'Código já cadastrado nesta obra.';end if;end if;
  insert into public.project_dimensions(company_id,project_id,kind,code,name) values(public.current_company_id(),p_project_id,dim_kind,dim_code,dim_name) returning id into did;
 else
  select * into existing from public.project_dimensions where id=did and project_id=p_project_id for update;
  if not found or existing.updated_at is distinct from (p_data->>'updatedAt')::timestamptz then raise exception 'Cadastro alterado. Atualize a lista.';end if;
  update public.project_dimensions set code=dim_code,name=dim_name,active=coalesce((p_data->>'active')::boolean,true),updated_at=now() where id=did;
 end if;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(public.current_company_id(),p_project_id,auth.uid(),'PLAN_DIMENSION',did,jsonb_build_object('before',to_jsonb(existing),'after',p_data));return did;
end $$;

create or replace function public.purchase_planning_snapshot(p_project_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$ begin
 perform public.require_project_access(p_project_id);
 if coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING','REQUESTER') then raise exception 'Perfil não autorizado ao planejamento.';end if;
 return jsonb_build_object('today',(now() at time zone 'America/Sao_Paulo')::date,'project',(select to_jsonb(p) from public.projects p where id=p_project_id),
 'dimensions',coalesce((select jsonb_agg(to_jsonb(d) order by kind,code) from public.project_dimensions d where project_id=p_project_id),'[]'::jsonb),
 'members',coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'name',u.name,'role',u.role) order by u.name) from public.profiles u where u.company_id=public.current_company_id() and public.member_has_project_access(p_project_id,u.id)),'[]'::jsonb),
 'plans',coalesce((select jsonb_agg(to_jsonb(p)||jsonb_build_object('front_name',f.name,'cost_center_name',c.name,'responsible_name',u.name,'responsible_active',u.active,'request_status',r.status,'request_number',r.number,'quote_round_id',(select id from public.quote_rounds where request_id=p.request_id limit 1)) order by p.acquisition_deadline,p.created_at) from public.purchase_plans p join public.project_dimensions f on f.id=p.front_id join public.project_dimensions c on c.id=p.cost_center_id join public.profiles u on u.id=p.responsible_id left join public.material_requests r on r.id=p.request_id where p.project_id=p_project_id and (public.current_app_role()<>'REQUESTER' or p.responsible_id=auth.uid())),'[]'::jsonb));
end $$;

create or replace function public.save_purchase_plan(p_project_id uuid,p_data jsonb) returns uuid
language plpgsql security definer set search_path='' as $$ declare old public.purchase_plans;planid uuid:=nullif(p_data->>'id','')::uuid; inputid uuid:=nullif(p_data->>'inputId','')::uuid;front uuid:=(p_data->>'frontId')::uuid;center uuid:=(p_data->>'costCenterId')::uuid;responsible uuid:=(p_data->>'responsibleId')::uuid;qty numeric:=(p_data->>'quantity')::numeric;days integer:=(p_data->>'leadDays')::integer;needed date:=(p_data->>'neededBy')::date;pri text:=p_data->>'priority';descr text;un text;bid uuid;pp numeric;origin jsonb;catalog uuid;cost uuid;token text:=p_data->>'clientRequestId';begin
 perform pg_advisory_xact_lock(hashtextextended(p_project_id::text,71));
 perform public.require_project_access(p_project_id);
 if coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING') then raise exception 'Perfil não autorizado ao planejamento.';end if;
 if planid is null then
  if coalesce(length(token),0) not between 10 and 150 then raise exception 'Identificador do planejamento inválido.';end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||token,72));
  select * into old from public.purchase_plans where company_id=public.current_company_id() and created_by=auth.uid() and create_key=token;
  if found then if old.project_id<>p_project_id or old.create_payload<>p_data then raise exception 'Identificador já usado com outros dados. Atualize os planejamentos.';end if;return old.id;end if;
 else
  select * into old from public.purchase_plans where id=planid and project_id=p_project_id for update;
  if not found or old.status<>'PLANNED' or old.updated_at is distinct from (p_data->>'updatedAt')::timestamptz then raise exception 'Planejamento alterado ou já solicitado. Atualize a lista.';end if;
 end if;
 if qty is null or qty<=0 or qty::text in ('NaN','Infinity','-Infinity') or days is null or days not between 0 and 3650 or needed is null or pri is null or pri not in ('LOW','NORMAL','HIGH','URGENT') then raise exception 'Revise quantidade, prioridade, necessidade e antecedência.';end if;
 if not exists(select 1 from public.project_dimensions where id=front and project_id=p_project_id and kind='FRONT' and active) or not exists(select 1 from public.project_dimensions where id=center and project_id=p_project_id and kind='COST_CENTER' and active) then raise exception 'Selecione frente e centro de custo ativos desta obra.';end if;
 perform 1 from public.profiles where id=responsible for share;
 if not public.member_has_project_access(p_project_id,responsible) then raise exception 'Responsável precisa estar ativo e ter acesso à obra.';end if;
 if p_data->>'source'='shared' then select id,description,unit into catalog,descr,un from public.input_catalog where id=inputid and catalog_active and input_type in ('MATERIAL','EQUIPMENT');
 elsif p_data->>'source'='company' then select id,description,unit into cost,descr,un from public.cost_inputs where id=inputid and company_id=public.current_company_id() and input_type in ('MATERIAL','EQUIPMENT');end if;
 if descr is null then raise exception 'Selecione um insumo válido do catálogo.';end if;
 select baseline_budget_id into bid from public.projects where id=p_project_id;
 if bid is distinct from nullif(p_data->>'expectedBudgetId','')::uuid then raise exception 'O orçamento-base mudou. Atualize o planejamento.';end if;
 select sum(quantity*unit_price)/nullif(sum(quantity),0) into pp from public.budget_items where budget_id=bid and lower(btrim(unit))=lower(btrim(un)) and ((catalog is not null and catalog_input_id=catalog) or (cost is not null and input_id=cost));
 select jsonb_build_object('budget',(select jsonb_build_object('id',b.id,'number',b.number,'revision',b.revision_number,'baseDate',b.base_date) from public.budgets b where id=bid),'front',(select name from public.project_dimensions where id=front),'costCenter',(select name from public.project_dimensions where id=center),'responsible',(select name from public.profiles where id=responsible)) into origin;
 if planid is null then
  insert into public.purchase_plans(company_id,project_id,front_id,cost_center_id,responsible_id,catalog_input_id,cost_input_id,description,unit,quantity,priority,needed_by,lead_days,acquisition_deadline,budget_id,origin_snapshot,estimated_unit_price,notes,created_by,create_key,create_payload) values(public.current_company_id(),p_project_id,front,center,responsible,catalog,cost,descr,un,qty,pri,needed,days,needed-days,bid,origin,pp,left(p_data->>'notes',2000),auth.uid(),token,p_data) returning id into planid;
 else update public.purchase_plans set front_id=front,cost_center_id=center,responsible_id=responsible,catalog_input_id=catalog,cost_input_id=cost,description=descr,unit=un,quantity=qty,priority=pri,needed_by=needed,lead_days=days,acquisition_deadline=needed-days,budget_id=bid,origin_snapshot=origin,estimated_unit_price=pp,notes=left(p_data->>'notes',2000),updated_at=now() where id=planid;end if;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(public.current_company_id(),p_project_id,auth.uid(),'SAVE_PURCHASE_PLAN',planid,jsonb_build_object('before',to_jsonb(old),'after',p_data));return planid;
end $$;

create or replace function public.purchase_plan_action(p_plan_id uuid,p_action text,p_expected timestamptz) returns uuid
language plpgsql security definer set search_path='' as $$ declare p public.purchase_plans;rid uuid;pid uuid;role_name text;begin
 select project_id into pid from public.purchase_plans where id=p_plan_id;
 perform pg_advisory_xact_lock(hashtextextended(pid::text,71));
 select * into p from public.purchase_plans where id=p_plan_id for update;
 perform public.require_project_access(p.project_id);
 role_name:=coalesce(public.current_app_role(),'');
 if role_name not in ('MASTER','ENGINEERING','PURCHASING','REQUESTER') or (role_name='REQUESTER' and p.responsible_id<>auth.uid()) then raise exception 'Planejamento não autorizado.';end if;
 if p_action='REQUEST' and p.request_id is not null then return p.request_id;end if;
 if p.status<>'PLANNED' or p.updated_at is distinct from p_expected then raise exception 'Planejamento alterado. Atualize a lista.';end if;
 if p_action='CANCEL' then
  if role_name='REQUESTER' then raise exception 'Somente a equipe de planejamento pode cancelar.';end if;
  update public.purchase_plans set status='CANCELLED',updated_at=now() where id=p.id;
 elsif p_action='REQUEST' then
  if role_name not in ('MASTER','PURCHASING','REQUESTER') then raise exception 'Compras, Gestor ou o Solicitante responsável devem gerar a solicitação.';end if;
  if not public.member_has_project_access(p.project_id,p.responsible_id) then raise exception 'Reatribua o planejamento a um responsável ativo com acesso à obra.';end if;
  rid:=(public.procurement_action('REQUEST',p.project_id,jsonb_build_object('clientRequestId','purchase-plan-'||p.id,'material',p.description,'inputId',coalesce(p.catalog_input_id,p.cost_input_id),'source',case when p.catalog_input_id is not null then 'shared' else 'company' end,'quantity',p.quantity,'unit',p.unit,'neededAt',p.needed_by,'justification','Planejamento de compras: '||(p.origin_snapshot->>'front'))) ->>'id')::uuid;
  update public.material_requests set purchase_plan_id=p.id,front_id=p.front_id,cost_center_id=p.cost_center_id,responsible_id=p.responsible_id,acquisition_deadline=p.acquisition_deadline,priority=p.priority,notes=concat('Planejamento ',p.id,E'\nFrente: ',p.origin_snapshot->>'front',E'\nCentro de custo: ',p.origin_snapshot->>'costCenter',E'\nResponsável: ',p.origin_snapshot->>'responsible',E'\nAdquirir até: ',p.acquisition_deadline,E'\n',p.notes) where id=rid;
  update public.purchase_plans set status='REQUESTED',request_id=rid,updated_at=now() where id=p.id;
 else raise exception 'Ação inválida.';end if;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(p.company_id,p.project_id,auth.uid(),'PLAN_'||p_action,p.id,jsonb_build_object('requestId',rid,'before',to_jsonb(p)));return coalesce(rid,p.id);
end $$;
revoke all on function public.list_company_users(uuid),public.save_company_user(uuid,text,text,boolean,timestamptz),public.save_project_dimension(uuid,jsonb),public.purchase_planning_snapshot(uuid),public.save_purchase_plan(uuid,jsonb),public.purchase_plan_action(uuid,text,timestamptz) from public,anon;
grant execute on function public.list_company_users(uuid),public.save_company_user(uuid,text,text,boolean,timestamptz),public.save_project_dimension(uuid,jsonb),public.purchase_planning_snapshot(uuid),public.save_purchase_plan(uuid,jsonb),public.purchase_plan_action(uuid,text,timestamptz) to authenticated;
notify pgrst,'reload schema';
commit;
