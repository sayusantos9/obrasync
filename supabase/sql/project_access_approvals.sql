begin;
-- Seed only on first installation: later executions must never restore revoked grants.
do $$ begin
 if to_regclass('public.project_memberships') is null then
  create table public.project_memberships (
   project_id uuid not null references public.projects(id) on delete cascade,
   user_id uuid not null references public.profiles(id) on delete cascade,
   active boolean not null default true, updated_at timestamptz not null default now(),
   primary key(project_id,user_id));
  insert into public.project_memberships(project_id,user_id)
   select p.id,u.id from public.projects p join public.profiles u on u.company_id=p.company_id
   where u.active and u.role in ('ENGINEERING','PURCHASING','REQUESTER');
 end if;
end $$;
create table if not exists public.project_approval_rules (
 project_id uuid not null references public.projects(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 max_amount numeric(16,2) not null check(max_amount>0),
 max_deviation numeric(10,2) not null check(max_deviation>=0),
 active boolean not null default true, updated_at timestamptz not null default now(),
 primary key(project_id,user_id));
alter table public.project_approval_rules add column if not exists category text not null default 'ALL' check(category in ('ALL','MATERIAL','EQUIPMENT'));
alter table public.project_memberships enable row level security;
alter table public.project_approval_rules enable row level security;
revoke all on public.project_memberships,public.project_approval_rules from anon,authenticated;

create or replace function public.can_access_project(p_project_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.projects p join public.profiles u on u.id=auth.uid()
 join public.companies c on c.id=p.company_id and c.active
 where p.id=p_project_id and u.active and u.company_id=p.company_id and
 (u.role='MASTER' or (u.role='CLIENT' and p.client_user_id=u.id) or
 (u.role in ('ENGINEERING','PURCHASING','REQUESTER') and exists
 (select 1 from public.project_memberships m where m.project_id=p.id and m.user_id=u.id and m.active))))
$$;
create or replace function public.require_project_access(p_project_id uuid) returns void
language plpgsql stable security definer set search_path='' as $$ begin
 if not public.can_access_project(p_project_id) then raise exception 'Você não tem acesso a esta obra. Solicite a liberação ao Gestor.'; end if;
end $$;
revoke all on function public.can_access_project(uuid),public.require_project_access(uuid) from public,anon;
grant execute on function public.can_access_project(uuid),public.require_project_access(uuid) to authenticated;

-- Restrictive policies intersect (never replace) existing role and company policies.
drop policy if exists project_membership_scope on public.projects;
create policy project_membership_scope on public.projects as restrictive for select to authenticated using(public.can_access_project(id));
do $$ declare t record; begin
 for t in select table_name from information_schema.columns where table_schema='public' and column_name='project_id'
 and table_name not in ('project_memberships','project_approval_rules') loop
  execute format('drop policy if exists project_membership_scope on public.%I',t.table_name);
  execute format('create policy project_membership_scope on public.%I as restrictive for all to authenticated using (public.can_access_project(project_id) or (project_id is null and public.current_app_role()=''MASTER'')) with check (public.can_access_project(project_id) or (project_id is null and public.current_app_role()=''MASTER''))',t.table_name);
 end loop;
end $$;

create or replace function public.project_access_settings(p_project_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$ begin
 perform public.require_project_access(p_project_id);
 if public.current_app_role()<>'MASTER' then raise exception 'Somente o Gestor pode configurar acessos.'; end if;
 return jsonb_build_object('members',coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'name',u.name,'role',u.role,'active',u.active,'access',coalesce(m.active,false),'rule',to_jsonb(r)) order by u.name)
 from public.profiles u left join public.project_memberships m on m.user_id=u.id and m.project_id=p_project_id
 left join public.project_approval_rules r on r.user_id=u.id and r.project_id=p_project_id
 where u.company_id=public.current_company_id()),'[]'::jsonb));
