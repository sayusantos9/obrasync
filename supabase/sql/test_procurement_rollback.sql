begin;
do $$
declare u uuid; p uuid; c public.input_catalog; o uuid; li uuid; r jsonb;
begin
 select pr.id,pj.id into u,p from public.profiles pr join public.projects pj on pj.company_id=pr.company_id where pr.role='MASTER' and pr.active limit 1;
 if u is null then raise exception 'No master/project fixture'; end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 select * into c from public.input_catalog limit 1;
 r:=public.procurement_action('ORDER',p,jsonb_build_object('supplier','TEST_ROLLBACK','freight',10,'items',jsonb_build_array(jsonb_build_object('code',c.catalog_code,'unit',c.unit,'quantity',10,'unitPrice',20))));
 o:=(r->>'id')::uuid;
 if (select total from public.purchase_orders where id=o)<>210 then raise exception 'Incorrect cost'; end if;
 perform public.procurement_action('APPROVE',p,jsonb_build_object('id',o));
 perform public.procurement_action('PURCHASE',p,jsonb_build_object('id',o));
 select id into li from public.purchase_order_items where order_id=o;
 perform public.procurement_action('RECEIVE',p,jsonb_build_object('orderId',o,'items',jsonb_build_array(jsonb_build_object('id',li,'quantity',4))));
 if (select status from public.purchase_orders where id=o)<>'PARTIALLY_RECEIVED' then raise exception 'Partial receipt failed'; end if;
 perform public.procurement_action('RECEIVE',p,jsonb_build_object('orderId',o,'items',jsonb_build_array(jsonb_build_object('id',li,'quantity',6))));
 if (select status from public.purchase_orders where id=o)<>'RECEIVED' then raise exception 'Full receipt failed'; end if;
 perform public.procurement_action('STOCK',p,jsonb_build_object('materialCode',c.catalog_code,'quantity',2,'reason','test consumption'));
 begin
  perform public.procurement_action('STOCK',p,jsonb_build_object('materialCode',c.catalog_code,'quantity',999999999,'reason','reject'));
  raise exception using errcode='XX001',message='Overdraw allowed';
 exception when raise_exception then null; end;
end $$;
rollback;
