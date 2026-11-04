alter table public.budgets add column if not exists deleted_at timestamptz;
alter table public.budgets add column if not exists deletion_reason text;
alter table public.quotations add column if not exists deleted_at timestamptz;
alter table public.quotations add column if not exists deletion_reason text;
revoke delete on public.budgets,public.quotations from authenticated;
create policy budgets_not_archived on public.budgets as restrictive for select to authenticated using(deleted_at is null);
create policy quotations_not_archived on public.quotations as restrictive for select to authenticated using(deleted_at is null);
create function public.protect_archive_fields() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if current_user not in ('postgres','service_role','supabase_admin') and (new.deleted_at is distinct from old.deleted_at or new.deletion_reason is distinct from old.deletion_reason) then raise exception 'Use a operação de arquivamento com justificativa.'; end if;
 return new;
end $$;
create trigger budgets_archive_guard before update on public.budgets for each row execute function public.protect_archive_fields();
create trigger quotations_archive_guard before update on public.quotations for each row execute function public.protect_archive_fields();
create function public.archive_document(p_kind text,p_id uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare cid uuid:=public.current_company_id(); role_name text:=coalesce(public.current_app_role(),''); pid uuid; snapshot jsonb;
begin
 if auth.uid() is null or cid is null or length(btrim(coalesce(p_reason,'')))<5 then raise exception 'Informe uma justificativa com ao menos 5 caracteres.'; end if;
 if p_kind='budget' then
  if role_name not in ('MASTER','ENGINEERING') then raise exception 'Perfil não autorizado.'; end if;
  select project_id,to_jsonb(b) into pid,snapshot from public.budgets b where id=p_id and company_id=cid and deleted_at is null for update;
  if not found then raise exception 'Orçamento indisponível.'; end if;
  update public.budgets set deleted_at=now(),deletion_reason=btrim(p_reason) where id=p_id;
 elsif p_kind='quote' then
  if role_name not in ('MASTER','ENGINEERING','PURCHASING') then raise exception 'Perfil não autorizado.'; end if;
  select project_id,to_jsonb(q) into pid,snapshot from public.quotations q where id=p_id and company_id=cid and deleted_at is null for update;
  if not found then raise exception 'Cotação indisponível.'; end if;
  update public.quotations set deleted_at=now(),deletion_reason=btrim(p_reason) where id=p_id;
 else raise exception 'Documento inválido.'; end if;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details)
 values(cid,pid,auth.uid(),'ARCHIVE_'||upper(p_kind),p_id,jsonb_build_object('reason',btrim(p_reason),'before',snapshot));
end $$;
revoke all on function public.archive_document(text,uuid,text) from public,anon;
grant execute on function public.archive_document(text,uuid,text) to authenticated;
