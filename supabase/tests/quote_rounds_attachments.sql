begin;
do $$
declare u uuid; p uuid; c public.input_catalog; payload jsonb; q1 uuid; q2 uuid; rid uuid; oid uuid; n integer; person public.profiles;
begin
 select id into u from public.profiles where role='MASTER' and active limit 1;
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated')::text,true);
 select id into p from public.projects where company_id=public.current_company_id() limit 1;
 select * into c from public.input_catalog where catalog_active and input_type='MATERIAL' limit 1;
 payload:=jsonb_build_object('title','TESTE ROLLBACK','supplierName','TESTE FORNECEDOR A '||gen_random_uuid(),'roundTitle','TESTE RODADA','validUntil',(current_date+7)::text,'expectedAt',(current_date+3)::text,'freight',10,'taxes',5,'discount',2,'items',jsonb_build_array(jsonb_build_object('inputId',c.id,'source','shared','code',c.catalog_code,'unit',c.unit,'quantity',2,'unitPrice',10)));
 execute 'set local role authenticated';
 q1:=public.save_comparable_quote(p,payload);
 execute 'reset role';
 select round_id into rid from public.quotations where id=q1;
 if (select total from public.quotations where id=q1)<>33 then raise exception 'Total incorrect'; end if;
 begin
  perform public.award_quote(q1,'Fornecedor único sem comparação');
  raise exception 'Single supplier allowed';
 exception when others then if sqlerrm='Single supplier allowed' then raise; end if; end;
 payload:=payload||jsonb_build_object('roundId',rid,'supplierName','TESTE FORNECEDOR B '||gen_random_uuid(),'freight',0);
 q2:=public.save_comparable_quote(p,payload);
 select count(*) into n from public.quotations;
 begin
  perform public.save_comparable_quote(p,jsonb_set(payload||jsonb_build_object('supplierName','TESTE INVALID'),'{items,0,quantity}','3'));
  raise exception 'Incompatible basket allowed';
 exception when others then if sqlerrm='Incompatible basket allowed' then raise; end if; end;
 if (select count(*) from public.quotations)<>n then raise exception 'Atomic save failed'; end if;
 execute 'set local role authenticated';
 oid:=public.award_quote(q2,'Melhor custo e prazo de entrega');
 if public.award_quote(q2,'Repetição de chamada por rede')<>oid then raise exception 'Idempotency failed'; end if;
 execute 'reset role';
 if not exists(select 1 from public.purchase_orders where id=oid and quotation_id=q2 and approval_status='APPROVED' and purchased_at is null and total=23) then raise exception 'Order mismatch'; end if;
 if not exists(select 1 from public.purchase_order_items where order_id=oid and catalog_input_id=c.id and quantity=2 and unit_price=10) then raise exception 'Item mismatch'; end if;
 begin
  perform public.award_quote(q1,'Tentativa de segunda escolha');
  raise exception 'Double award allowed';
 exception when others then if sqlerrm='Double award allowed' then raise; end if; end;
 begin
  perform public.archive_document('quote',q1,'Arquivar proposta da rodada fechada');
  raise exception 'Evidence archive allowed';
 exception when others then if sqlerrm='Evidence archive allowed' then raise; end if; end;
 if not public.can_access_operation_file('order',oid,p,true) then raise exception 'Master attachment denied'; end if;
 if public.can_access_operation_file('order',oid,gen_random_uuid(),true) then raise exception 'Wrong project allowed'; end if;
 if public.operation_file_path_allowed('bad/path',true) then raise exception 'Invalid path allowed'; end if;
 for person in select * from public.profiles where company_id=public.current_company_id() and active and role<>'MASTER' loop
  perform set_config('request.jwt.claim.sub',person.id::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',person.id,'role','authenticated')::text,true);
  execute 'set local role authenticated';
  begin
   perform public.award_quote(q1,'Escolha sem autorização');
   raise exception 'Non-master award allowed';
  exception when others then if sqlerrm='Non-master award allowed' then raise; end if; end;
  if person.role='CLIENT' and public.can_access_operation_file('order',oid,p,false) then raise exception 'Client attachment exposed'; end if;
  if person.role in ('ENGINEERING','REQUESTER','CLIENT') and public.can_access_operation_file('order',oid,p,true) then raise exception 'Unauthorized upload'; end if;
  if person.role in ('REQUESTER','CLIENT') and public.can_access_operation_file('quote',q1,p,false) then raise exception 'Quote exposed'; end if;
  execute 'reset role';
 end loop;
 if (select public from storage.buckets where id='operation-attachments') then raise exception 'Public bucket'; end if;
 if has_table_privilege('authenticated','public.operation_attachments','INSERT') or has_table_privilege('authenticated','public.quotations','UPDATE') then raise exception 'Direct writes exposed'; end if;
end $$;
rollback;
