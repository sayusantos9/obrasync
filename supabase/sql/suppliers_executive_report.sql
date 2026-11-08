begin;

-- Preserve historic suppliers and references. All edits go through an audited RPC.
create or replace function public.guard_supplier_identity() returns trigger
language plpgsql set search_path='' as $$
begin
 new.name:=btrim(new.name);
 new.document:=nullif(upper(regexp_replace(coalesce(new.document,''),'[^a-zA-Z0-9]','','g')),'');
 if length(new.name) not between 2 and 160 then raise exception 'Informe um nome de fornecedor entre 2 e 160 caracteres.'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.company_id::text||':suppliers',0));
 if (tg_op='INSERT' or lower(new.name) is distinct from lower(old.name)) and exists(select 1 from public.suppliers where company_id=new.company_id and id<>new.id and lower(btrim(name))=lower(new.name)) then raise exception 'Já existe fornecedor com esse nome. Edite ou reative o cadastro.'; end if;
 if new.document is not null and (tg_op='INSERT' or new.document is distinct from old.document) and exists(select 1 from public.suppliers where company_id=new.company_id and id<>new.id and upper(regexp_replace(coalesce(document,''),'[^a-zA-Z0-9]','','g'))=new.document) then raise exception 'Documento já cadastrado nesta empresa.'; end if;
 return new;
end $$;
drop trigger if exists supplier_identity on public.suppliers;
create trigger supplier_identity before insert or update on public.suppliers for each row execute function public.guard_supplier_identity();
revoke insert,update,delete on public.suppliers from authenticated,anon;

create or replace function public.save_supplier(p_data jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare cid uuid:=public.current_company_id(); sid uuid:=nullif(p_data->>'id','')::uuid; previous public.suppliers; doc text; mail text; v_phone text;
begin
 if auth.uid() is null or coalesce(public.current_app_role(),'') not in ('MASTER','PURCHASING') or not exists(select 1 from public.companies where id=cid and active) then raise exception 'Somente Gestor e Compras podem editar fornecedores.'; end if;
 doc:=nullif(upper(regexp_replace(coalesce(p_data->>'document',''),'[^a-zA-Z0-9]','','g')),'');
 mail:=nullif(lower(btrim(p_data->>'email')),'');v_phone:=nullif(btrim(p_data->>'phone'),'');
 if nullif(btrim(p_data->>'name'),'') is null then raise exception 'Informe o nome do fornecedor.'; end if;
 if doc is not null and length(doc) not between 5 and 20 then raise exception 'Revise a identificação do fornecedor (5 a 20 letras ou números).'; end if;
 if mail is not null and (length(mail)>254 or mail !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then raise exception 'E-mail inválido.'; end if;
 if v_phone is not null and length(regexp_replace(v_phone,'[^0-9]','','g')) not between 10 and 15 then raise exception 'Informe telefone com DDD (10 a 15 dígitos).'; end if;
 if length(coalesce(p_data->>'contactName',''))>120 then raise exception 'Nome do contato muito longo.'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(cid::text||':suppliers',0));
 if sid is not null then
  select * into previous from public.suppliers where id=sid and company_id=cid for update;
  if not found then raise exception 'Fornecedor não autorizado.'; end if;
  if nullif(p_data->>'updatedAt','')::timestamptz is distinct from previous.updated_at then raise exception 'Este cadastro foi alterado. Atualize a lista antes de editar novamente.'; end if;
  update public.suppliers set name=btrim(p_data->>'name'),document=doc,email=mail,phone=v_phone,contact_name=nullif(btrim(p_data->>'contactName'),''),active=coalesce((p_data->>'active')::boolean,true),updated_at=clock_timestamp() where id=sid;
 else
  insert into public.suppliers(company_id,name,document,email,phone,contact_name,active) values(cid,btrim(p_data->>'name'),doc,mail,v_phone,nullif(btrim(p_data->>'contactName'),''),true) returning id into sid;
 end if;
 insert into public.operation_audit(company_id,actor_id,action,entity_id,details) values(cid,auth.uid(),case when previous.id is null then 'SUPPLIER_CREATED' else 'SUPPLIER_UPDATED' end,sid,jsonb_build_object('previous',to_jsonb(previous),'current',(select to_jsonb(s) from public.suppliers s where id=sid)));
 return sid;
end $$;

create or replace function public.list_suppliers() returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING') or not exists(select 1 from public.companies where id=public.current_company_id() and active) then raise exception 'Perfil não autorizado.'; end if;
 return coalesce((select jsonb_agg(to_jsonb(s) order by lower(s.name),s.id) from public.suppliers s where company_id=public.current_company_id()),'[]'::jsonb);
end $$;

-- Shared resolver keeps older app builds compatible; current forms send the stable ID.
create or replace function public.resolve_supplier(p_id uuid,p_name text) returns uuid
language plpgsql security definer set search_path='' as $$
declare cid uuid:=public.current_company_id(); sid uuid;
begin
 if auth.uid() is null or coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING') or not exists(select 1 from public.companies where id=cid and active) then raise exception 'Perfil não autorizado.'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(cid::text||':suppliers',0));
 if p_id is not null then
  select id into sid from public.suppliers where id=p_id and company_id=cid and active for share;
  if sid is null then raise exception 'Fornecedor inativo ou não autorizado. Atualize a seleção.'; end if;
 else
  select id into sid from public.suppliers where company_id=cid and lower(btrim(name))=lower(btrim(p_name)) and active order by id limit 1 for share;
  if sid is null then insert into public.suppliers(company_id,name) values(cid,btrim(p_name)) returning id into sid; end if;
 end if;
 return sid;
end $$;

-- Replace only the supplier lookup in the current deployed functions, keeping other fixes intact.
do $$ declare def text; original text; replacement text; begin
 select pg_get_functiondef('public.save_comparable_quote(uuid,jsonb)'::regprocedure) into def;
 original:=E' select id into sid from public.suppliers where company_id=cid and lower(btrim(name))=lower(btrim(p_data->>''supplierName'')) and active order by id limit 1;\n if sid is null then insert into public.suppliers(company_id,name) values(cid,btrim(p_data->>''supplierName'')) returning id into sid; end if;';
 replacement:=E' sid:=public.resolve_supplier(nullif(p_data->>''supplierId'','''')::uuid,p_data->>''supplierName'');\n p_data:=p_data|| (select jsonb_build_object(''supplierName'',name,''supplierDocument'',document,''supplierContact'',contact_name,''supplierEmail'',email) from public.suppliers where id=sid);';
 if position('public.resolve_supplier' in def)=0 then
  if position(original in def)=0 then raise exception 'Definição da cotação divergiu. Revisar migração.'; end if;
  execute replace(def,original,replacement);
 end if;
 select pg_get_functiondef('public.procurement_action_internal(text,uuid,jsonb)'::regprocedure) into def;
 def:=replace(def,E'\r','');
 original:=E'  select id into supplier from public.suppliers where company_id=cid and name=btrim(p_data->>''supplier'') and active limit 1;\n  if supplier is null then insert into public.suppliers(company_id,name) values(cid,btrim(p_data->>''supplier'')) returning id into supplier; end if;';
 if position('public.resolve_supplier' in def)=0 then
  if position(original in def)=0 then raise exception 'Definição do pedido divergiu. Revisar migração.'; end if;
  execute replace(def,original,'  supplier:=public.resolve_supplier(nullif(p_data->>''supplierId'','''')::uuid,p_data->>''supplier'');');
 end if;
