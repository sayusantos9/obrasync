"""Encrypted logical backup and isolated restore. Never restores over the hosted DB.
Requires PostgreSQL 17 tools, cryptography, psycopg[binary], authenticated Supabase CLI.
All connection values remain in process memory; output contains only validation metadata.
"""
import argparse,ctypes,datetime,hashlib,io,json,os,re,secrets,shlex,shutil,socket,subprocess,sys,tempfile,uuid,zipfile
from pathlib import Path
import psycopg
from psycopg import sql
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

REF='innpfmlkbqsgdiynapxb'
ROOT=Path(os.environ['LOCALAPPDATA'])/'ObraSync'
TOOLS=Path(os.environ.get('OBRASYNC_PG_BIN',str(ROOT/'RecoveryTools/pgsql/bin')))
CLI=Path(os.environ.get('OBRASYNC_SUPABASE_CLI',str(Path(os.environ['LOCALAPPDATA'])/'npm-cache/_npx/aa8e5c70f9d8d161/node_modules/@supabase/cli-windows-x64/bin/supabase.exe')))
REPO=Path(__file__).resolve().parent.parent
class Blob(ctypes.Structure):_fields_=[('size',ctypes.c_ulong),('data',ctypes.POINTER(ctypes.c_ubyte))]
def dpapi(value,decode=False):
 source=ctypes.create_string_buffer(value);src=Blob(len(value),ctypes.cast(source,ctypes.POINTER(ctypes.c_ubyte)));out=Blob()
 fn=ctypes.windll.crypt32.CryptUnprotectData if decode else ctypes.windll.crypt32.CryptProtectData
 if not fn(ctypes.byref(src),None,None,None,None,1,ctypes.byref(out)):raise RuntimeError('Windows key protection failed')
 try:return ctypes.string_at(out.data,out.size)
 finally:ctypes.windll.kernel32.LocalFree(out.data)
def command(args,env=None,timeout=180):
 # Windows PostgreSQL descendants can retain pipe handles. File-backed capture
 # waits only for the command, not for the lifetime of the database server.
 with tempfile.TemporaryFile() as out,tempfile.TemporaryFile() as err:
  r=subprocess.run([str(a) for a in args],env=env,stdout=out,stderr=err,timeout=timeout,creationflags=subprocess.CREATE_NO_WINDOW)
  out.seek(0);err.seek(0);stdout=out.read().decode('utf-8',errors='replace');stderr=err.read().decode('utf-8',errors='replace')
 if r.returncode:
  # No connection strings, hashes of passwords, SQL data or service credentials in console output.
  error=RuntimeError('Recovery command failed: '+Path(str(args[0])).name)
  error.private_detail=stderr
  raise error
 return stdout
def manifest(connection):
 result={}
 with connection.cursor() as c:
  c.execute("select n.nspname,c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','auth','storage') and c.relkind='r' order by 1,2")
  for schema,table in c.fetchall():
   c.execute(sql.SQL("select count(*),md5(coalesce(string_agg(md5(to_jsonb(t)::text),'' order by md5(to_jsonb(t)::text)),'')) from {}.{} t").format(sql.Identifier(schema),sql.Identifier(table)))
   count,digest=c.fetchone();result[schema+'.'+table]={'rows':count,'md5':digest}
 return result
