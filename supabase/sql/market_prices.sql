create table public.market_prices (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.companies(id),
 project_id uuid not null references public.projects(id),
 catalog_input_id uuid references public.input_catalog(id),
 cost_input_id uuid references public.cost_inputs(id),
 supplier text not null check(length(trim(supplier)) between 2 and 150),
 product text not null check(length(trim(product)) between 2 and 500),
 url text not null default '' check(url='' or url ~ '^https?://[^[:space:]]+$'),
 unit text not null,
 pack_quantity numeric not null check(pack_quantity>0 and pack_quantity<'Infinity'::numeric),
 price numeric not null check(price>=0 and price<'Infinity'::numeric),
 freight numeric check(freight>=0 and freight<'Infinity'::numeric),
 surveyed_quantity numeric not null check(surveyed_quantity>0 and surveyed_quantity<'Infinity'::numeric),
 postal_code text not null check(postal_code ~ '^[0-9]{8}$'),
 payment text not null check(length(trim(payment)) between 2 and 150),
 observed_on date not null,
 in_stock boolean not null default false,
 verified_spec boolean not null default false,
 notes text not null default '',
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 check(num_nonnulls(catalog_input_id,cost_input_id)=1)
);
create index market_prices_project on public.market_prices(company_id,project_id,created_at desc);
alter table public.market_prices enable row level security;
revoke all on public.market_prices from anon,authenticated;
grant select,insert on public.market_prices to authenticated;
create policy market_read on public.market_prices for select to authenticated using(company_id=(select public.current_company_id()) and public.has_role(array['MASTER','ENGINEERING','PURCHASING']));
create policy market_insert on public.market_prices for insert to authenticated with check(company_id=(select public.current_company_id()) and created_by=(select auth.uid()) and public.has_role(array['MASTER','ENGINEERING','PURCHASING']));
create function public.validate_market_price() returns trigger language plpgsql security invoker set search_path='' as $$
declare expected_unit text;
begin
 if not exists(select 1 from public.projects where id=new.project_id and company_id=new.company_id) then raise exception 'Obra não autorizada.'; end if;
 if new.catalog_input_id is not null then select unit into expected_unit from public.input_catalog where id=new.catalog_input_id;
 else select unit into expected_unit from public.cost_inputs where id=new.cost_input_id and company_id=new.company_id; end if;
 if expected_unit is null or lower(trim(expected_unit))<>lower(trim(new.unit)) then raise exception 'Insumo ou unidade incompatível.'; end if;
 if new.observed_on>current_date then raise exception 'Data de consulta não pode estar no futuro.'; end if;
 return new;
end $$;
create trigger market_price_validation before insert on public.market_prices for each row execute function public.validate_market_price();
comment on table public.market_prices is 'Observações manuais imutáveis; não representam compras nem preços coletados automaticamente.';