end $$;

-- Inactive suppliers remain on historical documents but cannot receive new orders/proposals.
create or replace function public.guard_operation_supplier() returns trigger language plpgsql set search_path='' as $$
begin
 if new.supplier_id is not null then
  perform 1 from public.suppliers where id=new.supplier_id and company_id=new.company_id and active for share;
  if not found then raise exception 'Fornecedor inativo ou de outra empresa.'; end if;
 end if;
 return new;
end $$;
drop trigger if exists order_supplier_guard on public.purchase_orders;
create trigger order_supplier_guard before insert or update of supplier_id on public.purchase_orders for each row execute function public.guard_operation_supplier();
drop trigger if exists quote_supplier_guard on public.quotations;
create trigger quote_supplier_guard before insert or update of supplier_id on public.quotations for each row execute function public.guard_operation_supplier();

-- Single database snapshot, scoped to one authorized project, without REST row limits.
create or replace function public.executive_report_snapshot(p_project_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare cid uuid:=public.current_company_id(); p public.projects; result jsonb;
begin
 if auth.uid() is null or coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING') or not exists(select 1 from public.companies where id=cid and active) then raise exception 'Perfil não autorizado ao relatório executivo.'; end if;
 select * into p from public.projects where id=p_project_id and company_id=cid;
 if not found then raise exception 'Obra não autorizada.'; end if;
 select jsonb_build_object(
  'generatedAt',now(),'project',jsonb_build_object('id',p.id,'name',p.name,'baseline_budget_id',p.baseline_budget_id),
  'baseline',(select to_jsonb(b)||jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from public.budget_items i where budget_id=b.id),'[]'::jsonb)) from public.budgets b where id=p.baseline_budget_id and company_id=cid and project_id=p.id and deleted_at is null),
  'orders',coalesce((select jsonb_agg(to_jsonb(o)||jsonb_build_object('supplier_name',(select name from public.suppliers where id=o.supplier_id and company_id=cid),'items',coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from public.purchase_order_items i where order_id=o.id),'[]'::jsonb)) order by o.created_at,o.id) from public.purchase_orders o where company_id=cid and project_id=p.id),'[]'::jsonb),
  'receipts',coalesce((select jsonb_agg(to_jsonb(r)||jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from public.receipt_items i where receipt_id=r.id),'[]'::jsonb)) order by r.received_at,r.id) from public.receipts r where company_id=cid and project_id=p.id),'[]'::jsonb),
  'stock',coalesce((select jsonb_agg(to_jsonb(s)||jsonb_build_object('material',to_jsonb(m)) order by s.id) from public.stock_items s join public.materials m on m.id=s.material_id and m.company_id=cid where s.company_id=cid and s.project_id=p.id),'[]'::jsonb),
  'movements',coalesce((select jsonb_agg(to_jsonb(m) order by m.created_at,m.id) from public.stock_movements m where company_id=cid and (project_id=p.id or destination_project_id=p.id)),'[]'::jsonb),
  'expenses',coalesce((select jsonb_agg(to_jsonb(e) order by e.expense_date,e.id) from public.expenses e where company_id=cid and project_id=p.id),'[]'::jsonb)
 ) into result;
 return result;
end $$;
revoke all on function public.save_supplier(jsonb),public.list_suppliers(),public.resolve_supplier(uuid,text),public.executive_report_snapshot(uuid) from public,anon;
grant execute on function public.save_supplier(jsonb),public.list_suppliers(),public.executive_report_snapshot(uuid) to authenticated;
revoke all on function public.resolve_supplier(uuid,text) from authenticated;
notify pgrst,'reload schema';
commit;
