begin;
alter table public.receipts add column if not exists client_recorded_at timestamptz;
alter table public.receipts add column if not exists client_request_id text;
do $$ declare body text; needle text:='result:=public.procurement_action_internal(p_action,p_project_id,p_data);';begin
 body:=replace(pg_get_functiondef('public.procurement_action(text,uuid,jsonb)'::regprocedure),E'\r','');
 if position('-- receipt-offline-v1' in body)=0 then
  if position(needle in body)=0 then raise exception 'Routine changed: review receipt metadata integration.';end if;
  body:=replace(body,needle,needle||E'\n -- receipt-offline-v1\n if p_action=''RECEIVE'' then\n update public.receipts set client_request_id=p_data->>''clientRequestId'',client_recorded_at=nullif(p_data->>''recordedAt'','''')::timestamptz where id=(result->>''id'')::uuid and company_id=cid and project_id=p_project_id;\n end if;');
  execute body;
 end if;
end $$;
notify pgrst,'reload schema';
commit;
