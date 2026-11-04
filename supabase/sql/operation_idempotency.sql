create table public.operation_keys (
 company_id uuid not null references public.companies(id), actor_id uuid not null references auth.users(id),
 request_key text not null, action text not null, project_id uuid not null references public.projects(id),
 payload jsonb not null, result jsonb not null, created_at timestamptz not null default now(),
 primary key(company_id,actor_id,request_key)
);
alter table public.operation_keys enable row level security;
revoke all on public.operation_keys from anon,authenticated;
alter function public.procurement_action(text,uuid,jsonb) rename to procurement_action_internal;
revoke all on function public.procurement_action_internal(text,uuid,jsonb) from public,anon,authenticated;
create function public.procurement_action(p_action text,p_project_id uuid,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare cid uuid:=public.current_company_id(); uid uuid:=auth.uid(); token text:=p_data->>'clientRequestId'; previous public.operation_keys; result jsonb;
begin
 if uid is null or cid is null or public.current_app_role() is null then raise exception 'Sessão não autorizada.'; end if;
 if token is not null then
  if length(token)<10 or length(token)>150 then raise exception 'Identificador de operação inválido.'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(cid::text||uid::text||token,0));
  select * into previous from public.operation_keys where company_id=cid and actor_id=uid and request_key=token;
  if found then
   if previous.action<>p_action or previous.project_id<>p_project_id or previous.payload<>p_data then raise exception 'Operação já enviada com outros dados. Atualize a tela.'; end if;
   return previous.result;
  end if;
 end if;
 result:=public.procurement_action_internal(p_action,p_project_id,p_data);
 if token is not null then insert into public.operation_keys(company_id,actor_id,request_key,action,project_id,payload,result) values(cid,uid,token,p_action,p_project_id,p_data,result); end if;
 return result;
end $$;
revoke all on function public.procurement_action(text,uuid,jsonb) from public,anon;
grant execute on function public.procurement_action(text,uuid,jsonb) to authenticated;
revoke insert,update,delete on public.material_requests,public.material_request_items from authenticated;