end $$;
create or replace function public.save_project_access(p_project_id uuid,p_user_id uuid,p_access boolean,p_rule jsonb default null) returns void
language plpgsql security definer set search_path='' as $$ declare target public.profiles; before_value jsonb; begin
 perform pg_advisory_xact_lock(hashtextextended(p_project_id::text,71));
 perform public.require_project_access(p_project_id);
 if public.current_app_role()<>'MASTER' then raise exception 'Somente o Gestor pode configurar acessos.'; end if;
 select * into target from public.profiles where id=p_user_id and company_id=public.current_company_id() and active;
 if not found or target.role not in ('ENGINEERING','PURCHASING','REQUESTER') then raise exception 'Selecione um membro operacional ativo da empresa.'; end if;
 if p_rule is not null and (not p_access or target.role not in ('ENGINEERING','PURCHASING')) then raise exception 'A alçada exige acesso à obra e perfil Engenharia ou Compras.'; end if;
 select jsonb_build_object('access',m.active,'rule',to_jsonb(r)) into before_value from public.project_memberships m left join public.project_approval_rules r using(project_id,user_id) where m.project_id=p_project_id and m.user_id=p_user_id;
 insert into public.project_memberships(project_id,user_id,active) values(p_project_id,p_user_id,p_access)
 on conflict(project_id,user_id) do update set active=excluded.active,updated_at=now();
 if p_rule is null then delete from public.project_approval_rules where project_id=p_project_id and user_id=p_user_id;
 else
  if coalesce((p_rule->>'maxAmount')::numeric,0)<=0 or coalesce((p_rule->>'maxDeviation')::numeric,-1)<0 then raise exception 'Informe valor máximo positivo e desvio não negativo.'; end if;
  insert into public.project_approval_rules(project_id,user_id,max_amount,max_deviation,category) values(p_project_id,p_user_id,(p_rule->>'maxAmount')::numeric,(p_rule->>'maxDeviation')::numeric,coalesce(p_rule->>'category','ALL'))
  on conflict(project_id,user_id) do update set max_amount=excluded.max_amount,max_deviation=excluded.max_deviation,category=excluded.category,active=true,updated_at=now();
 end if;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(public.current_company_id(),p_project_id,auth.uid(),'PROJECT_ACCESS',p_user_id,jsonb_build_object('before',before_value,'access',p_access,'rule',p_rule));
end $$;

