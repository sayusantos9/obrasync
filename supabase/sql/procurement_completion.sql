alter table public.purchase_orders add column if not exists purchased_at timestamptz;
alter table public.purchase_orders add column if not exists purchased_by uuid references auth.users(id);
alter table public.expenses add column if not exists supplier_name text;
alter table public.expenses add column if not exists notes text;
revoke insert,update,delete on public.expenses from authenticated;
create or replace function public.procurement_action(p_action text,p_project_id uuid,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
<<operation>>
declare
 cid uuid:=public.current_company_id(); uid uuid:=auth.uid(); role_name text:=coalesce(public.current_app_role(),'');
 entity uuid; supplier uuid; item jsonb; catalog public.input_catalog; order_row public.purchase_orders; line public.purchase_order_items;
 material uuid; qty numeric; price numeric; base numeric:=0; received uuid; planned public.budget_items;
 freight numeric; taxes numeric; discount numeric; result jsonb; destination uuid; balance numeric;
begin
 if uid is null or cid is null or not exists(select 1 from public.companies where id=cid and active)
 or not exists(select 1 from public.projects where id=p_project_id and company_id=cid) then raise exception 'Obra não autorizada.'; end if;
 if p_action='REQUEST' then
  if role_name not in ('MASTER','PURCHASING','REQUESTER') then raise exception 'Perfil não autorizado.'; end if;
  qty:=(p_data->>'quantity')::numeric;
  if qty is null or qty<=0 or qty::text in ('NaN','Infinity','-Infinity') or nullif(btrim(p_data->>'material'),'') is null or nullif(btrim(p_data->>'unit'),'') is null then raise exception 'Revise insumo, quantidade e unidade.'; end if;
  insert into public.material_requests(company_id,project_id,requester_id,number,needed_by,notes)
  values(cid,p_project_id,uid,'SOL-'||gen_random_uuid()::text,nullif(p_data->>'neededAt','')::date,p_data->>'justification') returning id into entity;
  insert into public.material_request_items(request_id,material_name,quantity,unit) values(entity,p_data->>'material',qty,p_data->>'unit');
 elsif p_action='ORDER' then
  if role_name not in ('MASTER','PURCHASING') then raise exception 'Perfil não autorizado.'; end if;
  if jsonb_typeof(p_data->'items') is distinct from 'array' or jsonb_array_length(p_data->'items')=0 then raise exception 'Adicione insumos ao pedido.'; end if;
  if nullif(btrim(p_data->>'supplier'),'') is null then raise exception 'Informe fornecedor.'; end if;
  -- Name reuse only within the company; no cross-tenant lookup.
  select id into supplier from public.suppliers where company_id=cid and name=btrim(p_data->>'supplier') and active limit 1;
  if supplier is null then insert into public.suppliers(company_id,name) values(cid,btrim(p_data->>'supplier')) returning id into supplier; end if;
  freight:=coalesce(nullif(p_data->>'freight','')::numeric,0); taxes:=coalesce(nullif(p_data->>'taxes','')::numeric,0); discount:=coalesce(nullif(p_data->>'discount','')::numeric,0);
  if least(freight,taxes,discount)<0 or freight::text in ('NaN','Infinity') or taxes::text in ('NaN','Infinity') or discount::text in ('NaN','Infinity') then raise exception 'Custos adicionais inválidos.'; end if;
  insert into public.purchase_orders(company_id,project_id,supplier_id,number,status,total,expected_at,created_by,freight,taxes,discount)
  values(cid,p_project_id,supplier,'PED-'||gen_random_uuid()::text,'OPEN',0,nullif(p_data->>'expectedAt','')::date,uid,freight,taxes,discount) returning id into entity;
  for item in select * from jsonb_array_elements(p_data->'items') loop
   select * into catalog from public.input_catalog where catalog_code=item->>'code';
   if not found then raise exception 'Código de catálogo inválido: %',item->>'code'; end if;
   if lower(btrim(item->>'unit')) is distinct from lower(btrim(catalog.unit)) then raise exception 'Unidade incompatível. Use %; conversão precisa ser validada.',catalog.unit; end if;
   qty:=(item->>'quantity')::numeric; price:=(item->>'unitPrice')::numeric;
   if qty is null or price is null or qty<=0 or price<0 or qty::text in ('NaN','Infinity') or price::text in ('NaN','Infinity') then raise exception 'Quantidade ou preço inválido.'; end if;
   insert into public.purchase_order_items(order_id,catalog_input_id,description,quantity,unit,unit_price)
   values(entity,catalog.id,catalog.description,qty,catalog.unit,price);
   base:=base+round(qty*price,2);
  end loop;
  if discount>base+freight+taxes then raise exception 'Desconto maior que o valor do pedido.'; end if;
  update public.purchase_orders set total=base+operation.freight+operation.taxes-operation.discount where id=entity;
 elsif p_action in ('APPROVE','REJECT') then
  if role_name<>'MASTER' then raise exception 'Somente o gestor pode decidir.'; end if;
  select * into order_row from public.purchase_orders where id=(p_data->>'id')::uuid and company_id=cid and project_id=p_project_id for update;
  if not found or order_row.approval_status<>'PENDING' then raise exception 'Pedido não disponível para decisão.'; end if;
  entity:=order_row.id;
  update public.purchase_orders set approval_status=case when p_action='APPROVE' then 'APPROVED' else 'REJECTED' end,
   approved_by=uid,approved_at=now(),status=case when p_action='APPROVE' then 'SENT' else 'CANCELLED' end where id=entity;
 elsif p_action='PURCHASE' then
  if role_name not in ('MASTER','PURCHASING') then raise exception 'Perfil não autorizado.'; end if;
  select * into order_row from public.purchase_orders where id=(p_data->>'id')::uuid and company_id=cid and project_id=p_project_id for update;
  if not found or order_row.approval_status<>'APPROVED' or order_row.purchased_at is not null or order_row.status='CANCELLED' then raise exception 'Pedido indisponível para confirmar compra.'; end if;
  entity:=order_row.id;
  update public.purchase_orders set purchased_at=now(),purchased_by=uid where id=entity;
 elsif p_action='STOCK' then
  if role_name not in ('MASTER','PURCHASING','REQUESTER') then raise exception 'Perfil não autorizado.'; end if;
  qty:=(p_data->>'quantity')::numeric;
  if qty is null or qty<=0 or qty::text in ('NaN','Infinity') or nullif(btrim(p_data->>'reason'),'') is null then raise exception 'Informe quantidade positiva e motivo.'; end if;
  select id into material from public.materials where company_id=cid and sku=p_data->>'materialCode';
  if material is null then raise exception 'Insumo não encontrado.'; end if;
  destination:=nullif(p_data->>'destinationProjectId','')::uuid;
  if destination is not null and (role_name='REQUESTER' or destination=p_project_id or not exists(select 1 from public.projects where id=destination and company_id=cid)) then raise exception 'Destino não autorizado.'; end if;
  -- Serialize movements of this company/material before locking source and destination.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(cid::text||material::text,0));
  select quantity into balance from public.stock_items where project_id=p_project_id and material_id=material for update;
  if balance is null or balance<qty then raise exception 'Saldo insuficiente.'; end if;
  update public.stock_items set quantity=quantity-qty where project_id=p_project_id and material_id=material;
  if destination is not null then
   insert into public.stock_items(company_id,project_id,material_id,quantity) values(cid,destination,material,qty)
    on conflict(project_id,material_id) do update set quantity=public.stock_items.quantity+excluded.quantity;
  end if;
  insert into public.stock_movements(company_id,project_id,destination_project_id,material_id,movement_type,quantity,reason,created_by)
   values(cid,p_project_id,destination,material,case when destination is null then 'OUT' else 'TRANSFER' end,qty,p_data->>'reason',uid) returning id into entity;
 elsif p_action='EXPENSE' then
  if role_name not in ('MASTER','ENGINEERING') then raise exception 'Perfil não autorizado.'; end if;
  price:=(p_data->>'amount')::numeric;
  if price is null or price<=0 or price::text in ('NaN','Infinity') or nullif(btrim(p_data->>'name'),'') is null then raise exception 'Informe descrição e valor positivo.'; end if;
  insert into public.expenses(company_id,project_id,description,category,amount,expense_date,created_by,supplier_name,notes)
   values(cid,p_project_id,p_data->>'name',p_data->>'category',price,(p_data->>'expenseDate')::date,uid,p_data->>'supplier',p_data->>'notes') returning id into entity;
 elsif p_action='RECEIVE' then
  if role_name not in ('MASTER','PURCHASING','REQUESTER') then raise exception 'Perfil não autorizado.'; end if;
  select * into order_row from public.purchase_orders where id=(p_data->>'orderId')::uuid and company_id=cid and project_id=p_project_id for update;
  if not found or order_row.approval_status<>'APPROVED' or (order_row.purchased_at is null or order_row.status not in ('SENT','PARTIALLY_RECEIVED')) then raise exception 'Pedido não aprovado ou já encerrado.'; end if;
  if jsonb_typeof(p_data->'items') is distinct from 'array' or jsonb_array_length(p_data->'items')=0 then raise exception 'Informe itens recebidos.'; end if;
  insert into public.receipts(company_id,project_id,order_id,reference,invoice_number,received_by)
   values(cid,p_project_id,order_row.id,p_data->>'reference',p_data->>'invoiceNumber',uid) returning id into entity;
  for item in select * from jsonb_array_elements(p_data->'items') loop
   select * into line from public.purchase_order_items where id=(item->>'id')::uuid and order_id=order_row.id for update;
   if not found then raise exception 'Item não pertence ao pedido.'; end if;
   qty:=(item->>'quantity')::numeric;
   if qty is null or qty<=0 or qty::text in ('NaN','Infinity') or qty>line.quantity-line.received_quantity then raise exception 'Quantidade excede o saldo a receber.'; end if;
   select * into catalog from public.input_catalog where id=line.catalog_input_id;
   insert into public.materials(company_id,sku,name,unit,category,catalog_input_id)
    values(cid,catalog.catalog_code,catalog.description,catalog.unit,catalog.category,catalog.id)
    on conflict(company_id,catalog_input_id) where catalog_input_id is not null do update set name=excluded.name returning id into material;
   insert into public.receipt_items(receipt_id,description,quantity,unit,material_id,order_item_id) values(entity,line.description,qty,line.unit,material,line.id);
   insert into public.stock_items(company_id,project_id,material_id,quantity) values(cid,p_project_id,material,qty)
    on conflict(project_id,material_id) do update set quantity=public.stock_items.quantity+excluded.quantity;
   insert into public.stock_movements(company_id,project_id,material_id,movement_type,quantity,reference,created_by) values(cid,p_project_id,material,'IN',qty,entity::text,uid);
   update public.purchase_order_items set received_quantity=received_quantity+qty where id=line.id;
  end loop;
  update public.purchase_orders set status=case when exists(select 1 from public.purchase_order_items where order_id=order_row.id and received_quantity<quantity) then 'PARTIALLY_RECEIVED' else 'RECEIVED' end where id=order_row.id;
 else raise exception 'Operação desconhecida.';
 end if;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(cid,p_project_id,uid,p_action,entity,'{}');
 return jsonb_build_object('id',entity);
end; $$;
revoke all on function public.procurement_action(text,uuid,jsonb) from public,anon;
grant execute on function public.procurement_action(text,uuid,jsonb) to authenticated;
