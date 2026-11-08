begin;
do $$
declare u uuid; p uuid; c public.input_catalog; payload jsonb; b uuid; r uuid; n integer; member public.profiles;
begin
 select id into u from public.profiles where role='MASTER' and active limit 1;
 perform set_config('request.jwt.claim.sub',u::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated')::text,true);
 select id into p from public.projects where company_id=public.current_company_id() limit 1;
 select * into c from public.input_catalog where catalog_active and input_type='MATERIAL' limit 1;
 payload:=jsonb_build_object('title','TESTE TRANSACIONAL - ROLLBACK','baseDate','2026-11-06','bdiConfig','{"ac":5.29,"sg":0.25,"r":1,"df":1.01,"l":8,"cp":3.65,"issBase":60,"issRate":5}'::jsonb,'items',jsonb_build_array(jsonb_build_object('inputId',c.id,'code',c.catalog_code,'unit',c.unit,'source','shared','quantity',2,'unitPrice',10)),'importFile',jsonb_build_object('name','teste.csv','base64','Y29kaWdvOw=='));
 b:=public.save_budget_version(p,payload);
 r:=public.save_budget_version(p,payload||jsonb_build_object('revisionOf',b,'revisionReason','Teste de revis?o'));
 if (select revision_number from public.budgets where id=r)<>2 then raise exception 'Revision test failed'; end if;
 if (select total from public.budgets where id=b)<>24.90 then raise exception 'Total test failed: %',(select total from public.budgets where id=b); end if;
 perform public.set_budget_baseline(p,r);
 if (select baseline_budget_id from public.projects where id=p)<>r then raise exception 'Baseline test failed'; end if;
 begin
  update public.budgets set deleted_at=now() where id=r;
  raise exception 'Archive baseline not blocked';
 exception when others then if sqlerrm='Archive baseline not blocked' then raise; end if; end;
 select count(*) into n from public.budgets;
 begin
  perform public.save_budget_version(p,payload||jsonb_build_object('items',jsonb_build_array(jsonb_build_object('inputId',c.id,'code',c.catalog_code,'unit','INVALID','source','shared','quantity',2,'unitPrice',10))));
  raise exception 'Bad item not blocked';
 exception when others then if sqlerrm='Bad item not blocked' then raise; end if; end;
 if has_table_privilege('authenticated','public.budgets','UPDATE') or has_table_privilege('authenticated','public.budget_items','INSERT') then raise exception 'Direct writes exposed'; end if;
 for member in select * from public.profiles where company_id=public.current_company_id() and active and role<>'MASTER' loop
  perform set_config('request.jwt.claim.sub',member.id::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',member.id,'role','authenticated')::text,true);
  execute 'set local role authenticated';
  begin
   perform public.set_budget_baseline(p,b);
   raise exception 'Unauthorized baseline allowed';
  exception when others then if sqlerrm='Unauthorized baseline allowed' then raise; end if; end;
  if member.role<>'ENGINEERING' then
   begin
    perform public.save_budget_version(p,payload);
    raise exception 'Unauthorized budget allowed';
   exception when others then if sqlerrm='Unauthorized budget allowed' then raise; end if; end;
   if exists(select 1 from public.budget_import_files where budget_id=b) then raise exception 'Original exposed'; end if;
  else
   if not exists(select 1 from public.budget_import_files where budget_id=b) then raise exception 'Original unavailable to engineering'; end if;
  end if;
  execute 'reset role';
 end loop;
 if (select count(*) from public.budgets)<>n then raise exception 'Atomicity failed'; end if;
end $$;
rollback;
