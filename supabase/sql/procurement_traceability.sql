begin;
alter table public.material_request_items add column if not exists catalog_input_id uuid references public.input_catalog(id);
alter table public.material_request_items add column if not exists cost_input_id uuid references public.cost_inputs(id);
alter table public.material_request_items add column if not exists input_code text;
alter table public.quote_rounds add column if not exists request_id uuid references public.material_requests(id);
alter table public.quote_rounds add column if not exists budget_id uuid references public.budgets(id);
alter table public.quote_rounds add column if not exists origin_snapshot jsonb not null default '{}'::jsonb;
alter table public.quote_rounds add column if not exists trace_version integer not null default 0;
create unique index if not exists quote_round_request_unique on public.quote_rounds(request_id) where request_id is not null;
alter table public.quotation_items add column if not exists request_item_id uuid references public.material_request_items(id);
alter table public.quotation_items add column if not exists budget_item_id uuid references public.budget_items(id);
alter table public.quotation_items add column if not exists budget_refs jsonb not null default '[]'::jsonb;
alter table public.purchase_orders add column if not exists request_id uuid references public.material_requests(id);
alter table public.purchase_orders add column if not exists budget_id uuid references public.budgets(id);
alter table public.purchase_orders add column if not exists origin_snapshot jsonb not null default '{}'::jsonb;
alter table public.purchase_orders add column if not exists trace_version integer not null default 0;
alter table public.purchase_order_items add column if not exists request_item_id uuid references public.material_request_items(id);
alter table public.purchase_order_items add column if not exists quotation_item_id uuid references public.quotation_items(id);
alter table public.purchase_order_items add column if not exists budget_refs jsonb not null default '[]'::jsonb;
-- Request data is created by the idempotent operation RPC and cannot be changed behind a linked quote.
revoke insert,update,delete on public.material_requests,public.material_request_items from authenticated,anon;

create or replace function public.link_request_catalog(p_request_id uuid,p_data jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare req public.material_requests; ident uuid:=nullif(p_data->>'inputId','')::uuid; code text; description text; u text;
begin
 select * into req from public.material_requests where id=p_request_id and company_id=public.current_company_id() and requester_id=auth.uid();
 if not found then raise exception 'Solicitação não autorizada.'; end if;
 if ident is null then return; end if; -- Existing offline/text requests remain valid.
 if p_data->>'source'='shared' then
  select catalog_code,input_catalog.description,unit into code,description,u from public.input_catalog where id=ident and catalog_active and input_type in ('MATERIAL','EQUIPMENT');
 elsif p_data->>'source'='company' then
  select cost_inputs.code,cost_inputs.description,unit into code,description,u from public.cost_inputs where id=ident and company_id=req.company_id and input_type in ('MATERIAL','EQUIPMENT');
 end if;
 if code is null or lower(btrim(u)) is distinct from lower(btrim(p_data->>'unit')) then raise exception 'Insumo ou unidade incompatível com o catálogo.'; end if;
 update public.material_request_items set catalog_input_id=case when p_data->>'source'='shared' then ident end,cost_input_id=case when p_data->>'source'='company' then ident end,input_code=code,material_name=description,unit=u where request_id=req.id;
end $$;

create or replace function public.capture_budget_origin(p_project_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare bid uuid; b public.budgets;
begin
 select baseline_budget_id into bid from public.projects where id=p_project_id and company_id=public.current_company_id() for share;
 if not found then raise exception 'Obra não autorizada.'; end if;
 select * into b from public.budgets where id=bid and project_id=p_project_id and company_id=public.current_company_id() and deleted_at is null;
 return jsonb_build_object('budget',case when b.id is null then null else jsonb_build_object('id',b.id,'number',b.number,'title',b.title,'revision',b.revision_number,'baseDate',b.base_date,'total',b.total) end,'capturedAt',now());
end $$;

create or replace function public.budget_item_references(p_budget_id uuid,p_catalog_id uuid,p_cost_id uuid,p_unit text) returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'code',i.input_code,'description',i.description,'unit',i.unit,'quantity',i.quantity,'unitPrice',i.unit_price) order by i.id),'[]'::jsonb)
 from public.budget_items i join public.budgets b on b.id=i.budget_id
 where b.id=p_budget_id and b.company_id=public.current_company_id() and lower(btrim(i.unit))=lower(btrim(p_unit))
 and ((p_catalog_id is not null and i.catalog_input_id=p_catalog_id) or (p_cost_id is not null and i.input_id=p_cost_id));
