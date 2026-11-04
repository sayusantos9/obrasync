alter table public.input_catalog add column if not exists input_type text not null default 'OTHER';
update public.input_catalog set input_type=case
 when category='Material' or is_material then 'MATERIAL'
 when category='Mão de Obra' then 'LABOR'
 when category like 'Equipamento%' then 'EQUIPMENT'
 when category='Encargos Complementares' then 'COMPLEMENTARY'
 when category='Serviços' then 'SERVICE_INPUT' else 'OTHER' end;
comment on column public.input_catalog.input_type is 'Tipo de insumo da fonte; SERVICE_INPUT identifica linha de insumo classificada como serviço, não composição.';
create or replace function public.validate_budget_material_link() returns trigger
language plpgsql set search_path='' as $$
declare expected_type text;
begin
 if new.catalog_input_id is not null then
  if new.input_id is not null then raise exception 'Use apenas uma origem de insumo.'; end if;
  select input_type into expected_type from public.input_catalog where id=new.catalog_input_id;
  if not found then raise exception 'Insumo não encontrado.'; end if;
 elsif new.input_id is not null then
  select i.input_type into expected_type from public.cost_inputs i join public.budgets b on b.id=new.budget_id
  where i.id=new.input_id and i.company_id=b.company_id;
  if not found then raise exception 'Insumo inválido ou de outra empresa.'; end if;
 else
  return new;
 end if;
 if new.input_type is distinct from expected_type then raise exception 'Tipo de insumo incompatível com a origem.'; end if;
 return new;
end; $$;
