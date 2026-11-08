begin;
create table if not exists public.operation_attachments(
 id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id),
 project_id uuid not null references public.projects(id), kind text not null check(kind in ('request','quote','order','receipt')),
 entity_id uuid not null, object_path text unique not null, filename text not null, mime_type text not null,
 size_bytes bigint not null check(size_bytes between 1 and 10485760), created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create index if not exists operation_attachment_target on public.operation_attachments(kind,entity_id);
alter table public.operation_attachments enable row level security;
create or replace function public.can_access_operation_file(p_kind text,p_entity uuid,p_project uuid,p_write boolean default false) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare cid uuid:=public.current_company_id(); role_name text:=coalesce(public.current_app_role(),'');
begin
 if auth.uid() is null or role_name not in ('MASTER','ENGINEERING','PURCHASING','REQUESTER')
 or not exists(select 1 from public.companies where id=cid and active)
 or not exists(select 1 from public.projects where id=p_project and company_id=cid) then return false; end if;
 if p_kind='quote' then
  return role_name in ('MASTER','ENGINEERING','PURCHASING') and exists(select 1 from public.quotations where id=p_entity and project_id=p_project and company_id=cid);
 elsif p_kind='order' then
  return (not p_write or role_name in ('MASTER','PURCHASING')) and exists(select 1 from public.purchase_orders where id=p_entity and project_id=p_project and company_id=cid);
 elsif p_kind='request' then
  return (not p_write or role_name in ('MASTER','PURCHASING','REQUESTER')) and exists(select 1 from public.material_requests where id=p_entity and project_id=p_project and company_id=cid and (role_name<>'REQUESTER' or requester_id=auth.uid()));
 elsif p_kind='receipt' then
  return (not p_write or role_name in ('MASTER','PURCHASING','REQUESTER')) and exists(select 1 from public.receipts where id=p_entity and project_id=p_project and company_id=cid);
 end if;
 return false;
end $$;
create or replace function public.operation_file_path_allowed(p_path text,p_write boolean) returns boolean
language plpgsql stable security definer set search_path='' as $$
begin
 if split_part(p_path,'/',1) is distinct from public.current_company_id()::text or array_length(string_to_array(p_path,'/'),1)<>5 then return false; end if;
 return public.can_access_operation_file(split_part(p_path,'/',3),split_part(p_path,'/',4)::uuid,split_part(p_path,'/',2)::uuid,p_write);
exception when invalid_text_representation then return false;
end $$;
drop policy if exists operation_attachment_read on public.operation_attachments;
create policy operation_attachment_read on public.operation_attachments for select to authenticated using(company_id=public.current_company_id() and public.can_access_operation_file(kind,entity_id,project_id,false));
grant select on public.operation_attachments to authenticated;
revoke insert,update,delete on public.operation_attachments from authenticated,anon;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('operation-attachments','operation-attachments',false,10485760,array['application/pdf','image/jpeg','image/png'])
 on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists operation_file_upload on storage.objects;
create policy operation_file_upload on storage.objects for insert to authenticated with check(bucket_id='operation-attachments' and public.operation_file_path_allowed(name,true));
drop policy if exists operation_file_read on storage.objects;
create policy operation_file_read on storage.objects for select to authenticated using(bucket_id='operation-attachments' and (exists(select 1 from public.operation_attachments a where a.object_path=name and public.can_access_operation_file(a.kind,a.entity_id,a.project_id,false)) or (owner_id=auth.uid()::text and public.operation_file_path_allowed(name,true) and not exists(select 1 from public.operation_attachments where object_path=name))));
-- Failed registrations can be cleaned up by their uploader; registered evidence cannot be deleted through Storage.
drop policy if exists operation_file_cleanup on storage.objects;
create policy operation_file_cleanup on storage.objects for delete to authenticated using(bucket_id='operation-attachments' and owner_id=auth.uid()::text and public.operation_file_path_allowed(name,true) and not exists(select 1 from public.operation_attachments where object_path=name));
create or replace function public.register_operation_attachment(p_path text,p_filename text) returns uuid
language plpgsql security definer set search_path='' as $$
declare obj storage.objects; entity uuid; kind text; pid uuid; aid uuid;
begin
 if not public.operation_file_path_allowed(p_path,true) then raise exception 'Anexo não autorizado para este documento.'; end if;
 select id into aid from public.operation_attachments where object_path=p_path and created_by=auth.uid();
 if found then return aid; end if;
 select * into obj from storage.objects where bucket_id='operation-attachments' and name=p_path and owner_id=auth.uid()::text;
 if not found or coalesce((obj.metadata->>'size')::bigint,0) not between 1 and 10485760 or coalesce(obj.metadata->>'mimetype','') not in ('application/pdf','image/jpeg','image/png') then raise exception 'Arquivo indisponível ou inválido.'; end if;
 if length(p_filename) not between 1 and 180 or p_filename !~* '\.(pdf|png|jpe?g)$' then raise exception 'Nome de arquivo inválido.'; end if;
 pid:=split_part(p_path,'/',2)::uuid;kind:=split_part(p_path,'/',3);entity:=split_part(p_path,'/',4)::uuid;
 insert into public.operation_attachments(company_id,project_id,kind,entity_id,object_path,filename,mime_type,size_bytes,created_by)
 values(public.current_company_id(),pid,kind,entity,p_path,p_filename,obj.metadata->>'mimetype',(obj.metadata->>'size')::bigint,auth.uid()) returning id into aid;
 insert into public.operation_audit(company_id,project_id,actor_id,action,entity_id,details) values(public.current_company_id(),pid,auth.uid(),'ATTACHMENT_ADDED',entity,jsonb_build_object('kind',kind,'attachment',aid,'filename',p_filename));
 return aid;
end $$;
revoke all on function public.can_access_operation_file(text,uuid,uuid,boolean),public.operation_file_path_allowed(text,boolean),public.register_operation_attachment(text,text) from public,anon;
grant execute on function public.can_access_operation_file(text,uuid,uuid,boolean),public.operation_file_path_allowed(text,boolean),public.register_operation_attachment(text,text) to authenticated;
commit;
