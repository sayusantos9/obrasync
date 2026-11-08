import fs from 'node:fs';
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\bPERMANENTE\b/g,'').replace(/[^A-Z0-9]/g,'');
const before=JSON.parse(fs.readFileSync('.expo/catalog-before-2026-11-05.json','utf8'));
const used=new Map(),kept=[],archived=[];
for(const row of [...before].sort((a,b)=>Number(Boolean(b.source_page))-Number(Boolean(a.source_page)))){
 if(!['MATERIAL','EQUIPMENT'].includes(row.input_type)){archived.push({id:row.id,reason:'Fora do catálogo de materiais e equipamentos; preservado para histórico'});continue;}
 const bank=/\/SIN$/i.test(row.source_code||'')?'SINAPI':normalize(row.source_bank);
 const code=(row.source_code||'').replace(/\/SIN$/i,'').replace(/^0+/,'');
 const keys=[`description:${normalize(row.description)}:${normalize(row.unit)}`,...(code?[`source:${bank}:${code}:${normalize(row.unit)}`]:[])];
 const duplicate=keys.map(k=>used.get(k)).find(Boolean);
 if(duplicate){archived.push({id:row.id,reason:`Duplicado da referência ${duplicate.catalog_code}`});continue;}
 keys.forEach(k=>used.set(k,row));kept.push(row);
}
const groups=[
 ['Cimentos e argamassas',['cimento','argamassa','rejunte','cal hidratada']],
 ['Alvenaria e estrutura',['bloco concreto','tijolo','vergalhao','arame recozido','tela soldada']],
 ['Hidráulica',['tubo soldavel','joelho soldavel','tee soldavel','registro','luva soldavel']],
 ['Esgoto e drenagem',['tubo esgoto','joelho esgoto','caixa sifonada','ralo','sifao']],
 ['Elétrica',['cabo flexivel','disjuntor','eletroduto','tomada','interruptor']],
 ['Fixadores',['parafuso','bucha','prego','abracadeira']],
 ['Pintura',['tinta acrilica','massa corrida','selador','rolo pintura','pincel']],
 ['Impermeabilização e vedação',['impermeabilizante','manta asfaltica','silicone','fita veda rosca']],
 ['Revestimentos',['piso ceramico','porcelanato','revestimento','rodape']],
 ['Cobertura',['telha','calha','cumeeira']],
 ['Ferramentas e consumíveis',['broca','disco corte','lixa','colher pedreiro','desempenadeira']],
 ['Proteção individual',['luva seguranca','oculos protecao','capacete','botina','mascara protecao']],
];
const existingNames=new Set(kept.map(r=>normalize(r.description)+':'+normalize(r.unit)));
const buckets=[],seen=new Set(),date='2026-11-05';
for(const [category,queries] of groups){const rows=[],queryBuckets=[];
 for(const query of queries){
  const queryRows=[];
  const url=`https://www.telhanorte.com.br/api/catalog_system/pub/products/search/${encodeURIComponent(query)}?_from=0&_to=29`;
  try{const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(String(response.status));const data=await response.json();
   for(const product of data){for(const item of product.items||[]){
    const title=product.productName||item.nameComplete;
    if(!title||!query.split(' ').every(w=>normalize(title).includes(normalize(w)))||!normalize(title).startsWith(normalize(query.split(' ')[0])))continue;
    const seller=item.sellers?.find(s=>s.sellerDefault)||item.sellers?.[0];const offer=seller?.commertialOffer;
    if(!offer||offer.AvailableQuantity<=0||!Number.isFinite(offer.Price)||offer.Price<=0)continue;
    // Keep the price in the seller's declared measurement unit; never infer bag/kg conversions.
    const unit=String(item.measurementUnit||'').toLowerCase();
    if(!['un','m','m2','kg','l'].includes(unit)||Number(item.unitMultiplier)!==1)continue;
    const name=title,key=normalize(name)+':'+normalize(unit);
    const link=new URL(product.link);if(link.hostname!=='www.telhanorte.com.br'||link.protocol!=='https:')continue;
    if(seen.has(String(item.itemId))||existingNames.has(key))continue;
    seen.add(String(item.itemId));existingNames.add(key);
    queryRows.push({catalog_code:`TN-${item.itemId}`,source_file:'telhanorte-catalog-2026-11-05.json',source_bank:'TELHANORTE',source_code:String(item.itemId),description:name,category,unit,input_type:'MATERIAL',reference_quantity:0,reference_value:0,reference_unit_price:offer.Price,reference_date:date,source_url:link.href,reference_notes:'Preço público na unidade de venda declarada pela loja, sem frete. Confirmar embalagem, variante, condições de pagamento e entrega. Referência comercial, não SINAPI/ORSE.'});
   }}
  }catch(e){console.log(category,query,'unavailable',e.message);}
  queryBuckets.push(queryRows);
 }
 while(queryBuckets.some(b=>b.length))for(const b of queryBuckets)if(b.length)rows.push(b.shift());
 buckets.push(rows);console.log(category,rows.length);
}
const additions=[];
while(kept.length+additions.length<500&&buckets.some(b=>b.length)){for(const bucket of buckets){if(bucket.length&&kept.length+additions.length<500)additions.push(bucket.shift());}}
if(kept.length+additions.length!==500)throw Error(`Not enough reviewed candidates: ${kept.length}+${additions.length}`);
additions.forEach((r,i)=>r.source_row=i+2);
const manifest={date,source:'https://www.telhanorte.com.br/',before:before.length,retained:kept.length,archived,newCount:additions.length,activeTotal:500,additions};
fs.writeFileSync('docs/catalog-expansion-2026-11-05.json',JSON.stringify(manifest,null,2));
console.log('READY',JSON.stringify({retained:kept.length,archived:archived.length,added:additions.length,total:500}));
