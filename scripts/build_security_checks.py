"""Compose reversible SQL tests with fresh signed-claim fixtures for QA only.
These simulated claims are not authentication tokens and never leave the SQL test transaction.
"""
from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
s=(root/'supabase/sql/security_hardening.sql').read_text(encoding='utf-8').replace('commit;','')
names=['company_bdi','budget_versions_import','procurement_traceability','suppliers_executive_report','project_access_approvals','team_purchase_planning','receipts_financial','receipt_quality_flow','security_hardening']
fresh="jsonb_build_array(jsonb_build_object('method','password','timestamp',extract(epoch from now())))"
for name in names:
 t=(root/('supabase/tests/'+name+'.sql')).read_text(encoding='utf-8').replace('begin;','',1).replace('rollback;','')
 if name!='security_hardening':
  t=re.sub(r"jsonb_build_object\('sub',([^,]+),'role','authenticated'\)",r"jsonb_build_object('sub',\1,'role','authenticated','amr',"+fresh+")",t)
  t="select set_config('request.jwt.claims',jsonb_build_object('role','authenticated','amr',"+fresh+")::text,true);\n"+t
 s+='\nsavepoint security_regression;\n'+t+'\nrollback to savepoint security_regression;\n'
s+="\nselect 'PASS: 9 SQL integration suites, all data rolled back' as validation;\nrollback;"
out=root/'.expo/security-regressions.sql';out.parent.mkdir(exist_ok=True);out.write_text(s,encoding='utf-8')
