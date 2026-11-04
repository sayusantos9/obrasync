-- Clients only see documents explicitly released for their own project.
alter table public.documents add column if not exists released_to_client boolean not null default false;
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents for select to authenticated using (
 company_id=public.current_company_id() and (
 public.has_role(array['MASTER','ENGINEERING','PURCHASING']) or
 (public.has_role(array['CLIENT']) and released_to_client and exists(
  select 1 from public.projects p where p.id=project_id and p.company_id=documents.company_id and p.client_user_id=auth.uid()
 ))
 ));
-- App and database agree: only the manager creates or changes projects.
alter policy projects_insert on public.projects with check(company_id=public.current_company_id() and public.has_role(array['MASTER']));
alter policy projects_update on public.projects using(company_id=public.current_company_id() and public.has_role(array['MASTER'])) with check(company_id=public.current_company_id() and public.has_role(array['MASTER']));
create policy requester_receipts_read on public.receipts for select to authenticated using(company_id=public.current_company_id() and public.has_role(array['REQUESTER']));
create policy requester_receipt_items_read on public.receipt_items for select to authenticated using(exists(select 1 from public.receipts r where r.id=receipt_id and r.company_id=public.current_company_id() and public.has_role(array['REQUESTER'])));
