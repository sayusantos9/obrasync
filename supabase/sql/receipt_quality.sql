begin;
create table if not exists public.receipt_quality (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id),
 project_id uuid not null references public.projects(id),receipt_id uuid not null references public.receipts(id),
 order_item_id uuid not null references public.purchase_order_items(id),
 accepted_quantity numeric not null check(accepted_quantity>=0),rejected_quantity numeric not null check(rejected_quantity>=0),
 reason text,nonconformity text,created_at timestamptz not null default now(),
 unique(receipt_id,order_item_id),check(accepted_quantity+rejected_quantity>0));
create table if not exists public.supplier_returns (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.companies(id),
 project_id uuid not null references public.projects(id),receipt_item_id uuid not null references public.receipt_items(id),
 quantity numeric not null check(quantity>0),reason text not null,nonconformity text,reference text,
 created_by uuid not null references public.profiles(id),created_at timestamptz not null default now());
alter table public.stock_movements add column if not exists supplier_return_id uuid references public.supplier_returns(id);
do $$ declare t text;begin
 foreach t in array array['receipt_quality','supplier_returns'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('drop policy if exists quality_read on public.%I',t);
 execute format('create policy quality_read on public.%I for select to authenticated using(company_id=public.current_company_id() and public.can_access_project(project_id) and public.current_app_role() in (''MASTER'',''ENGINEERING'',''PURCHASING'',''REQUESTER''))',t);
 end loop;
end $$;

-- Called exclusively through the existing idempotent procurement dispatcher.
create or replace function public.return_received_item(p_project_id uuid,p_data jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare cid uuid:=public.current_company_id();ri public.receipt_items;r public.receipts;o public.purchase_orders;
 qty numeric:=(p_data->>'quantity')::numeric;already numeric;balance numeric;entity uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_project_id::text,71));
 perform public.require_project_access(p_project_id);
 if coalesce(public.current_app_role(),'') not in ('MASTER','PURCHASING') then raise exception 'Somente Gestor e Compras podem devolver ao fornecedor.';end if;
 if qty is null or qty<=0 or qty::text in ('NaN','Infinity','-Infinity') or length(btrim(coalesce(p_data->>'reason','')))<5 then raise exception 'Informe quantidade positiva e motivo com ao menos 5 caracteres.';end if;
 select * into r from public.receipts where id=(select receipt_id from public.receipt_items where id=(p_data->>'receiptItemId')::uuid) and company_id=cid and project_id=p_project_id;
 if not found then raise exception 'Recebimento não autorizado.';end if;
 select * into o from public.purchase_orders where id=r.order_id and company_id=cid and project_id=p_project_id for update;
 if not found or o.purchased_at is null or o.approval_status<>'APPROVED' or o.status='CANCELLED' then raise exception 'Compra indisponível para devolução.';end if;
 select * into ri from public.receipt_items where id=(p_data->>'receiptItemId')::uuid and receipt_id=r.id for update;
 if not found or ri.order_item_id is null then raise exception 'Item sem vínculo ao pedido; revise o histórico.';end if;
 perform 1 from public.purchase_order_items where id=ri.order_item_id and order_id=o.id for update;
 if not found then raise exception 'Item incompatível com o pedido.';end if;
 select coalesce(sum(quantity),0) into already from public.supplier_returns where receipt_item_id=ri.id;
 if qty>ri.quantity-already then raise exception 'Quantidade excede o saldo devolvível deste recebimento.';end if;
 select quantity into balance from public.stock_items where project_id=p_project_id and material_id=ri.material_id and company_id=cid for update;
 if balance is null or balance<qty then raise exception 'Saldo de estoque insuficiente para devolver; itens consumidos ou transferidos não podem ser devolvidos desta obra.';end if;
 insert into public.supplier_returns(company_id,project_id,receipt_item_id,quantity,reason,nonconformity,reference,created_by)
 values(cid,p_project_id,ri.id,qty,btrim(p_data->>'reason'),nullif(btrim(p_data->>'nonconformity'),''),nullif(btrim(p_data->>'reference'),''),auth.uid()) returning id into entity;
 update public.stock_items set quantity=quantity-qty where project_id=p_project_id and material_id=ri.material_id and company_id=cid;
 insert into public.stock_movements(company_id,project_id,material_id,movement_type,quantity,reference,reason,created_by,supplier_return_id)
 values(cid,p_project_id,ri.material_id,'OUT',qty,entity::text,btrim(p_data->>'reason'),auth.uid(),entity);
 update public.purchase_order_items set received_quantity=received_quantity-qty where id=ri.order_item_id and order_id=o.id;
 update public.purchase_orders set status='PARTIALLY_RECEIVED' where id=o.id;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(cid,p_project_id,auth.uid(),'SUPPLIER_RETURN',entity,p_data);
 return jsonb_build_object('id',entity);