$$;

create or replace function public.prepare_quote_origin(p_round_id uuid,p_project_id uuid,p_data jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare r public.quote_rounds; req public.material_requests; requested uuid:=nullif(p_data->>'requestId','')::uuid; snap jsonb;
begin
 select * into r from public.quote_rounds where id=p_round_id and project_id=p_project_id and company_id=public.current_company_id() for update;
 if not found then raise exception 'Rodada não autorizada.'; end if;
 if r.trace_version>0 or exists(select 1 from public.quotations where round_id=r.id) then
  if requested is distinct from r.request_id then raise exception 'A origem da rodada não pode mudar. Use a solicitação original.'; end if;
  return;
 end if;
 snap:=public.capture_budget_origin(p_project_id);
 if requested is not null then
  select * into req from public.material_requests where id=requested and company_id=r.company_id and project_id=p_project_id and status in ('PENDING','APPROVED','QUOTING') for update;
  if not found then raise exception 'Solicitação indisponível ou de outra obra.'; end if;
  if exists(select 1 from public.quote_rounds where request_id=req.id and id<>r.id) then raise exception 'Esta solicitação já possui rodada. Adicione outra proposta à rodada existente.'; end if;
  if not exists(select 1 from public.material_request_items where request_id=req.id) then raise exception 'Solicitação sem itens.'; end if;
  snap:=snap||jsonb_build_object('request',jsonb_build_object('id',req.id,'number',req.number,'neededBy',req.needed_by,'notes',req.notes,'items',(select jsonb_agg(to_jsonb(i) order by i.id) from public.material_request_items i where request_id=req.id)));
  update public.material_requests set status='QUOTING' where id=req.id;
 end if;
 update public.quote_rounds set request_id=requested,budget_id=(snap->'budget'->>'id')::uuid,origin_snapshot=snap,trace_version=1 where id=r.id;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(r.company_id,p_project_id,auth.uid(),'QUOTE_ORIGIN_LINKED',r.id,snap);
end $$;

create or replace function public.link_quote_items(p_quote_id uuid,p_data jsonb) returns void
language plpgsql security definer set search_path='' as $$
declare q public.quotations; r public.quote_rounds; line public.quotation_items; reqline public.material_request_items; supplied jsonb; reqid uuid; refs jsonb; ids uuid[]:='{}';
begin
 select * into q from public.quotations where id=p_quote_id and company_id=public.current_company_id();
 if not found then raise exception 'Cotação não autorizada.'; end if;
 select * into r from public.quote_rounds where id=q.round_id;
 if r.request_id is not null and jsonb_array_length(p_data->'items')<>(select count(*) from public.material_request_items where request_id=r.request_id) then raise exception 'Use todos os itens e quantidades da solicitação.'; end if;
 for line in select * from public.quotation_items where quotation_id=q.id loop
  reqid:=null;
  select x into supplied from jsonb_array_elements(p_data->'items') x where (x->>'inputId')::uuid=coalesce(line.catalog_input_id,line.cost_input_id) and x->>'source'=case when line.catalog_input_id is not null then 'shared' else 'company' end;
  if r.request_id is not null then
   reqid:=nullif(supplied->>'requestItemId','')::uuid;
   select * into reqline from public.material_request_items where id=reqid and request_id=r.request_id;
   if not found or reqid=any(ids) or reqline.quantity<>line.quantity or lower(btrim(reqline.unit))<>lower(btrim(line.unit)) then raise exception 'Item, unidade ou quantidade diverge da solicitação.'; end if;
   if (reqline.catalog_input_id is not null and reqline.catalog_input_id is distinct from line.catalog_input_id) or (reqline.cost_input_id is not null and reqline.cost_input_id is distinct from line.cost_input_id) then raise exception 'Não substitua o insumo identificado na solicitação.'; end if;
   ids:=array_append(ids,reqid);
  elsif nullif(supplied->>'requestItemId','') is not null then raise exception 'Item de solicitação sem origem vinculada.';
  end if;
  refs:=public.budget_item_references(r.budget_id,line.catalog_input_id,line.cost_input_id,line.unit);
  update public.quotation_items set request_item_id=reqid,budget_refs=refs,budget_item_id=case when jsonb_array_length(refs)=1 then (refs->0->>'id')::uuid end where id=line.id;
 end loop;
 update public.quotations set request_id=r.request_id where id=q.id;
 -- A legacy text item must keep the same explicit mapping across competing proposals.
 if r.request_id is not null and exists(select 1 from public.quotation_items a join public.quotations qa on qa.id=a.quotation_id join public.quotation_items b on b.request_item_id=a.request_item_id and b.quotation_id=q.id where qa.round_id=r.id and qa.id<>q.id and (a.catalog_input_id is distinct from b.catalog_input_id or a.cost_input_id is distinct from b.cost_input_id)) then raise exception 'Mantenha a associação de insumos da primeira proposta.'; end if;
end $$;

create or replace function public.capture_order_origin() returns trigger language plpgsql security definer set search_path='' as $$
declare q public.quotations; r public.quote_rounds;
begin
 if tg_op='UPDATE' then
  if new.request_id is distinct from old.request_id or new.budget_id is distinct from old.budget_id or new.origin_snapshot is distinct from old.origin_snapshot or new.trace_version<>old.trace_version or new.quotation_id is distinct from old.quotation_id then raise exception 'A origem de um pedido é imutável.'; end if;
  return new;
 end if;
 new.request_id:=null;
 if new.quotation_id is not null then
  select * into q from public.quotations where id=new.quotation_id and company_id=new.company_id and project_id=new.project_id;
  if not found then raise exception 'Cotação de origem não autorizada.'; end if;
  select * into r from public.quote_rounds where id=q.round_id;
  new.request_id:=r.request_id;new.budget_id:=r.budget_id;new.trace_version:=coalesce(r.trace_version,0);
  new.origin_snapshot:=coalesce(r.origin_snapshot,'{}'::jsonb)||jsonb_build_object('quote',jsonb_build_object('id',q.id,'number',q.number,'roundId',r.id,'roundTitle',r.title));
 else
  new.origin_snapshot:=public.capture_budget_origin(new.project_id);new.budget_id:=(new.origin_snapshot->'budget'->>'id')::uuid;new.trace_version:=1;
 end if;
 return new;
end $$;
drop trigger if exists capture_order_trace on public.purchase_orders;
create trigger capture_order_trace before insert or update on public.purchase_orders for each row execute function public.capture_order_origin();

create or replace function public.capture_order_item_origin() returns trigger language plpgsql security definer set search_path='' as $$
declare o public.purchase_orders; qi public.quotation_items; refs jsonb;
begin
 if tg_op='UPDATE' then
  if new.request_item_id is distinct from old.request_item_id or new.quotation_item_id is distinct from old.quotation_item_id or new.budget_item_id is distinct from old.budget_item_id or new.budget_refs is distinct from old.budget_refs then raise exception 'A referência orçamentária do item é imutável.'; end if;
  return new;
 end if;
 select * into o from public.purchase_orders where id=new.order_id and company_id=public.current_company_id();
 if not found then raise exception 'Pedido não autorizado.'; end if;
 new.request_item_id:=null;new.quotation_item_id:=null;
 if o.quotation_id is not null then
  select * into qi from public.quotation_items where quotation_id=o.quotation_id and catalog_input_id is not distinct from new.catalog_input_id and cost_input_id is not distinct from new.cost_input_id and lower(btrim(unit))=lower(btrim(new.unit));
  if not found then raise exception 'Item não pertence à cotação de origem.'; end if;
  new.request_item_id:=qi.request_item_id;new.quotation_item_id:=qi.id;refs:=qi.budget_refs;
 else refs:=public.budget_item_references(o.budget_id,new.catalog_input_id,new.cost_input_id,new.unit);
 end if;
 new.budget_refs:=coalesce(refs,'[]'::jsonb);new.budget_item_id:=case when jsonb_array_length(new.budget_refs)=1 then (new.budget_refs->0->>'id')::uuid end;
 return new;
end $$;
drop trigger if exists capture_order_item_trace on public.purchase_order_items;
create trigger capture_order_item_trace before insert or update on public.purchase_order_items for each row execute function public.capture_order_item_origin();

create or replace function public.sync_request_procurement_status() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.request_id is not null then
  update public.material_requests set status=case when new.status='CANCELLED' then 'CANCELLED' when new.status='RECEIVED' then 'RECEIVED' when new.status='PARTIALLY_RECEIVED' then 'PARTIALLY_RECEIVED' else 'ORDERED' end where id=new.request_id and company_id=new.company_id and project_id=new.project_id;
 end if;
 return new;
end $$;
drop trigger if exists request_order_status on public.purchase_orders;
create trigger request_order_status after insert or update of status on public.purchase_orders for each row execute function public.sync_request_procurement_status();

create or replace function public.procurement_origins(p_project_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING') or not exists(select 1 from public.projects p join public.companies c on c.id=p.company_id where p.id=p_project_id and c.id=public.current_company_id() and c.active) then raise exception 'Obra ou perfil não autorizado.'; end if;
 return jsonb_build_object('requests',coalesce((select jsonb_agg(to_jsonb(r)||jsonb_build_object('round',(select to_jsonb(qr) from public.quote_rounds qr where request_id=r.id),'items',(select jsonb_agg(to_jsonb(i) order by i.id) from public.material_request_items i where request_id=r.id)) order by r.created_at desc) from public.material_requests r where company_id=public.current_company_id() and project_id=p_project_id and status not in ('REJECTED','CANCELLED')),'[]'::jsonb),'budget',(select jsonb_build_object('id',b.id,'number',b.number,'revision',b.revision_number,'baseDate',b.base_date) from public.projects p join public.budgets b on b.id=p.baseline_budget_id where p.id=p_project_id and b.company_id=public.current_company_id()));
end $$;

-- Patch only integration points; keep existing supplier, idempotency and price validation fixes.
do $$ declare def text; target text; begin
 select replace(pg_get_functiondef('public.procurement_action_internal(text,uuid,jsonb)'::regprocedure),E'\r','') into def;
 if position('public.link_request_catalog' in def)=0 then
  target:=' elsif p_action=''ORDER'' then';if position(target in def)=0 then raise exception 'Revisar definição da operação.'; end if;
  execute replace(def,target,E'  perform public.link_request_catalog(entity,p_data);\n'||target);
 end if;
 select replace(pg_get_functiondef('public.save_comparable_quote(uuid,jsonb)'::regprocedure),E'\r','') into def;
 if position('public.prepare_quote_origin' in def)=0 then
  target:=' sid:=public.resolve_supplier';if position(target in def)=0 then raise exception 'Aplicar fornecedores antes da rastreabilidade.'; end if;
  def:=replace(def,target,E' perform public.prepare_quote_origin(rid,p_project_id,p_data);\n'||target);
  target:=' update public.quotations set total=round(subtotal+f+t-d,2) where id=qid;';if position(target in def)=0 then raise exception 'Revisar fechamento da cotação.'; end if;
  def:=replace(def,target,E' perform public.link_quote_items(qid,p_data);\n'||target);execute def;
 end if;
end $$;
revoke all on function public.link_request_catalog(uuid,jsonb),public.capture_budget_origin(uuid),public.budget_item_references(uuid,uuid,uuid,text),public.prepare_quote_origin(uuid,uuid,jsonb),public.link_quote_items(uuid,jsonb),public.procurement_origins(uuid) from public,anon,authenticated;
grant execute on function public.procurement_origins(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
