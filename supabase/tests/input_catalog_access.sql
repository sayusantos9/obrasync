-- Read-only checks using real profiles under authenticated RLS; no user data changed.
begin;
do $test$
declare
  member record;
  visible_count integer;
  expected_count integer;
  total_count integer;
begin
  select count(*) into total_count from public.input_catalog;
  if total_count <> 134 then raise exception 'Expected 134 imported records, got %', total_count; end if;
  if (select count(*) from public.input_catalog where is_material) <> 89 then
    raise exception 'Expected 89 materials in app scope';
  end if;
  if exists (select 1 from public.input_catalog where is_material and category in ('Mão de Obra','Serviços','Encargos Complementares','Equipamento para Aquisição')) then
    raise exception 'Non-material item included in app scope';
  end if;
  if has_table_privilege('anon', 'public.input_catalog', 'SELECT') then
    raise exception 'Anonymous role must not read catalog';
  end if;
  if has_table_privilege('authenticated', 'public.input_catalog', 'INSERT,UPDATE,DELETE,TRUNCATE') then
    raise exception 'App users must not mutate the shared reference catalog';
  end if;
  for member in select p.id,p.role,p.active,c.active as company_active from public.profiles p left join public.companies c on c.id=p.company_id loop
    expected_count := case when member.active and member.company_active and member.role in ('MASTER','ENGINEERING','PURCHASING','REQUESTER') then total_count else 0 end;
    perform set_config('request.jwt.claims', json_build_object('sub',member.id,'role','authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', member.id::text, true);
    set local role authenticated;
    select count(*) into visible_count from public.input_catalog;
    if expected_count > 0 and (select count(*) from public.input_catalog where is_material) <> 89 then
      raise exception 'Expected 89 visible materials';
    end if;
    reset role;
    if visible_count <> expected_count then raise exception 'Unexpected catalog visibility for role %: % instead of %',member.role,visible_count,expected_count; end if;
  end loop;
  perform set_config('request.jwt.claims', '{}', true);
  perform set_config('request.jwt.claim.sub', '', true);
  set local role authenticated;
  select count(*) into visible_count from public.input_catalog;
  reset role;
  if visible_count <> 0 then raise exception 'Unaffiliated user can read catalog'; end if;
end;
$test$;
rollback;
select 'PASS: catalog access for existing profiles, anonymous grants, write denial and unaffiliated user' as result;
