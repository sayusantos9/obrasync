-- Integração GitHub 1891850 + catálogo compartilhado. Alterações aditivas.
alter table public.budgets add column if not exists subtotal_without_bdi numeric;
alter table public.budgets add column if not exists bdi_percent numeric;
alter table public.budgets add column if not exists bdi_amount numeric;
alter table public.budgets add column if not exists bdi_config jsonb;
alter table public.budget_items add column if not exists input_id uuid references public.cost_inputs(id) on delete set null;
alter table public.budget_items add column if not exists input_code text;
alter table public.budget_items add column if not exists input_type text;
alter table public.budget_items add column if not exists catalog_input_id uuid references public.input_catalog(id) on delete restrict;
create index if not exists budget_items_catalog_input_idx on public.budget_items(catalog_input_id);
alter table public.cost_inputs alter column code set default ('INS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)));

create or replace function public.validate_budget_material_link()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.catalog_input_id is not null then
    if new.input_id is not null or not exists (
      select 1 from public.input_catalog where id=new.catalog_input_id and is_material
    ) then raise exception 'Selecione um material válido do catálogo compartilhado.'; end if;
  end if;
  if new.input_id is not null and not exists (
    select 1 from public.cost_inputs i join public.budgets b on b.id=new.budget_id
    where i.id=new.input_id and i.company_id=b.company_id and i.input_type='MATERIAL'
  ) then raise exception 'Material inválido ou pertencente a outra empresa.'; end if;
  if (new.input_id is not null or new.catalog_input_id is not null) and new.input_type is distinct from 'MATERIAL'
  then raise exception 'Somente materiais são permitidos.'; end if;
  return new;
end;
$$;
revoke all on function public.validate_budget_material_link() from public, anon, authenticated;
drop trigger if exists budget_material_link_check on public.budget_items;
create trigger budget_material_link_check before insert or update on public.budget_items
for each row execute function public.validate_budget_material_link();

-- Documento e linhas são gravados em uma única transação, sob as políticas RLS existentes.
create or replace function public.save_material_quote(
  p_project_id uuid, p_number text, p_expires_at date, p_notes text, p_items jsonb
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare q public.quotations; v_total numeric; v_items jsonb;
begin
  if auth.uid() is null or not public.has_role(array['MASTER','ENGINEERING','PURCHASING'])
    or not exists (select 1 from public.projects where id=p_project_id and company_id=public.current_company_id())
  then raise exception 'Obra não disponível para este usuário.'; end if;
  if jsonb_typeof(p_items) is distinct from 'array' then raise exception 'Informe os itens.'; end if;
  if jsonb_array_length(p_items)=0 then raise exception 'Informe os itens.'; end if;
  if exists(select 1 from jsonb_to_recordset(p_items) as i(description text, quantity numeric, unit text, unit_price numeric)
    where nullif(btrim(description),'') is null or nullif(btrim(unit),'') is null
       or quantity is null or quantity<=0 or unit_price is null or unit_price<0)
  then raise exception 'Revise os itens da cotação.'; end if;
  select sum(round(quantity*unit_price,2)) into v_total
    from jsonb_to_recordset(p_items) as i(quantity numeric,unit_price numeric);
  insert into public.quotations(company_id,project_id,number,status,total,expires_at,notes,created_by)
    values(public.current_company_id(),p_project_id,p_number,'OPEN',v_total,p_expires_at,p_notes,auth.uid())
    returning * into q;
  insert into public.quotation_items(quotation_id,description,quantity,unit,unit_price)
    select q.id,btrim(description),quantity,btrim(unit),unit_price
    from jsonb_to_recordset(p_items) as i(description text,quantity numeric,unit text,unit_price numeric);
  select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb) into v_items from public.quotation_items i where quotation_id=q.id;
  return to_jsonb(q) || jsonb_build_object('quotation_items',v_items);
end;
$$;
revoke all on function public.save_material_quote(uuid,text,date,text,jsonb) from public,anon;
grant execute on function public.save_material_quote(uuid,text,date,text,jsonb) to authenticated;
