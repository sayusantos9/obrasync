begin;
do $$
declare u uuid; cid uuid; pid uuid; sid uuid; supplier public.suppliers; snapshot jsonb; who public.profiles; n integer; catalog public.input_catalog; oid uuid; lineid uuid; receiptid uuid;
begin
 select id,company_id into u,cid from public.profiles where role='MASTER' and active limit 1;
 if u is null then raise exception 'Fixture Master indisponível'; end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated')::text,true);
 select id into pid from public.projects where company_id=cid limit 1;
 execute 'set local role authenticated';
 sid:=public.save_supplier(jsonb_build_object('name','TESTE ROLLBACK '||gen_random_uuid(),'document','TEST'||left(gen_random_uuid()::text,8),'email','compras@example.com','phone','98999990000','contactName','Contato'));
 if not exists(select 1 from jsonb_array_elements(public.list_suppliers()) s where s->>'id'=sid::text) then raise exception 'Fornecedor não listado'; end if;
 snapshot:=public.executive_report_snapshot(pid);
 if snapshot->'project'->>'id'<>pid::text or jsonb_typeof(snapshot->'orders')<>'array' then raise exception 'Snapshot inválido'; end if;
 execute 'reset role';
 select * into supplier from public.suppliers where id=sid;
 begin
  perform public.save_supplier(jsonb_build_object('name',lower(supplier.name),'document','DIFFERENT'));
  raise exception 'ASSERT duplicate allowed';
 exception when others then if sqlerrm='ASSERT duplicate allowed' then raise; end if; end;
 begin
  perform public.save_supplier(jsonb_build_object('name','Other '||gen_random_uuid(),'document',supplier.document));
  raise exception 'ASSERT duplicate document';
 exception when others then if sqlerrm='ASSERT duplicate document' then raise; end if; end;
 begin
  perform public.save_supplier(jsonb_build_object('id',sid,'name',supplier.name,'updatedAt','2000-01-01'));
  raise exception 'ASSERT stale allowed';
 exception when others then if sqlerrm='ASSERT stale allowed' then raise; end if; end;
 perform public.save_supplier(jsonb_build_object('id',sid,'name',supplier.name,'document',supplier.document,'updatedAt',supplier.updated_at,'active',false));
 if exists(select 1 from public.suppliers where id=sid and active) then raise exception 'Inactive failed'; end if;
 begin
  perform public.resolve_supplier(sid,supplier.name);
  raise exception 'ASSERT inactive accepted';
 exception when others then if sqlerrm='ASSERT inactive accepted' then raise; end if; end;
 begin
  perform public.resolve_supplier(null,supplier.name);
  raise exception 'ASSERT inactive recreated';
 exception when others then if sqlerrm='ASSERT inactive recreated' then raise; end if; end;
 select * into supplier from public.suppliers where id=sid;
 perform public.save_supplier(jsonb_build_object('id',sid,'name',supplier.name,'updatedAt',supplier.updated_at,'active',true));
 if public.resolve_supplier(sid,'Nome ignorado')<>sid then raise exception 'Stable ID failed'; end if;
 select * into catalog from public.input_catalog where catalog_active and input_type='MATERIAL' limit 1;
 execute 'set local role authenticated';
 oid:=(public.procurement_action('ORDER',pid,jsonb_build_object('supplierId',sid,'supplier','Nome desatualizado','freight',8,'items',jsonb_build_array(jsonb_build_object('code',catalog.catalog_code,'source','shared','unit',catalog.unit,'quantity',4,'unitPrice',10))))->>'id')::uuid;
 perform public.procurement_action('APPROVE',pid,jsonb_build_object('id',oid,'reason','Aprovação no teste transacional'));
 perform public.procurement_action('PURCHASE',pid,jsonb_build_object('id',oid));
 execute 'reset role';
 if not exists(select 1 from public.purchase_orders where id=oid and supplier_id=sid and total=48) then raise exception 'Supplier ID/order totals mismatch'; end if;
 select id into lineid from public.purchase_order_items where order_id=oid;
 execute 'set local role authenticated';
 receiptid:=(public.procurement_action('RECEIVE',pid,jsonb_build_object('orderId',oid,'reference','Teste rollback','invoiceNumber','TESTE','items',jsonb_build_array(jsonb_build_object('id',lineid,'quantity',2))))->>'id')::uuid;
 snapshot:=public.executive_report_snapshot(pid);
 if not exists(select 1 from jsonb_array_elements(snapshot->'orders') x where x->>'id'=oid::text and (x->>'total')::numeric=48 and x->>'supplier_id'=sid::text) then raise exception 'Order absent from snapshot'; end if;
 if not exists(select 1 from jsonb_array_elements(snapshot->'receipts') x where x->>'id'=receiptid::text and x->'items'->0->>'order_item_id'=lineid::text and (x->'items'->0->>'quantity')::numeric=2) then raise exception 'Receipt absent from snapshot'; end if;
 execute 'reset role';
 if not exists(select 1 from public.operation_audit where entity_id=sid and action='SUPPLIER_CREATED') then raise exception 'Missing audit'; end if;
 if has_table_privilege('authenticated','public.suppliers','UPDATE') then raise exception 'Direct supplier write allowed'; end if;
 for who in select * from public.profiles where company_id=cid and active and role<>'MASTER' loop
  perform set_config('request.jwt.claim.sub',who.id::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',who.id,'role','authenticated')::text,true);
  execute 'set local role authenticated';
  if who.role in ('ENGINEERING','PURCHASING') then
   perform public.list_suppliers();perform public.executive_report_snapshot(pid);
  else
   begin perform public.list_suppliers();raise exception 'ASSERT list exposed';exception when others then if sqlerrm='ASSERT list exposed' then raise; end if; end;
   begin perform public.executive_report_snapshot(pid);raise exception 'ASSERT executive exposed';exception when others then if sqlerrm='ASSERT executive exposed' then raise; end if; end;
  end if;
  if who.role<>'PURCHASING' then
   begin perform public.save_supplier(jsonb_build_object('name','Unauthorized'));raise exception 'ASSERT unauthorized edit';exception when others then if sqlerrm='ASSERT unauthorized edit' then raise; end if; end;
  end if;
  begin perform public.executive_report_snapshot(gen_random_uuid());raise exception 'ASSERT foreign project';exception when others then if sqlerrm='ASSERT foreign project' then raise; end if; end;
  execute 'reset role';
 end loop;
end $$;
rollback;