alter table public.purchase_orders add column if not exists approval_snapshot jsonb;
create or replace function public.evaluate_order_approval(p_order_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare o public.purchase_orders; r public.project_approval_rules; line record; base_price numeric; base_qty numeric; subtotal numeric; deviation numeric:=0; missing boolean:=false; wrong_category boolean:=false; self_approval boolean; allowed boolean:=false; why text; creator uuid; kind text; begin
 select * into o from public.purchase_orders where id=p_order_id and company_id=public.current_company_id();
 perform public.require_project_access(o.project_id);
 if coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING') then raise exception 'Perfil não autorizado a avaliar aprovações.'; end if;
 select * into r from public.project_approval_rules where project_id=o.project_id and user_id=auth.uid() and active;
 creator:=o.created_by;
 if o.quotation_id is not null then select created_by into creator from public.quotations where id=o.quotation_id; end if;
 self_approval:=creator=auth.uid() or exists(select 1 from public.material_requests where id=o.request_id and requester_id=auth.uid());
 select sum(quantity*unit_price) into subtotal from public.purchase_order_items where order_id=o.id;
 if coalesce(subtotal,0)<=0 or o.budget_id is null then missing:=true; end if;
 for line in select budget_refs,catalog_input_id,cost_input_id,unit,unit_price,sum(quantity) as quantity from public.purchase_order_items where order_id=o.id group by budget_refs,catalog_input_id,cost_input_id,unit,unit_price loop
  select input_type into kind from public.input_catalog where id=line.catalog_input_id;
  if line.cost_input_id is not null then select input_type into kind from public.cost_inputs where id=line.cost_input_id; end if;
  if r.category<>'ALL' and kind is distinct from r.category then wrong_category:=true; end if;
  select sum((x->>'quantity')::numeric*(x->>'unitPrice')::numeric)/nullif(sum((x->>'quantity')::numeric),0),sum((x->>'quantity')::numeric)
  into base_price,base_qty from jsonb_array_elements(line.budget_refs) x;
  if coalesce(base_price,0)<=0 or (select sum(i.quantity) from public.purchase_order_items i where i.order_id=o.id and i.budget_refs=line.budget_refs)>coalesce(base_qty,0) then missing:=true;
  else deviation:=greatest(deviation,100*(line.unit_price*o.total/nullif(subtotal,0)/base_price-1)); end if;
 end loop;
 if public.current_app_role()='MASTER' then allowed:=true;why:='Gestor: decisão com justificativa obrigatória.';
 elsif self_approval then why:='Não é permitido aprovar a própria solicitação ou proposta/pedido.';
 elsif r.user_id is null then why:='Você não possui alçada nesta obra. Encaminhe ao Gestor.';
 elsif wrong_category then why:='Pedido contém insumo fora da categoria da sua alçada. Encaminhe ao Gestor.';
 elsif missing then why:='Sem referência suficiente ou quantidade acima da prevista. Encaminhe ao Gestor.';
 elsif o.total>r.max_amount then why:='Valor total acima da sua alçada. Encaminhe ao Gestor.';
 elsif deviation>r.max_deviation then why:='Desvio unitário de preço acima da sua alçada. Encaminhe ao Gestor.';
 else allowed:=true;why:='Pedido dentro da alçada delegada pelo Gestor.'; end if;
 return jsonb_build_object('allowed',allowed,'reason',why,'total',o.total,'maxDeviation',round(deviation,2),'missingReference',missing,'rule',to_jsonb(r),'selfApproval',self_approval);
end $$;
create or replace function public.decide_purchase_order(p_project_id uuid,p_order_id uuid,p_approve boolean,p_reason text) returns jsonb
language plpgsql security definer set search_path='' as $$ declare o public.purchase_orders; evaluation jsonb; begin
 perform pg_advisory_xact_lock(hashtextextended(p_project_id::text,71));
 perform public.require_project_access(p_project_id);
 select * into o from public.purchase_orders where id=p_order_id and project_id=p_project_id and company_id=public.current_company_id() for update;
 if not found or o.approval_status<>'PENDING' then raise exception 'Pedido indisponível ou já decidido. Atualize a tela.'; end if;
 if length(btrim(coalesce(p_reason,'')))<10 then raise exception 'Informe uma justificativa com ao menos 10 caracteres.'; end if;
 evaluation:=public.evaluate_order_approval(o.id);
 if not (evaluation->>'allowed')::boolean then raise exception '%',evaluation->>'reason'; end if;
 update public.purchase_orders set approval_status=case when p_approve then 'APPROVED' else 'REJECTED' end,status=case when p_approve then 'SENT' else 'CANCELLED' end,approved_by=auth.uid(),approved_at=now(),approval_snapshot=evaluation||jsonb_build_object('reason',btrim(p_reason)) where id=o.id;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(o.company_id,o.project_id,auth.uid(),case when p_approve then 'APPROVE' else 'REJECT' end,o.id,evaluation||jsonb_build_object('justification',btrim(p_reason)));
 return jsonb_build_object('id',o.id);
end $$;

-- Patch current deployed routines, preserving all prior validations and traceability fixes.
do $$ declare f record; body text; original text; guard text; begin
 for f in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in
 ('procurement_action','procurement_action_internal','save_budget_version','set_budget_baseline','save_comparable_quote','executive_report_snapshot','procurement_origins','consume_market_search','archive_document','can_access_operation_file','award_quote') loop
  body:=replace(pg_get_functiondef(f.oid),E'\r',''); original:=body;
  if position('-- project-access-v1' in body)>0 then continue; end if;
  if f.proname='can_access_operation_file' then guard:='if not public.can_access_project(p_project) then return false; end if;';
  elsif f.proname='archive_document' then guard:='perform public.require_project_access(case when p_kind=''budget'' then (select project_id from public.budgets where id=p_id) when p_kind=''quote'' then (select project_id from public.quotations where id=p_id) end);';
  elsif f.proname='award_quote' then guard:='perform public.require_project_access((select project_id from public.quotations where id=p_quote_id));';
  else guard:='perform public.require_project_access(p_project_id);'; end if;
  if f.proname='procurement_action_internal' then
   guard:=guard||E'\n if p_action in (''APPROVE'',''REJECT'') then return public.decide_purchase_order(p_project_id,(p_data->>''id'')::uuid,p_action=''APPROVE'',p_data->>''reason''); end if;'
   ||E'\n if p_action=''STOCK'' and nullif(p_data->>''destinationProjectId'','''') is not null then perform public.require_project_access((p_data->>''destinationProjectId'')::uuid); end if;';
  end if;
  body:=regexp_replace(body,E'\nbegin\n',E'\nbegin\n -- project-access-v1\n '||guard||E'\n','i');
  if body=original then raise exception 'Cannot patch %',f.proname; end if;
  if f.proname='award_quote' then
   body:=replace(body,'jsonb_build_object(''id'',oid)','jsonb_build_object(''id'',oid,''reason'',p_reason)');
   body:=replace(body,'public.current_app_role() is distinct from ''MASTER''','coalesce(public.current_app_role(),'''') not in (''MASTER'',''ENGINEERING'',''PURCHASING'')');
  end if;
  execute body;
 end loop;
end $$;
revoke all on function public.project_access_settings(uuid),public.save_project_access(uuid,uuid,boolean,jsonb),public.evaluate_order_approval(uuid),public.decide_purchase_order(uuid,uuid,boolean,text) from public,anon;
grant execute on function public.project_access_settings(uuid),public.save_project_access(uuid,uuid,boolean,jsonb),public.evaluate_order_approval(uuid),public.decide_purchase_order(uuid,uuid,boolean,text) to authenticated;
commit;
