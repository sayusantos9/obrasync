begin;
create or replace function public.require_recent_auth() returns void
language plpgsql security definer set search_path='' as $$
declare claims jsonb:=auth.jwt();last_auth numeric;sid uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles u join public.companies c on c.id=u.company_id and c.active where u.id=auth.uid() and u.active) then raise exception 'Conta ou empresa inativa.';end if;
 sid:=nullif(claims->>'session_id','')::uuid;
 if sid is not null and not exists(select 1 from auth.sessions where id=sid and user_id=auth.uid()) then raise exception using errcode='PT401',message='REAUTH_REQUIRED',detail='Sessão encerrada. Confirme sua identidade novamente.';end if;
 -- A newly enrolled factor must not turn an old stolen session into a fresh one.
 -- Require recent password authentication, plus aal2 when MFA is enrolled.
 select max((m->>'timestamp')::numeric) into last_auth from jsonb_array_elements(coalesce(claims->'amr','[]')) m where m->>'method'='password';
 if last_auth is null or last_auth<extract(epoch from now()-interval '15 minutes') or last_auth>extract(epoch from now()+interval '1 minute') then raise exception using errcode='PT401',message='REAUTH_REQUIRED',detail='Confirme sua identidade para esta ação crítica. A confirmação vale por 15 minutos.';end if;
 if exists(select 1 from auth.mfa_factors where user_id=auth.uid() and status='verified') and coalesce(claims->>'aal','aal1')<>'aal2' then raise exception using errcode='PT401',message='MFA_REQUIRED',detail='Confirme o código do seu autenticador.';end if;
end $$;
revoke all on function public.require_recent_auth() from public,anon,authenticated;
revoke all on function public.sync_request_procurement_status(),public.capture_order_origin(),public.capture_order_item_origin() from public,anon,authenticated;

do $$ declare f record;body text;guard text;begin
 for f in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in
 ('save_project_access','save_company_user','set_budget_baseline','decide_purchase_order','award_quote','archive_document','return_received_item','save_company_bdi','procurement_action') loop
  body:=replace(pg_get_functiondef(f.oid),E'\r','');
  if position('-- recent-auth-v1' in body)>0 then continue;end if;
  guard:=case when f.proname='procurement_action' then 'if p_action in (''PURCHASE'',''RETURN'') then perform public.require_recent_auth();end if;' else 'perform public.require_recent_auth();' end;
  if body !~* '\mbegin\M' then raise exception 'Review authentication integration for %',f.proname;end if;
  body:=regexp_replace(body,'\mbegin\M',E'begin\n -- recent-auth-v1\n '||guard||E'\n','i');execute body;
 end loop;
end $$;
notify pgrst,'reload schema';
commit;
