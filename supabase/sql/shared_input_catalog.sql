-- Shared reference catalog. Company-specific prices remain in cost_inputs.
create table public.input_catalog (
  id uuid primary key default gen_random_uuid(),
  catalog_code text not null unique check (length(btrim(catalog_code)) > 0),
  source_file text not null,
  source_row integer not null check (source_row > 1),
  source_bank text not null check (length(btrim(source_bank)) > 0),
  source_code text,
  description text not null check (length(btrim(description)) > 0),
  category text,
  unit text not null check (length(btrim(unit)) > 0),
  reference_quantity numeric not null check (reference_quantity >= 0),
  reference_unit_price numeric not null check (reference_unit_price >= 0),
  reference_value numeric not null check (reference_value >= 0),
  reference_date date,
  created_at timestamptz not null default now(),
  unique (source_file, source_row)
);
comment on table public.input_catalog is 'Catalogo-base compartilhado entre empresas atuais e futuras. Nao representa estoque ou demanda de obra.';
comment on column public.input_catalog.reference_quantity is 'Quantidade original, sem assumir coeficiente ou quantidade total de obra.';
comment on column public.input_catalog.reference_date is 'Data-base do preco: NULL quando nao informada; created_at nao substitui a data-base.';
alter table public.input_catalog enable row level security;
revoke all on public.input_catalog from public, anon, authenticated;
grant select on public.input_catalog to authenticated;
grant all on public.input_catalog to service_role;
create policy input_catalog_read on public.input_catalog
  for select to authenticated
  using ((select exists (
    select 1 from public.profiles p
    join public.companies c on c.id = p.company_id
    where p.id = auth.uid() and p.active and c.active
      and p.role in ('MASTER', 'ENGINEERING', 'PURCHASING', 'REQUESTER')
  )));
