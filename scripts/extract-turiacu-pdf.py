"""Extract source input rows only. Composition coefficients are NOT planned quantities."""
from pathlib import Path
import json, hashlib, sys
import pdfplumber
source=Path(sys.argv[1]); root=Path(__file__).resolve().parents[1]
rows=[]; rejected=[]
with pdfplumber.open(source) as pdf:
 for page_index in range(9,57):
  for table in pdf.pages[page_index].extract_tables():
   for row in table:
    if not row or (row[0] or '').strip()!='Insumo': continue
    if len(row)!=9: rejected.append({'page':page_index+1,'row':row}); continue
    _,code,bank,description,category,unit,coefficient,price,total=row
    item={'page':page_index+1,'code':code,'bank':bank,'description':' '.join((description or '').split()),'category':' '.join((category or '').split()),'unit':unit,'composition_coefficient':coefficient,'unit_price':price}
    if not all([code,bank,description,unit,price]) or '\ufffd' in str(item): rejected.append(item)
    else: rows.append(item)
result={'source':source.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'rows':rows,'requires_review':rejected,'note':'Coeficientes pertencem às composições; não são quantidades planejadas da obra.'}
out=root/'docs'/'turiacu-pdf-extraction.json';out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'rows':len(rows),'review':len(rejected),'output':str(out)}))
