-- Apply once in Supabase SQL Editor before deploying market-search.
create table if not exists public.market_search_quota (
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null default current_date,
 calls integer not null default 0,
 primary key(user_id,day)
);
alter table public.market_search_quota enable row level security;
revoke all on public.market_search_quota from anon,authenticated;
create or replace function public.consume_market_search(p_project_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare used integer;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and active and role in ('MASTER','ENGINEERING','PURCHASING'))
 or not exists(select 1 from public.projects where id=p_project_id and company_id=public.current_company_id()) then
 raise exception 'Não autorizado'; end if;
 insert into public.market_search_quota(user_id,day,calls) values(auth.uid(),current_date,1)
 on conflict(user_id,day) do update set calls=public.market_search_quota.calls+1 where public.market_search_quota.calls<20 returning calls into used;
 if used is null then raise exception 'Limite diário atingido'; end if;
end; $$;
revoke all on function public.consume_market_search(uuid) from public,anon;
grant execute on function public.consume_market_search(uuid) to authenticated;
