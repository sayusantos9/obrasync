begin;
create or replace function pg_temp.expect_denied(command text,fragment text default null) returns void language plpgsql as $$
begin
 begin execute command;exception when others then
  if fragment is not null and position(lower(fragment) in lower(sqlerrm))=0 then raise exception 'Unexpected failure for %: %',command,sqlerrm;end if;
  return;
 end;
 raise exception 'ASSERT unauthorized/invalid operation succeeded: %',command;
end $$;

do $$ declare master_id uuid;engineer uuid;buyer uuid;requester uuid;client uuid;cid uuid;pid uuid;other_pid uuid;
 cat public.input_catalog;bid uuid;req uuid;reqline uuid;q1 uuid;q2 uuid;roundid uuid;oid uuid;li uuid;
 r1 uuid;r2 uuid;ri uuid;material uuid;ret uuid;payload jsonb;result jsonb;actor public.profiles;qty numeric;
begin
 select id,company_id into master_id,cid from public.profiles where role='MASTER' and active limit 1;
 select id into engineer from public.profiles where company_id=cid and active and role='ENGINEERING' limit 1;
 select id into buyer from public.profiles where company_id=cid and active and role='PURCHASING' limit 1;
 select id into requester from public.profiles where company_id=cid and active and role='REQUESTER' limit 1;
 select id into client from public.profiles where company_id=cid and active and role='CLIENT' limit 1;
 if engineer is null or buyer is null or requester is null or client is null then raise exception 'All five profiles required';end if;
 perform set_config('request.jwt.claim.sub',master_id::text,true);
 insert into public.projects(company_id,name,code,created_by,client_user_id) values(cid,'QUALITY FLOW ROLLBACK','QA-'||left(gen_random_uuid()::text,8),master_id,client) returning id into pid;
 insert into public.projects(company_id,name,code,created_by) values(cid,'QA WITHOUT ACCESS','QA-'||left(gen_random_uuid()::text,8),master_id) returning id into other_pid;
 select * into cat from public.input_catalog where input_type='MATERIAL' and catalog_active limit 1;
 execute 'set local role authenticated';
 perform public.save_project_access(pid,engineer,true,null);perform public.save_project_access(pid,buyer,true,null);perform public.save_project_access(pid,requester,true,null);
 execute 'reset role';
 -- Orçamentista creates budget; only Master makes the official baseline.
 perform set_config('request.jwt.claim.sub',engineer::text,true);
 execute 'set local role authenticated';
 bid:=public.save_budget_version(pid,jsonb_build_object('title','QA end to end','baseDate',current_date,'bdiConfig',jsonb_build_object('schemaVersion',2,'enabled',false),'items',jsonb_build_array(jsonb_build_object('inputId',cat.id,'code',cat.catalog_code,'unit',cat.unit,'source','shared','quantity',10,'unitPrice',10))));
 perform pg_temp.expect_denied(format('select public.set_budget_baseline(%L,%L)',pid,bid));
 execute 'reset role';perform set_config('request.jwt.claim.sub',master_id::text,true);
 execute 'set local role authenticated';perform public.set_budget_baseline(pid,bid);execute 'reset role';
 -- Requester -> quote basket -> two supplier proposals -> approval -> purchase.
 perform set_config('request.jwt.claim.sub',requester::text,true);execute 'set local role authenticated';
 req:=(public.procurement_action('REQUEST',pid,jsonb_build_object('inputId',cat.id,'source','shared','material',cat.description,'quantity',10,'unit',cat.unit,'neededAt',current_date+7,'justification','Fluxo completo de teste')) ->>'id')::uuid;
 execute 'reset role';select id into reqline from public.material_request_items where request_id=req;
 payload:=jsonb_build_object('requestId',req,'roundTitle','QA full flow','title','Proposta QA','supplierName','QA A '||gen_random_uuid(),'validUntil',current_date+10,'expectedAt',current_date+3,'items',jsonb_build_array(jsonb_build_object('requestItemId',reqline,'inputId',cat.id,'source','shared','code',cat.catalog_code,'unit',cat.unit,'quantity',10,'unitPrice',12)));
 perform set_config('request.jwt.claim.sub',buyer::text,true);execute 'set local role authenticated';q1:=public.save_comparable_quote(pid,payload);execute 'reset role';
 select round_id into roundid from public.quotations where id=q1;
 execute 'set local role authenticated';q2:=public.save_comparable_quote(pid,payload||jsonb_build_object('roundId',roundid,'supplierName','QA B '||gen_random_uuid()));execute 'reset role';
 perform set_config('request.jwt.claim.sub',master_id::text,true);execute 'set local role authenticated';oid:=public.award_quote(q2,'Fornecedor escolhido para validar fluxo');execute 'reset role';
 perform set_config('request.jwt.claim.sub',buyer::text,true);execute 'set local role authenticated';perform public.procurement_action('PURCHASE',pid,jsonb_build_object('id',oid));execute 'reset role';
 select id into li from public.purchase_order_items where order_id=oid;
 if not exists(select 1 from public.purchase_orders where id=oid and request_id=req and budget_id=bid) then raise exception 'Lost origin chain';end if;
 -- Receipt: 6 accepted, 4 rejected. No rejected inventory and exact-key replay.
 payload:=jsonb_build_object('clientRequestId',gen_random_uuid(),'orderId',oid,'reference','QA NF','items',jsonb_build_array(jsonb_build_object('id',li,'quantity',6,'rejectedQuantity',4,'reason','Embalagem avariada','nonconformity','NC-QA-01')));
 perform set_config('request.jwt.claim.sub',requester::text,true);execute 'set local role authenticated';
 r1:=(public.procurement_action('RECEIVE',pid,payload)->>'id')::uuid;
 if (public.procurement_action('RECEIVE',pid,payload)->>'id')::uuid<>r1 then raise exception 'Replay duplicated receipt';end if;
 perform pg_temp.expect_denied(format('select public.procurement_action(''RECEIVE'',%L,%L::jsonb)',pid,payload||jsonb_build_object('clientRequestId',gen_random_uuid(),'items',jsonb_build_array(jsonb_build_object('id',li,'quantity',0,'rejectedQuantity',4,'reason','x')))),'motivo');
 perform pg_temp.expect_denied(format('select public.procurement_action(''RECEIVE'',%L,%L::jsonb)',pid,payload||jsonb_build_object('clientRequestId',gen_random_uuid(),'items',jsonb_build_array(jsonb_build_object('id',li,'quantity',3,'rejectedQuantity',2,'reason','Avaria no produto')))),'saldo a receber');
 execute 'reset role';select id,material_id into ri,material from public.receipt_items where receipt_id=r1;
 if (select quantity from public.stock_items where project_id=pid and material_id=material)<>6 or (select received_quantity from public.purchase_order_items where id=li)<>6 then raise exception 'Rejected material entered inventory';end if;
 if not exists(select 1 from public.receipt_quality where receipt_id=r1 and accepted_quantity=6 and rejected_quantity=4 and nonconformity='NC-QA-01') then raise exception 'Quality missing';end if;
 -- Reject-only delivery is valid, without zero quantity receipt_items/stock movements.
 execute 'set local role authenticated';
 r2:=(public.procurement_action('RECEIVE',pid,payload||jsonb_build_object('clientRequestId',gen_random_uuid(),'items',jsonb_build_array(jsonb_build_object('id',li,'quantity',0,'rejectedQuantity',4,'reason','Nova entrega avariada'))))->>'id')::uuid;
 execute 'reset role';if exists(select 1 from public.receipt_items where receipt_id=r2) then raise exception 'Reject-only receipt created stock';end if;
 -- Every profile: role writes, read scope, direct writes, unauthorized project.
 for actor in select * from public.profiles where id in (master_id,engineer,buyer,requester,client) loop
  perform set_config('request.jwt.claim.sub',actor.id::text,true);execute 'set local role authenticated';
  if actor.role in ('REQUESTER','CLIENT') then
   perform pg_temp.expect_denied(format('select public.executive_report_snapshot(%L)',pid));
  else
   result:=public.executive_report_snapshot(pid);
   if jsonb_array_length(result->'quality')<>2 then raise exception 'Missing quality snapshot for %',actor.role;end if;
  end if;
  if actor.role not in ('MASTER','PURCHASING') then
   perform pg_temp.expect_denied(format('select public.procurement_action(''RETURN'',%L,%L::jsonb)',pid,jsonb_build_object('receiptItemId',ri,'quantity',1,'reason','QA unauthorized return')),'Somente');
   perform pg_temp.expect_denied(format('select public.procurement_action(''PURCHASE'',%L,%L::jsonb)',pid,jsonb_build_object('id',oid)),'Perfil');
  end if;
  if actor.role in ('ENGINEERING','CLIENT') then
   perform pg_temp.expect_denied(format('select public.procurement_action(''RECEIVE'',%L,%L::jsonb)',pid,payload),'Perfil');
   perform pg_temp.expect_denied(format('select public.procurement_action(''STOCK'',%L,%L::jsonb)',pid,jsonb_build_object('materialCode',cat.catalog_code,'quantity',1,'direction','OUT','reason','QA forbidden consumption')),'Perfil');
  else
   -- Exercise successful receiving/consumption for each authorized role in an isolated subtransaction.
   begin
    perform public.procurement_action('RECEIVE',pid,jsonb_build_object('orderId',oid,'reference','QA role receive','items',jsonb_build_array(jsonb_build_object('id',li,'quantity',1))));
    perform public.procurement_action('STOCK',pid,jsonb_build_object('materialCode',cat.catalog_code,'quantity',1,'direction','OUT','reason','QA role consumption'));
    raise exception 'QA_ROLE_ROLLBACK';
   exception when others then if sqlerrm<>'QA_ROLE_ROLLBACK' then raise;end if;end;
  end if;
  if actor.role not in ('MASTER','ENGINEERING') then
   perform pg_temp.expect_denied(format('select public.save_budget_version(%L,''{}''::jsonb)',pid));
  end if;
  if actor.role<>'MASTER' then
   perform pg_temp.expect_denied(format('select public.executive_report_snapshot(%L)',other_pid));
   if exists(select 1 from public.receipt_quality where project_id=other_pid) or exists(select 1 from public.supplier_returns where project_id=other_pid) then raise exception 'RLS leak';end if;
  end if;
  if actor.role='CLIENT' and (exists(select 1 from public.receipt_quality where project_id=pid) or exists(select 1 from public.supplier_returns where project_id=pid)) then raise exception 'Client quality leak';end if;
  perform pg_temp.expect_denied(format('update public.receipt_quality set reason=''tampered'' where receipt_id=%L',r1),'permission denied');
  perform pg_temp.expect_denied(format('select public.return_received_item(%L,''{}''::jsonb)',pid),'permission denied');
  execute 'reset role';
 end loop;
 -- Return by buyer, replay, stock debit, reopened receipt, protected historic quantities.
 perform set_config('request.jwt.claim.sub',buyer::text,true);execute 'set local role authenticated';
 payload:=jsonb_build_object('clientRequestId',gen_random_uuid(),'orderId',oid,'receiptItemId',ri,'quantity',2,'reason','Defeito identificado na conferência','nonconformity','NC-QA-02','reference','DEV-QA');
 ret:=(public.procurement_action('RETURN',pid,payload)->>'id')::uuid;
 if (public.procurement_action('RETURN',pid,payload)->>'id')::uuid<>ret then raise exception 'Return duplicated';end if;
 perform pg_temp.expect_denied(format('select public.procurement_action(''RETURN'',%L,%L::jsonb)',pid,payload||jsonb_build_object('clientRequestId',gen_random_uuid(),'quantity',5)),'saldo devolvível');
 execute 'reset role';
 if (select quantity from public.stock_items where project_id=pid and material_id=material)<>4 or (select received_quantity from public.purchase_order_items where id=li)<>4 or (select quantity from public.receipt_items where id=ri)<>6 then raise exception 'Return balances/history wrong';end if;
 if (select count(*) from public.stock_movements where supplier_return_id=ret)<>1 then raise exception 'Return movement missing/duplicated';end if;
 if (select total from public.purchase_orders where id=oid)<>120 then raise exception 'Physical return changed financial purchase';end if;
 execute 'set local role authenticated';
 begin
  perform public.procurement_action('STOCK',pid,jsonb_build_object('materialCode',cat.catalog_code,'quantity',10,'direction','IN','reason','Estoque externo reservado QA'));
  perform public.reserve_budget_stock(pid,material,8,'Reserva externa para testar devolução',bid);
  perform public.procurement_action('STOCK',pid,jsonb_build_object('materialCode',cat.catalog_code,'quantity',6,'direction','OUT','reason','Saída até atingir reserva QA'));
  perform pg_temp.expect_denied(format('select public.procurement_action(''RETURN'',%L,%L::jsonb)',pid,payload||jsonb_build_object('clientRequestId',gen_random_uuid(),'quantity',1)),'reservado');
  raise exception 'QA_RESERVE_ROLLBACK';
 exception when others then if sqlerrm<>'QA_RESERVE_ROLLBACK' then raise;end if;end;
 execute 'reset role';
 -- Consume 3, block return above physical stock, then return 1 with Master.
 perform set_config('request.jwt.claim.sub',requester::text,true);execute 'set local role authenticated';
 perform public.procurement_action('STOCK',pid,jsonb_build_object('materialCode',cat.catalog_code,'quantity',3,'direction','OUT','reason','Consumo de teste QA'));execute 'reset role';
 perform set_config('request.jwt.claim.sub',master_id::text,true);execute 'set local role authenticated';
 perform pg_temp.expect_denied(format('select public.procurement_action(''RETURN'',%L,%L::jsonb)',pid,payload||jsonb_build_object('clientRequestId',gen_random_uuid(),'quantity',2)),'estoque insuficiente');
 perform public.procurement_action('RETURN',pid,payload||jsonb_build_object('clientRequestId',gen_random_uuid(),'quantity',1));
 perform public.procurement_action('RECEIVE',pid,jsonb_build_object('orderId',oid,'reference','Reposição QA','items',jsonb_build_array(jsonb_build_object('id',li,'quantity',7))));
 result:=public.financial_comparison_snapshot(pid,bid);
 execute 'reset role';
 if (select quantity from public.stock_items where project_id=pid and material_id=material)<>7 or (select received_quantity from public.purchase_order_items where id=li)<>10 then raise exception 'Replacement balances wrong';end if;
 if (select status from public.purchase_orders where id=oid)<>'RECEIVED' or (select status from public.material_requests where id=req)<>'RECEIVED' then raise exception 'Replacement status chain broken';end if;
 if jsonb_array_length(result->'returns')<>2 or jsonb_array_length(result->'quality')<>3 then raise exception 'Final financial snapshot incomplete';end if;
 if (select count(*) from public.operation_audit where project_id=pid and action='SUPPLIER_RETURN')<>2 then raise exception 'Return audit absent';end if;
 -- Revoking actual project access hides existing rows and blocks pending writes.
 perform set_config('request.jwt.claim.sub',master_id::text,true);execute 'set local role authenticated';
 perform public.save_project_access(pid,buyer,false,null);execute 'reset role';
 perform set_config('request.jwt.claim.sub',buyer::text,true);execute 'set local role authenticated';
 if exists(select 1 from public.receipt_quality where project_id=pid) or exists(select 1 from public.supplier_returns where project_id=pid) or exists(select 1 from public.receipts where project_id=pid) then raise exception 'Revoked membership exposed existing receipts';end if;
 perform pg_temp.expect_denied(format('select public.procurement_action(''RETURN'',%L,%L::jsonb)',pid,payload||jsonb_build_object('clientRequestId',gen_random_uuid())),'acesso');
 execute 'reset role';
 -- Inactive accounts also lose access despite their old role/membership.
 update public.profiles set active=false where id=requester;
 perform set_config('request.jwt.claim.sub',requester::text,true);execute 'set local role authenticated';
 if public.can_access_project(pid) or exists(select 1 from public.receipt_quality where project_id=pid) then raise exception 'Inactive member retained access';end if;
 perform pg_temp.expect_denied(format('select public.procurement_action(''RECEIVE'',%L,%L::jsonb)',pid,payload));
 execute 'reset role';
end $$;
rollback;
