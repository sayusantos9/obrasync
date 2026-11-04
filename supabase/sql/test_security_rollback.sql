begin;
do $$
declare uid uuid; pid uuid; cid uuid; other_pid uuid;
begin
 select pr.id,p.id,pr.company_id into uid,pid,cid from public.profiles pr join public.projects p on p.company_id=pr.company_id where pr.active and pr.role='REQUESTER' limit 1;
 if uid is null then raise exception 'Missing requester fixture'; end if;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 begin
  perform public.procurement_action('APPROVE',pid,jsonb_build_object('id',gen_random_uuid()));
  raise exception using errcode='XX001',message='Requester approved order';
 exception when raise_exception then null; end;
 select id into other_pid from public.projects where company_id<>cid limit 1;
 if other_pid is not null then
  begin
   perform public.procurement_action('REQUEST',other_pid,'{"material":"TEST","quantity":1,"unit":"un"}');
   raise exception using errcode='XX001',message='Cross-company request accepted';
  exception when raise_exception then null; end;
 end if;
 begin
  perform public.procurement_action('STOCK',pid,'{"materialCode":"TEST","quantity":1,"direction":"IN","reason":"test"}');
  raise exception using errcode='XX001',message='Requester entered stock';
 exception when raise_exception then null; end;
end $$;
set local role authenticated;
do $$ begin
 begin
  perform public.procurement_action_internal('REQUEST',gen_random_uuid(),'{}');
  raise exception using errcode='XX001',message='Internal RPC exposed';
 exception when insufficient_privilege then null; end;
 begin
  update public.profiles set role='MASTER' where id=auth.uid();
  raise exception using errcode='XX001',message='Profile escalation allowed';
 exception when raise_exception then null; end;
end $$;
rollback;
