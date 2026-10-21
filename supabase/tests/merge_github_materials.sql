begin;
do $test$
declare u uuid; c uuid; p uuid; material uuid; excluded uuid; b uuid; q jsonb; ref uuid; own uuid; denied boolean; before_count integer;
begin
  select pr.id,pr.company_id,proj.id into u,c,p from public.profiles pr join public.projects proj on proj.company_id=pr.company_id
    where pr.role='MASTER' and pr.active limit 1;
  if u is null then raise exception 'Sem usuário/obra para validar'; end if;
  select id into material from public.input_catalog where is_material limit 1;
  select id into excluded from public.input_catalog where not is_material limit 1;
  perform set_config('request.jwt.claim.sub',u::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',u,'role','authenticated')::text,true);
  set local role authenticated;
  insert into public.cost_references(company_id,source_code,reference_date,region_code)
    values(c,'TESTE_MESCLA',current_date,'TESTE') returning id into ref;
  insert into public.cost_inputs(company_id,cost_reference_id,description,input_type,unit,unit_price)
    values(c,ref,'Material de teste','MATERIAL','un',10) returning id into own;
  if (select code from public.cost_inputs where id=own) not like 'INS-%' then raise exception 'Código automático ausente'; end if;
  insert into public.budgets(company_id,project_id,title,total,subtotal_without_bdi,bdi_percent,bdi_amount,bdi_config)
    values(c,p,'Teste transacional da mescla',120,100,20,20,'{"ac":20}') returning id into b;
  insert into public.budget_items(budget_id,description,quantity,unit,unit_price,catalog_input_id,input_type,input_code)
    values(b,'Material compartilhado',2,'un',25,material,'MATERIAL','TESTE');
  insert into public.budget_items(budget_id,description,quantity,unit,unit_price,input_id,input_type)
    values(b,'Material da empresa',5,'un',10,own,'MATERIAL');
  if (select sum(total) from public.budget_items where budget_id=b)<>100 then raise exception 'Subtotal incorreto'; end if;
  denied:=false;
  begin
    insert into public.budget_items(budget_id,description,quantity,unit,unit_price,catalog_input_id,input_type)
      values(b,'Item fora de escopo',1,'un',1,excluded,'MATERIAL');
  exception when raise_exception then denied:=true; end;
  if not denied then raise exception 'Item não material aceito'; end if;
  q:=public.save_material_quote(p,'TESTE',current_date,'OBRASYNC_QUOTE_V1:{"title":"Teste"}',
      '[{"description":"Material teste","quantity":2,"unit":"un","unit_price":12.35},{"description":"Outro material","quantity":3,"unit":"un","unit_price":4.5}]');
  if (q->>'total')::numeric<>38.2 or jsonb_array_length(q->'quotation_items')<>2 then raise exception 'Cotação incorreta'; end if;
  select count(*) into before_count from public.quotations;
  denied:=false;
  begin
    perform public.save_material_quote(p,'INVALIDA',current_date,'','[{"description":"Erro","quantity":0,"unit":"un","unit_price":1}]');
  exception when raise_exception then denied:=true; end;
  if not denied or (select count(*) from public.quotations)<>before_count then raise exception 'Falha de atomicidade'; end if;
  reset role;
  select id into u from public.profiles where company_id<>c and role='MASTER' and active limit 1;
  perform set_config('request.jwt.claim.sub',u::text,true);
  perform set_config('request.jwt.claims',json_build_object('sub',u,'role','authenticated')::text,true);
  set local role authenticated;
  if exists(select 1 from public.budgets where id=b) or exists(select 1 from public.quotations where id=(q->>'id')::uuid)
    or exists(select 1 from public.cost_inputs where id=own) then raise exception 'Isolamento entre empresas falhou'; end if;
  denied:=false;
  begin perform public.save_material_quote(p,'OUTRA_EMPRESA',current_date,'','[{"description":"Teste","quantity":1,"unit":"un","unit_price":1}]');
  exception when raise_exception then denied:=true; end;
  if not denied then raise exception 'Cotação criada em obra de outra empresa'; end if;
  reset role;
end;
$test$;
rollback;
select 'PASS: orçamento com catálogo e material próprio, BDI, cotação atômica, rejeição de não materiais, isolamento entre empresas; dados de teste revertidos' as result;