end $$;
revoke all on function public.return_received_item(uuid,jsonb) from public,anon,authenticated;

do $$ declare body text;needle text;begin
 body:=replace(pg_get_functiondef('public.procurement_action_internal(text,uuid,jsonb)'::regprocedure),E'\r','');
 if position('-- receipt-quality-v1' in body)=0 then
 body:=replace(body,'result jsonb;','result jsonb; rejected numeric; quality_reason text;');
 if position('quality_reason text' in body)=0 then raise exception 'Review procurement declarations';end if;
 body:=regexp_replace(body,E'\nbegin\n',E'\nbegin\n -- receipt-quality-v1\n if p_action=''RETURN'' then return public.return_received_item(p_project_id,p_data);end if;\n','i');
 needle:='   if qty is null or qty<=0 or qty::text in (''NaN'',''Infinity'') or qty>line.quantity-line.received_quantity then raise exception ''Quantidade excede o saldo a receber.''; end if;';
 if position(needle in body)=0 then raise exception 'Review receive quantity validation';end if;
 body:=replace(body,needle,$patch$
   rejected:=coalesce((item->>'rejectedQuantity')::numeric,0);quality_reason:=nullif(btrim(item->>'reason'),'');
   if qty is null or qty<0 or rejected<0 or qty::text in ('NaN','Infinity','-Infinity') or rejected::text in ('NaN','Infinity','-Infinity') or qty+rejected<=0 or qty+rejected>line.quantity-line.received_quantity then raise exception 'Quantidade aceita e rejeitada excede o saldo a receber ou é inválida.';end if;
   if rejected>0 and length(coalesce(quality_reason,''))<5 then raise exception 'Informe o motivo da rejeição com ao menos 5 caracteres.';end if;
   insert into public.receipt_quality(company_id,project_id,receipt_id,order_item_id,accepted_quantity,rejected_quantity,reason,nonconformity)
   values(cid,p_project_id,entity,line.id,qty,rejected,quality_reason,nullif(btrim(item->>'nonconformity'),''));
   if qty=0 then continue;end if;
$patch$);
 execute body;
 end if;
 -- Both reports use the same authorized snapshot. Purchases remain gross until an explicit financial credit exists.
 body:=replace(pg_get_functiondef('public.executive_report_snapshot(uuid)'::regprocedure),E'\r','');
 if position('-- quality-snapshot-v1' in body)=0 then
 if position(' return result;' in body)=0 then raise exception 'Review executive snapshot';end if;
 body:=replace(body,' return result;',$patch$
 -- quality-snapshot-v1
 return result||jsonb_build_object('quality',coalesce((select jsonb_agg(to_jsonb(q)) from public.receipt_quality q where q.project_id=p_project_id and q.company_id=cid),'[]'::jsonb),'returns',coalesce((select jsonb_agg(to_jsonb(s)) from public.supplier_returns s where s.project_id=p_project_id and s.company_id=cid),'[]'::jsonb));
$patch$);execute body;end if;
end $$;
notify pgrst,'reload schema';
commit;
