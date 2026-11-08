begin;
create table if not exists public.quote_rounds(
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id),
 project_id uuid not null references public.projects(id), title text not null,
 awarded_quote_id uuid references public.quotations(id), order_id uuid references public.purchase_orders(id),
 award_reason text, awarded_by uuid references auth.users(id), awarded_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.quote_rounds enable row level security;
drop policy if exists quote_round_read on public.quote_rounds;
create policy quote_round_read on public.quote_rounds for select to authenticated using(company_id=public.current_company_id() and public.current_app_role() in ('MASTER','ENGINEERING','PURCHASING'));
grant select on public.quote_rounds to authenticated;
revoke insert,update,delete on public.quote_rounds from authenticated,anon;
alter table public.quotations add column if not exists round_id uuid references public.quote_rounds(id);
alter table public.quotations add column if not exists freight numeric not null default 0;
alter table public.quotations add column if not exists taxes numeric not null default 0;
alter table public.quotations add column if not exists discount numeric not null default 0;
alter table public.quotations add column if not exists expected_at date;
alter table public.quotation_items add column if not exists catalog_input_id uuid references public.input_catalog(id);
alter table public.quotation_items add column if not exists cost_input_id uuid references public.cost_inputs(id);
alter table public.quotation_items add column if not exists input_code text;
alter table public.quotation_items add column if not exists input_type text;
create unique index if not exists quote_round_supplier_unique on public.quotations(round_id,supplier_id) where deleted_at is null;
revoke insert,update,delete on public.quotations,public.quotation_items from authenticated,anon;
revoke execute on function public.save_material_quote(uuid,text,date,text,jsonb) from authenticated;
create or replace function public.save_comparable_quote(p_project_id uuid,p_data jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare cid uuid:=public.current_company_id(); rid uuid; qid uuid:=gen_random_uuid(); sid uuid; line jsonb;
 code text; description text; unit text; kind text; qty numeric; price numeric; subtotal numeric:=0;
 f numeric:=coalesce((p_data->>'freight')::numeric,0); t numeric:=coalesce((p_data->>'taxes')::numeric,0); d numeric:=coalesce((p_data->>'discount')::numeric,0);
 first_id uuid; basket jsonb; reference_basket jsonb; input uuid; company_input uuid; catalog_input uuid;
begin
 if auth.uid() is null or coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING')
 or not exists(select 1 from public.companies where id=cid and active)
 or not exists(select 1 from public.projects where id=p_project_id and company_id=cid) then raise exception 'Obra ou perfil não autorizado.'; end if;
 if nullif(btrim(p_data->>'title'),'') is null or nullif(btrim(p_data->>'supplierName'),'') is null then raise exception 'Informe título e fornecedor.'; end if;
 if nullif(p_data->>'validUntil','') is null or (p_data->>'validUntil')::date<current_date or nullif(p_data->>'expectedAt','') is null then raise exception 'Informe validade vigente e entrega prevista.'; end if;
 if jsonb_typeof(p_data->'items') is distinct from 'array' or jsonb_array_length(p_data->'items') not between 1 and 500 then raise exception 'Informe de 1 a 500 itens.'; end if;
 if least(f,t,d)<0 or f::text in ('NaN','Infinity') or t::text in ('NaN','Infinity') or d::text in ('NaN','Infinity') then raise exception 'Custos adicionais inválidos.'; end if;
 rid:=nullif(p_data->>'roundId','')::uuid;
 if rid is null then
  if nullif(btrim(p_data->>'roundTitle'),'') is null then raise exception 'Informe a rodada.'; end if;
  insert into public.quote_rounds(company_id,project_id,title) values(cid,p_project_id,btrim(p_data->>'roundTitle')) returning id into rid;
 else
  perform 1 from public.quote_rounds where id=rid and project_id=p_project_id and company_id=cid and awarded_quote_id is null for update;
  if not found then raise exception 'Rodada encerrada ou não autorizada.'; end if;
 end if;
 select id into sid from public.suppliers where company_id=cid and lower(btrim(name))=lower(btrim(p_data->>'supplierName')) and active order by id limit 1;
 if sid is null then insert into public.suppliers(company_id,name) values(cid,btrim(p_data->>'supplierName')) returning id into sid; end if;
 insert into public.quotations(id,company_id,project_id,round_id,supplier_id,number,status,total,expires_at,expected_at,freight,taxes,discount,notes,created_by)
 values(qid,cid,p_project_id,rid,sid,'COT-'||upper(left(qid::text,8)),'OPEN',0,(p_data->>'validUntil')::date,(p_data->>'expectedAt')::date,f,t,d,'OBRASYNC_QUOTE_V1:'||jsonb_build_object('title',btrim(p_data->>'title'),'supplierName',btrim(p_data->>'supplierName'),'supplierDocument',p_data->>'supplierDocument','supplierContact',p_data->>'supplierContact','supplierEmail',p_data->>'supplierEmail','clientName',p_data->>'clientName','clientDocument',p_data->>'clientDocument','paymentTerms',p_data->>'paymentTerms','notes',p_data->>'notes')::text,auth.uid());
 for line in select * from jsonb_array_elements(p_data->'items') loop
  input:=(line->>'inputId')::uuid; code:=null;company_input:=null;catalog_input:=null;
  if line->>'source'='shared' then
   select c.catalog_code,c.description,c.unit,c.input_type into code,description,unit,kind from public.input_catalog c where id=input and catalog_active;
   catalog_input:=input;
  elsif line->>'source'='company' then
   select c.code,c.description,c.unit,c.input_type into code,description,unit,kind from public.cost_inputs c where id=input and company_id=cid;
   company_input:=input;
  end if;
  if code is null or code is distinct from line->>'code' or kind not in ('MATERIAL','EQUIPMENT') or lower(btrim(unit)) is distinct from lower(btrim(line->>'unit')) then raise exception 'Código ou unidade incompatível com o catálogo.'; end if;
  if exists(select 1 from public.quotation_items where quotation_id=qid and (catalog_input_id=catalog_input or cost_input_id=company_input)) then raise exception 'Insumo duplicado. Consolide a quantidade.'; end if;
  qty:=(line->>'quantity')::numeric;price:=(line->>'unitPrice')::numeric;
  if qty is null or price is null or qty<=0 or price<0 or qty::text in ('NaN','Infinity') or price::text in ('NaN','Infinity') then raise exception 'Quantidade ou preço inválido.'; end if;
  insert into public.quotation_items(quotation_id,catalog_input_id,cost_input_id,input_code,input_type,description,quantity,unit,unit_price)
  values(qid,catalog_input,company_input,code,kind,description,qty,unit,price);
  subtotal:=subtotal+round(qty*price,2);
 end loop;
 if d>subtotal+f+t then raise exception 'Desconto maior que o total.'; end if;
 select id into first_id from public.quotations where round_id=rid and id<>qid and deleted_at is null order by created_at,id limit 1;
 if first_id is not null then
  select jsonb_agg(jsonb_build_array(catalog_input_id,cost_input_id,lower(btrim(i.unit)),quantity) order by coalesce(catalog_input_id,cost_input_id)) into basket from public.quotation_items i where quotation_id=qid;
  select jsonb_agg(jsonb_build_array(catalog_input_id,cost_input_id,lower(btrim(i.unit)),quantity) order by coalesce(catalog_input_id,cost_input_id)) into reference_basket from public.quotation_items i where quotation_id=first_id;
  if basket is distinct from reference_basket then raise exception 'Use os mesmos insumos, unidades e quantidades da rodada. Altere apenas preços e condições.'; end if;
 end if;
 update public.quotations set total=round(subtotal+f+t-d,2) where id=qid;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(cid,p_project_id,auth.uid(),'QUOTE_CREATED',qid,jsonb_build_object('round',rid));
 return qid;
end $$;
create or replace function public.award_quote(p_quote_id uuid,p_reason text) returns uuid
language plpgsql security definer set search_path='' as $$
declare q public.quotations; r public.quote_rounds; oid uuid; candidates jsonb;
begin
 if auth.uid() is null or public.current_app_role() is distinct from 'MASTER' or not exists(select 1 from public.companies where id=public.current_company_id() and active) then raise exception 'Somente o Gestor pode aprovar a escolha.'; end if;
 select * into q from public.quotations where id=p_quote_id and company_id=public.current_company_id() and deleted_at is null;
 if not found or q.round_id is null then raise exception 'Cotação não comparável.'; end if;
 select * into r from public.quote_rounds where id=q.round_id and company_id=q.company_id and project_id=q.project_id for update;
 if not found then raise exception 'Rodada não autorizada.'; end if;
 select * into q from public.quotations where id=p_quote_id and deleted_at is null;
 if not found then raise exception 'A proposta foi arquivada. Atualize a rodada.'; end if;
 if r.awarded_quote_id=p_quote_id then return r.order_id; end if;
 if r.awarded_quote_id is not null then raise exception 'Esta rodada já tem uma escolha aprovada.'; end if;
 if length(btrim(coalesce(p_reason,'')))<10 then raise exception 'Justifique a escolha em pelo menos 10 caracteres.'; end if;
 if q.expires_at<current_date or q.expires_at is null then raise exception 'A proposta venceu. Cadastre uma proposta vigente.'; end if;
 if (select count(distinct supplier_id) from public.quotations where round_id=r.id and deleted_at is null and expires_at>=current_date)<2 then raise exception 'Cadastre ao menos dois fornecedores com propostas vigentes na rodada.'; end if;
 insert into public.purchase_orders(company_id,project_id,supplier_id,quotation_id,number,status,total,expected_at,created_by,freight,taxes,discount,notes)
 values(q.company_id,q.project_id,q.supplier_id,q.id,'PED-'||upper(left(gen_random_uuid()::text,8)),'OPEN',q.total,q.expected_at,auth.uid(),q.freight,q.taxes,q.discount,'Escolha da rodada: '||r.title||E'\nJustificativa: '||btrim(p_reason)||E'\nCondições da proposta: '||coalesce(q.notes,'')) returning id into oid;
 insert into public.purchase_order_items(order_id,catalog_input_id,cost_input_id,description,quantity,unit,unit_price)
 select oid,catalog_input_id,cost_input_id,description,quantity,unit,unit_price from public.quotation_items where quotation_id=q.id;
 perform public.procurement_action('APPROVE',q.project_id,jsonb_build_object('id',oid));
 update public.quote_rounds set awarded_quote_id=q.id,order_id=oid,award_reason=btrim(p_reason),awarded_by=auth.uid(),awarded_at=now() where id=r.id;
 select jsonb_agg(jsonb_build_object('id',id,'supplier',supplier_id,'total',total,'expires',expires_at)) into candidates from public.quotations where round_id=r.id and deleted_at is null;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(q.company_id,q.project_id,auth.uid(),'QUOTE_AWARDED',q.id,jsonb_build_object('round',r.id,'order',oid,'reason',btrim(p_reason),'candidates',candidates));
 return oid;
end $$;
create or replace function public.guard_awarded_quote() returns trigger language plpgsql set search_path='' as $$
begin
 if new.deleted_at is not null and old.round_id is not null then
  perform 1 from public.quote_rounds where id=old.round_id for update;
  if exists(select 1 from public.quote_rounds where id=old.round_id and awarded_quote_id is not null) then raise exception 'Propostas da rodada aprovada devem ser preservadas para auditoria.'; end if;
 end if;
 return new;
end $$;
drop trigger if exists awarded_quote_archive on public.quotations;
create trigger awarded_quote_archive before update on public.quotations for each row execute function public.guard_awarded_quote();
revoke all on function public.save_comparable_quote(uuid,jsonb),public.award_quote(uuid,text) from public,anon;
grant execute on function public.save_comparable_quote(uuid,jsonb),public.award_quote(uuid,text) to authenticated;
commit;
