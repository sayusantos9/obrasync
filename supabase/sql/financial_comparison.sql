begin;
create table if not exists public.budget_stock_reservations (
 project_id uuid not null references public.projects(id),material_id uuid not null references public.materials(id),
 budget_id uuid not null references public.budgets(id),quantity numeric(18,6) not null check(quantity>0),
 reason text not null,created_by uuid not null references public.profiles(id),updated_at timestamptz not null default now(),
 primary key(project_id,material_id));
alter table public.budget_stock_reservations enable row level security;
revoke all on public.budget_stock_reservations from anon,authenticated;
grant select on public.budget_stock_reservations to authenticated;
drop policy if exists reservations_read on public.budget_stock_reservations;
create policy reservations_read on public.budget_stock_reservations for select to authenticated using(public.can_access_project(project_id) and public.current_app_role() in ('MASTER','ENGINEERING','PURCHASING','REQUESTER'));

create or replace function public.reserve_budget_stock(p_project_id uuid,p_material_id uuid,p_quantity numeric,p_reason text,p_budget_id uuid default null) returns void
language plpgsql security definer set search_path='' as $$ declare bid uuid; balance numeric; local_received numeric; before_value jsonb; begin
 perform public.require_project_access(p_project_id);
 if coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING','PURCHASING') then raise exception 'Perfil não autorizado a reservar estoque.'; end if;
 if p_quantity is null or p_quantity<0 or p_quantity::text in ('NaN','Infinity','-Infinity') or length(btrim(coalesce(p_reason,'')))<5 then raise exception 'Informe quantidade não negativa e motivo com ao menos 5 caracteres.';end if;
 select baseline_budget_id into bid from public.projects where id=p_project_id for share;
 if bid is null then raise exception 'Defina o orçamento-base antes de reservar.';end if;
 if p_budget_id is not null and bid<>p_budget_id then raise exception 'O orçamento-base mudou. Atualize a comparação antes de reservar.';end if;
 select quantity into balance from public.stock_items where project_id=p_project_id and material_id=p_material_id and company_id=public.current_company_id() for update;
 if not found then raise exception 'Estoque indisponível nesta obra.';end if;
 select coalesce(sum(i.quantity),0) into local_received from public.receipt_items i join public.receipts r on r.id=i.receipt_id where r.project_id=p_project_id and i.material_id=p_material_id;
 -- Conservative external-stock coverage: never count purchases of this project twice.
 if p_quantity>greatest(0,balance-local_received) then raise exception 'Reserva excede o estoque externo comprovável. Compras já recebidas nesta obra não podem ser descontadas novamente.';end if;
 if p_quantity>0 and not exists(select 1 from public.budget_items i join public.materials m on m.id=p_material_id where i.budget_id=bid and lower(btrim(i.unit))=lower(btrim(m.unit)) and ((i.catalog_input_id is not null and i.catalog_input_id=m.catalog_input_id) or (i.input_id is not null and i.input_id=m.cost_input_id))) then raise exception 'Insumo sem correspondência no orçamento-base.';end if;
 select to_jsonb(r) into before_value from public.budget_stock_reservations r where project_id=p_project_id and material_id=p_material_id;
 if p_quantity=0 then delete from public.budget_stock_reservations where project_id=p_project_id and material_id=p_material_id;
 else insert into public.budget_stock_reservations(project_id,material_id,budget_id,quantity,reason,created_by) values(p_project_id,p_material_id,bid,p_quantity,btrim(p_reason),auth.uid()) on conflict(project_id,material_id) do update set budget_id=excluded.budget_id,quantity=excluded.quantity,reason=excluded.reason,created_by=excluded.created_by,updated_at=now();end if;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(public.current_company_id(),p_project_id,auth.uid(),'RESERVE_BUDGET_STOCK',p_material_id,jsonb_build_object('before',before_value,'quantity',p_quantity,'budgetId',bid,'reason',btrim(p_reason)));
end $$;
create or replace function public.guard_reserved_stock() returns trigger language plpgsql security definer set search_path='' as $$ declare reserved numeric;begin
 select coalesce(sum(r.quantity),0) into reserved from public.budget_stock_reservations r join public.projects p on p.id=r.project_id and p.baseline_budget_id=r.budget_id where r.project_id=new.project_id and r.material_id=new.material_id;
 if new.quantity<reserved then raise exception 'Saldo reservado para o orçamento. Libere a reserva em Previsto × compra antes da saída ou transferência.';end if;
 return new;
end $$;
drop trigger if exists protect_reserved_stock on public.stock_items;
create trigger protect_reserved_stock before update of quantity on public.stock_items for each row execute function public.guard_reserved_stock();

create or replace function public.financial_comparison_snapshot(p_project_id uuid,p_budget_id uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$ declare result jsonb;bid uuid;begin
 perform public.require_project_access(p_project_id);
 if coalesce(public.current_app_role(),'') not in ('MASTER','ENGINEERING') then raise exception 'Perfil não autorizado à comparação financeira.';end if;
 result:=public.executive_report_snapshot(p_project_id);
 bid:=coalesce(p_budget_id,(result->'project'->>'baseline_budget_id')::uuid);
 if bid is not null then
  if not exists(select 1 from public.budgets where id=bid and project_id=p_project_id and company_id=public.current_company_id() and deleted_at is null) then raise exception 'Orçamento indisponível nesta obra.';end if;
  result:=jsonb_set(result,'{baseline}',(select to_jsonb(b)||jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(i) order by i.id) from public.budget_items i where budget_id=b.id),'[]'::jsonb)) from public.budgets b where b.id=bid));
 end if;
 return result||jsonb_build_object('reservations',coalesce((select jsonb_agg(to_jsonb(r)) from public.budget_stock_reservations r join public.projects p on p.id=r.project_id and p.baseline_budget_id=r.budget_id where r.project_id=p_project_id and r.budget_id=bid),'[]'::jsonb));
end $$;
revoke all on function public.reserve_budget_stock(uuid,uuid,numeric,text,uuid),public.guard_reserved_stock(),public.financial_comparison_snapshot(uuid,uuid) from public,anon;
grant execute on function public.reserve_budget_stock(uuid,uuid,numeric,text,uuid),public.financial_comparison_snapshot(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