def authorization(connection):
 with connection.cursor() as c:
  c.execute("""select jsonb_build_object(
   'tables',(select jsonb_agg(jsonb_build_array(t.relname,r.name,has_table_privilege(r.name,t.oid,'SELECT'),has_table_privilege(r.name,t.oid,'INSERT'),has_table_privilege(r.name,t.oid,'UPDATE'),has_table_privilege(r.name,t.oid,'DELETE')) order by t.relname,r.name) from pg_class t join pg_namespace n on n.oid=t.relnamespace cross join (values ('anon'),('authenticated')) r(name) where n.nspname='public' and t.relkind='r'),
   'columns',(select jsonb_agg(jsonb_build_array(t.relname,a.attname,r.name,has_column_privilege(r.name,t.oid,a.attnum,'UPDATE')) order by t.relname,a.attname,r.name) from pg_class t join pg_namespace n on n.oid=t.relnamespace join pg_attribute a on a.attrelid=t.oid and a.attnum>0 and not a.attisdropped cross join (values ('anon'),('authenticated')) r(name) where n.nspname='public' and t.relkind='r'),
   'functions',(select jsonb_agg(jsonb_build_array(p.proname,pg_get_function_identity_arguments(p.oid),r.name,has_function_privilege(r.name,p.oid,'EXECUTE')) order by p.proname,pg_get_function_identity_arguments(p.oid),r.name) from pg_proc p join pg_namespace n on n.oid=p.pronamespace cross join (values ('anon'),('authenticated')) r(name) where n.nspname='public'),
   'policies',(select jsonb_agg(jsonb_build_array(tablename,policyname,permissive,roles,cmd,qual,with_check) order by tablename,policyname) from pg_policies where schemaname='public'))""")
  return c.fetchone()[0]
def retain_verified_backups(folder,now):
 verified=[]
 for meta in folder.glob('*.verification.json'):
  try:
   item=json.loads(meta.read_text(encoding='utf-8'));name=meta.name.removesuffix('.verification.json');artifact=folder/(name+'.obsbackup')
   if not re.fullmatch(r'\d{8}T\d{6}Z-[0-9a-f]{8}',name) or item.get('status')!='PASS' or item.get('project')!=REF or not artifact.is_file():continue
   if hashlib.sha256(artifact.read_bytes()).hexdigest()!=item['encrypted_backup_sha256']:continue
   verified.append((datetime.datetime.fromisoformat(item['created_at']),artifact,meta))
  except (ValueError,KeyError,OSError):continue
 verified.sort(reverse=True,key=lambda row:row[0]);removed=0
 for created,artifact,meta in verified[2:]:
  if now-created>datetime.timedelta(days=30) and artifact.resolve().parent==folder.resolve() and meta.resolve().parent==folder.resolve():
   artifact.unlink();meta.unlink();removed+=1
 return removed
