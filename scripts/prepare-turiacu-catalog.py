from pathlib import Path
import json, collections, re
p=Path(__file__).resolve().parents[1]
source=json.loads((p/'docs/turiacu-pdf-extraction.json').read_text(encoding='utf-8'))
rows=source['rows'][:]
for issue in source['requires_review']:
 r=issue['row']
 if r[1]=='010101':
  item=dict(code=r[1],bank=r[2],description=r[3],category='Mão de Obra',unit='H',composition_coefficient='0,2000000',unit_price='21,94',review_note='Unidade H interpretada do cabeçalho Custo Horário; página 20 conferida visualmente.')
 elif r[1]=='049503':
  item=dict(code=r[1],bank=r[2],description=r[3],category='Material',unit='UN',composition_coefficient='1,0000000',unit_price='33,62')
 else:
  item=dict(code=r[1],bank=r[2],description=r[3],category=r[4],unit=r[6],composition_coefficient=r[7],unit_price=r[8])
 item['page']=20; item['description']=' '.join(item['description'].split());rows.append(item)
groups=collections.defaultdict(list)
for row in rows:groups[(row['bank'],row['code'],row['unit'].lower())].append(row)
types={'Material':'MATERIAL','Mão de Obra':'LABOR','Encargos Complementares':'COMPLEMENTARY','Serviços':'SERVICE_INPUT','Equipamento para Aquisição Permanente':'EQUIPMENT'}
dates={'SINAPI':'2026-07-01','SBC':'2026-08-01','ORSE':'2026-05-01','SEDOP':'2026-03-01','IOPES':'2026-04-01'}
catalog=[]
for index,(key,occurrences) in enumerate(sorted(groups.items())):
 row=occurrences[0]
 prices={r['unit_price'] for r in occurrences}
 assert len(prices)==1,(key,prices)
 price=float(row['unit_price'].replace('.','').replace(',','.'))
 code='PDF26-'+re.sub(r'[^A-Za-z0-9-]','-',f'{key[0]}-{key[1]}-{key[2]}').upper()
 catalog.append(dict(catalog_code=code,source_file=source['source'],source_row=index+2,source_page=row['page'],source_bank=row['bank'],source_code=row['code'],description=row['description'],category=row['category'],unit=row['unit'],reference_quantity=0,reference_value=0,reference_unit_price=price,reference_date=dates.get(row['bank']),is_material=types[row['category']]=='MATERIAL',input_type=types[row['category']],source_sha256=source['sha256']))
out={'source':source['source'],'sha256':source['sha256'],'catalog':catalog,'occurrences':rows,'notes':['A referência de mês usa dia 01 apenas como convenção de armazenamento. SEINFRA 028 não possui data informada.','Os itens da planilha anterior não foram substituídos nem unidos por semelhança textual.','Quantidade de referência zero indica quantidade global não importada; os coeficientes permanecem nas ocorrências.']}
(p/'docs/turiacu-catalog-reviewed.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
payload=json.dumps(catalog,ensure_ascii=False).replace("'","''")
sql=f"""insert into public.input_catalog(catalog_code,source_file,source_row,source_page,source_bank,source_code,description,category,unit,reference_quantity,reference_value,reference_unit_price,reference_date,is_material,input_type,source_sha256)
select catalog_code,source_file,source_row,source_page,source_bank,source_code,description,category,unit,reference_quantity,reference_value,reference_unit_price,reference_date,is_material,input_type,source_sha256
from jsonb_to_recordset('{payload}'::jsonb) as r(catalog_code text,source_file text,source_row int,source_page int,source_bank text,source_code text,description text,category text,unit text,reference_quantity numeric,reference_value numeric,reference_unit_price numeric,reference_date date,is_material boolean,input_type text,source_sha256 text)
on conflict(catalog_code) do nothing;
"""
(p/'supabase/sql/import_turiacu_pdf_catalog.sql').write_text(sql,encoding='utf-8')
print(json.dumps({'unique':len(catalog),'occurrences':len(rows),'types':dict(collections.Counter(i['input_type'] for i in catalog))}))
