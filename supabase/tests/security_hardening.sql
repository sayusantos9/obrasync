begin;
create or replace function pg_temp.set_test_auth(uid uuid,methods jsonb,aal text default 'aal1',sid uuid default null) returns void language plpgsql as $$begin
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated','iat',extract(epoch from now()),'amr',methods,'aal',aal,'session_id',sid)::text,true);
end $$;
do $$ declare uid uuid;cid uuid;pid uuid;bid uuid;cat public.input_catalog;claims jsonb;factor uuid:=gen_random_uuid();method jsonb;begin
 select id,company_id into uid,cid from public.profiles where role='MASTER' and active limit 1;
 select id into pid from public.projects where company_id=cid limit 1;
 select * into cat from public.input_catalog where catalog_active and input_type='MATERIAL' limit 1;
 perform pg_temp.set_test_auth(uid,'[]');
 execute 'set local role authenticated';
 bid:=public.save_budget_version(pid,jsonb_build_object('title','SECURITY ROLLBACK','baseDate',current_date,'bdiConfig',jsonb_build_object('enabled',false),'items',jsonb_build_array(jsonb_build_object('inputId',cat.id,'code',cat.catalog_code,'unit',cat.unit,'source','shared','quantity',1,'unitPrice',10))));
 for method in select * from jsonb_array_elements(jsonb_build_array('[]'::jsonb,jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now()-interval '1 hour'))),jsonb_build_array(jsonb_build_object('method','token_refresh','timestamp',extract(epoch from now()))))) loop
  perform pg_temp.set_test_auth(uid,method);
  begin perform public.set_budget_baseline(pid,bid);raise exception 'ASSERT stale session accepted';exception when sqlstate 'PT401' then if sqlerrm<>'REAUTH_REQUIRED' then raise;end if;end;
  begin perform public.save_project_access(pid,uid,true,null);raise exception 'ASSERT access changed without reauth';exception when sqlstate 'PT401' then null;end;
  begin perform public.procurement_action('PURCHASE',pid,'{}');raise exception 'ASSERT purchase bypass';exception when sqlstate 'PT401' then null;end;
  begin perform public.procurement_action('RETURN',pid,'{}');raise exception 'ASSERT return bypass';exception when sqlstate 'PT401' then null;end;
 end loop;
 claims:=jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now())));
 perform pg_temp.set_test_auth(uid,claims,'aal1',gen_random_uuid());
 begin perform public.set_budget_baseline(pid,bid);raise exception 'ASSERT revoked/missing session accepted';exception when sqlstate 'PT401' then null;end;
 perform pg_temp.set_test_auth(uid,claims);perform public.set_budget_baseline(pid,bid);
 execute 'reset role';
 insert into auth.mfa_factors(id,user_id,friendly_name,factor_type,status,created_at,updated_at,secret) values(factor,uid,'QA ROLLBACK','totp','verified',now(),now(),'QA-NOT-A-REAL-SECRET');
 execute 'set local role authenticated';
 begin perform public.set_budget_baseline(pid,bid);raise exception 'ASSERT second factor bypass';exception when sqlstate 'PT401' then if sqlerrm<>'MFA_REQUIRED' then raise;end if;end;
 perform pg_temp.set_test_auth(uid,jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now()-interval '1 hour')),jsonb_build_object('method','totp','timestamp',extract(epoch from now()))),'aal2');
 begin perform public.set_budget_baseline(pid,bid);raise exception 'ASSERT new factor refreshed stale password';exception when sqlstate 'PT401' then if sqlerrm<>'REAUTH_REQUIRED' then raise;end if;end;
 perform pg_temp.set_test_auth(uid,claims||jsonb_build_array(jsonb_build_object('method','totp','timestamp',extract(epoch from now()))),'aal2');
 perform public.set_budget_baseline(pid,bid);
 execute 'reset role';delete from auth.mfa_factors where id=factor;
 update public.profiles set active=false where id=uid;
 execute 'set local role authenticated';
 begin perform public.set_budget_baseline(pid,bid);raise exception 'ASSERT inactive master accepted';exception when raise_exception then if sqlerrm='ASSERT inactive master accepted' or position('inativa' in sqlerrm)=0 then raise;end if;end;
 execute 'reset role';
 if has_function_privilege('anon','public.require_recent_auth()','execute') or has_function_privilege('authenticated','public.require_recent_auth()','execute') then raise exception 'Private security helper exposed';end if;
end $$;
rollback;