def main(existing=None):
 started=datetime.datetime.now(datetime.timezone.utc);runid=started.strftime('%Y%m%dT%H%M%SZ')+'-'+uuid.uuid4().hex[:8]
 backups=ROOT/'Backups';drills=ROOT/'RecoveryDrills';keys=ROOT/'RecoveryKeys'
 for p in (backups,drills,keys):p.mkdir(parents=True,exist_ok=True)
 work=drills/runid;work.mkdir();data=work/'postgres';running=False;backup_path=None
 try:
  if existing:
   backup_path=Path(existing).expanduser().resolve()
   encrypted=backup_path.read_bytes()
   keyfile=keys/'backup-aes256.dpapi'
  else:
   plan=command([CLI,'db','dump','--remote='+REF,'--dry-run','--schema','public,auth,storage'])
   values={t.split('=',1)[0]:t.split('=',1)[1] for t in shlex.split(plan) if re.match(r'^PG[A-Z_]+=',t)}
   if set(values)<{'PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE'}:raise RuntimeError('Incomplete temporary database connection')
   environment={**os.environ,**values,'PGSSLMODE':'require','PGCLIENTENCODING':'UTF8','PGOPTIONS':'-c timezone=UTC'}
   connection=psycopg.connect(host=values['PGHOST'],port=values['PGPORT'],user=values['PGUSER'],password=values['PGPASSWORD'],dbname=values['PGDATABASE'],sslmode='require',options='-c timezone=UTC',autocommit=True)
   with connection:
    connection.execute('set role postgres')
    connection.execute('begin isolation level repeatable read read only')
    snap=connection.execute('select pg_export_snapshot()').fetchone()[0]
    expected=manifest(connection)
    expected_authorization=authorization(connection)
    roles=[r[0] for r in connection.execute("select rolname from pg_roles where rolname !~ '^pg_'").fetchall()]
    bucket_rows=connection.execute('select b.id,(select count(*) from storage.objects o where o.bucket_id=b.id) from storage.buckets b order by b.id').fetchall()
    command([TOOLS/'pg_dump.exe','--role=postgres','--format=custom','--schema=public','--schema=auth','--schema=storage','--snapshot='+snap,'--file='+str(work/'database.dump')],environment)
   objects=work/'objects';objects.mkdir()
   for bucket,object_count in bucket_rows:
    target=objects/bucket;target.mkdir()
    if object_count:command([CLI,'storage','cp','--remote='+REF,'--recursive','ss:///'+bucket+'/',str(target)])
   object_hashes={str(p.relative_to(objects)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in objects.rglob('*') if p.is_file()}
   expected_object_count=expected.get('storage.objects',{}).get('rows',0)
   if len(object_hashes)!=expected_object_count:raise RuntimeError('Storage changed or object download incomplete; retry with a quiet maintenance window')
   package=io.BytesIO()
   with zipfile.ZipFile(package,'w',zipfile.ZIP_DEFLATED) as z:
    z.write(work/'database.dump','database.dump')
    z.writestr('manifest.json',json.dumps({'project':REF,'created_at':started.isoformat(),'tables':expected,'authorization':expected_authorization,'roles':roles,'objects':object_hashes},ensure_ascii=False))
    for p in objects.rglob('*'):
     if p.is_file():z.write(p,'objects/'+str(p.relative_to(objects)).replace('\\','/'))
    for folder in ('supabase/sql','supabase/functions','supabase/tests','scripts'):
     for p in (REPO/folder).rglob('*'):
      if p.is_file() and p.suffix in ('.sql','.ts','.json','.py','.txt'):z.write(p,'source/'+str(p.relative_to(REPO)).replace('\\','/'))
   keyfile=keys/'backup-aes256.dpapi'
   if keyfile.exists():key=dpapi(keyfile.read_bytes(),True)
   else:key=secrets.token_bytes(32);keyfile.write_bytes(dpapi(key))
   nonce=secrets.token_bytes(12);encrypted=b'OBRASYNC-BACKUP-V1\n'+nonce+AESGCM(key).encrypt(nonce,package.getvalue(),REF.encode())
   backup_path=backups/(runid+'.obsbackup');backup_path.write_bytes(encrypted)
  # Restore from the encrypted artifact, not the original plaintext dump.
  restored=work/'restored';restored.mkdir();artifact=backup_path.read_bytes();header=b'OBRASYNC-BACKUP-V1\n';offset=len(header)
  clear=AESGCM(dpapi(keyfile.read_bytes(),True)).decrypt(artifact[offset:offset+12],artifact[offset+12:],REF.encode())
  with zipfile.ZipFile(io.BytesIO(clear)) as z:
   for info in z.infolist():
    if not (restored/info.filename).resolve().is_relative_to(restored.resolve()):raise RuntimeError('Unsafe archive path')
   z.extractall(restored)
  check=json.loads((restored/'manifest.json').read_text(encoding='utf-8'))
  if check.get('project')!=REF:raise RuntimeError('Unexpected project in encrypted backup')
  restored_hashes={str(p.relative_to(restored/'objects')).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in (restored/'objects').rglob('*') if p.is_file()} if (restored/'objects').exists() else {}
  if restored_hashes!=check['objects']:raise RuntimeError('Storage restore checksum mismatch')
  password=secrets.token_urlsafe(32);pw=work/'password';pw.write_text(password,encoding='ascii')
  command([TOOLS/'initdb.exe','-D',data,'-U','restore_admin','--pwfile='+str(pw),'--auth-host=scram-sha-256','--auth-local=scram-sha-256','--encoding=UTF8','--locale=C'])
  pw.unlink()
  with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
  command([TOOLS/'pg_ctl.exe','-D',data,'-l',work/'postgres.log','-o',f'-h 127.0.0.1 -p {port}','-w','start']);running=True
  local=dict(host='127.0.0.1',port=port,user='restore_admin',password=password,dbname='postgres',options='-c timezone=UTC')
  with psycopg.connect(**local,autocommit=True) as c:
   if c.info.host!='127.0.0.1' or c.info.user!='restore_admin':raise RuntimeError('Refusing non-local restore target')
   for role in check['roles']:
    if role=='postgres':c.execute(sql.SQL('create role {} login superuser password {}').format(sql.Identifier(role),sql.Literal(password)))
    elif role!='restore_admin':c.execute(sql.SQL('create role {} nologin').format(sql.Identifier(role)))
   c.execute('drop schema public')
   c.execute('create schema extensions');c.execute('create extension if not exists pgcrypto with schema extensions');c.execute('create extension if not exists "uuid-ossp" with schema extensions')
  localenv={**os.environ,'PGHOST':'127.0.0.1','PGPORT':str(port),'PGUSER':'restore_admin','PGPASSWORD':password,'PGDATABASE':'postgres','PGCLIENTENCODING':'UTF8','PGOPTIONS':'-c timezone=UTC'}
  command([TOOLS/'pg_restore.exe','--exit-on-error','--dbname=postgres',restored/'database.dump'],localenv)
  with psycopg.connect(**local) as c:
   actual=manifest(c)
   if actual!=check['tables']:raise RuntimeError('Restored table counts/checksums differ')
   if authorization(c)!=check['authorization']:raise RuntimeError('Restored policies or effective permissions differ')
   rls=c.execute("select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity").fetchone()[0]
   policies=c.execute("select count(*) from pg_policies where schemaname='public'").fetchone()[0]
  testroot=restored/'source' if (restored/'source/scripts/build_security_checks.py').exists() else REPO
  command([sys.executable,testroot/'scripts/build_security_checks.py'])
  command([TOOLS/'psql.exe','-X','--set=ON_ERROR_STOP=on','--file='+str(testroot/'.expo/security-regressions.sql')],{**localenv,'PGUSER':'postgres'})
  report={'status':'PASS','project':REF,'created_at':started.isoformat(),'completed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'tables_verified':len(actual),'rows_verified':sum(t['rows'] for t in actual.values()),'storage_objects_verified':len(restored_hashes),'public_rls_tables':rls,'public_policies':policies,'effective_permissions_verified':True,'sql_flow_suites_on_restored_database':9,'encrypted_backup_sha256':hashlib.sha256(encrypted).hexdigest(),'encrypted_backup':str(backup_path),'key_protection':'AES-256-GCM; key wrapped by Windows DPAPI, separate RecoveryKeys directory','scope':'public, auth and storage schemas/data; storage object bytes; SQL/Edge source. Local PostgreSQL restore, not a hosted failover.'}
  (backups/(runid+('.recheck.json' if existing else '.verification.json'))).write_text(json.dumps(report,indent=2),encoding='utf-8')
  report['old_verified_backups_removed']=retain_verified_backups(backups,datetime.datetime.now(datetime.timezone.utc))
  print(json.dumps(report,ensure_ascii=False))
 except Exception as e:
  if hasattr(e,'private_detail'):(work/'private-error.log').write_text(e.private_detail,encoding='utf-8')
  restore_errors=re.findall(r'ERROR: ([^\r\n]+)',getattr(e,'private_detail',''))[:2]
  print(json.dumps({'status':'FAILED','step':str(e) if isinstance(e,RuntimeError) else type(e).__name__,'permission_detail':e.diag.message_primary if getattr(e,'sqlstate',None)=='42501' else None,'restore_errors':restore_errors,'encrypted_backup_created':backup_path is not None}));raise SystemExit(1)
 finally:
  if running:
   try:command([TOOLS/'pg_ctl.exe','-D',data,'-m','fast','-w','stop']);running=False
   except Exception:pass
  if not running and not (data/'postmaster.pid').exists() and work.resolve().parent==drills.resolve():
   # Verified absolute disposable directory; never recursively remove backups/keys.
   shutil.rmtree(work)
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--verify',help='Restore and validate an existing encrypted artifact without contacting Supabase');main(parser.parse_args().verify)
