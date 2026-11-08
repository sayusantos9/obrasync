export const STORES=[
 {id:'potiguar',name:'Potiguar',host:'www.apotiguar.com.br',search:q=>`https://www.apotiguar.com.br/busca?busca=${encodeURIComponent(q)}`,type:'html'},
 {id:'telhanorte',name:'Telhanorte',host:'www.telhanorte.com.br',search:q=>`https://www.telhanorte.com.br/api/catalog_system/pub/products/search/${encodeURIComponent(q)}?_from=0&_to=11`,type:'vtex'},
];
const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const canonical=s=>({un:'un',und:'un',unidade:'un',unidades:'un',pc:'un',peca:'un',kg:'kg',quilo:'kg',m:'m',metro:'m',metros:'m',m2:'m2','m²':'m2',l:'l',litro:'l',litros:'l'})[plain(s).trim()]||plain(s).trim();
const decode=s=>String(s).replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
function ownUrl(value,store){try{const u=new URL(value,`https://${store.host}`);return u.protocol==='https:'&&u.hostname===store.host&&!u.username&&!u.password?u.href:null;}catch{return null;}}

// Packaging in the product name can support a quantity conversion, never technical equivalence.
export function packaging(name,requestedUnit,measurementUnit='',multiplier=1){
 const wanted=canonical(requestedUnit),title=plain(name);
 if(wanted==='un'&&!( /\b(?:kit|pacote|caixa|jogo|conjunto)\b/.test(title)))return {unit:requestedUnit,packQuantity:1,unitKnown:true};
 const pattern=/(\d+(?:[.,]\d+)?)\s*(kg|m²|m2|metros?\b|m\b|litros?\b|l\b)/g;
 const amounts=[...title.matchAll(pattern)].filter(m=>canonical(m[2])===wanted).map(m=>Number(m[1].replace(',','.')));
 if(amounts.length===1&&amounts[0]>0)return {unit:requestedUnit,packQuantity:amounts[0],unitKnown:true};
 if(canonical(measurementUnit)===wanted&&Number.isFinite(multiplier)&&multiplier>0)return {unit:requestedUnit,packQuantity:multiplier,unitKnown:true};
 return {unit:measurementUnit||'embalagem',packQuantity:1,unitKnown:false};
}
export function relevant(name,query){
 const words=plain(query).match(/[a-z0-9]+/g)||[];
 const significant=words.filter(w=>w.length>2&&!['para','com','por','das','dos','tipo'].includes(w));
 const title=plain(name);
 // A search API may return popular products rather than matches: reject unrelated results.
 return significant.length>0&&significant.slice(0,3).every(w=>title.includes(w));
}
function offer(store,name,url,price,unit,measurement='',multiplier=1){
 const link=ownUrl(url,store);
 if(!link||typeof price!=='number'||!Number.isFinite(price)||price<=0)return null;
 return {supplier:store.name,product:String(name).slice(0,500),url:link,price,...packaging(name,unit,measurement,multiplier),comparable:false,notes:'Preço público de referência. Conferir variante, pagamento, frete, disponibilidade e entrega para o CEP diretamente na loja.'};
}
export function parsePotiguar(html,query,unit){
 const store=STORES[0],offers=[];
 // Read the visible price in each product card; do not use tracking/analytics values as prices.
 for(const card of html.split('<div spot-container').slice(1)){
  const link=card.match(/<a\b[^>]*href=(?:"([^\"]+)"|'([^']+)'|([^\s>]+))/i);
  const title=card.match(/<span[^>]*font-semibold[^>]*>([^<]+)<\/span>/i);
  const price=card.match(/<div[^>]*font-extrabold[^>]*>\s*R\$\s*([\d.,]+)/i);
  if(!link||!title||!price)continue;
  const name=decode(title[1]);if(!relevant(name,query))continue;
  const row=offer(store,name,decode(link[1]||link[2]||link[3]),Number(price[1].replace(/\./g,'').replace(',','.')),unit);
  if(row)offers.push(row);
 }
 return offers;
}
export function parseVtex(products,query,unit){
 if(!Array.isArray(products))throw new Error('Formato de catálogo alterado');
 const offers=[];
 for(const p of products){for(const item of p.items||[]){
  const name=item.nameComplete||p.productName;if(!relevant(name,query))continue;
  const seller=(item.sellers||[]).find(s=>s.sellerDefault)||item.sellers?.[0],price=seller?.commertialOffer;
  if(!(price?.AvailableQuantity>0))continue;
  const row=offer(STORES[1],name,p.link,price.Price,unit,item.measurementUnit,Number(item.unitMultiplier));
  if(row)offers.push(row);
 }}
 return offers;
}
async function readLimited(response){
 if(!response.ok)throw new Error(`Loja indisponível (${response.status})`);
 if(!response.body)throw new Error('Resposta vazia');
 const reader=response.body.getReader(),decoder=new TextDecoder();let size=0,text='';
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>3000000)throw new Error('Resposta muito grande');text+=decoder.decode(value,{stream:true});}return text+decoder.decode();}finally{await reader.cancel().catch(()=>{});}
}
export async function searchStores(query,preferred='',unit='un',fetcher=fetch){
 const selected=preferred?STORES.filter(s=>[s.id,s.name,s.host].some(n=>plain(n)===plain(preferred).trim())):STORES;
 if(!selected.length)return {offers:[],sources:[],stores:[],summary:'Loja ainda não integrada. Escolha Potiguar, Telhanorte ou pesquisa geral.'};
 const results=await Promise.all(selected.map(async store=>{
  const url=store.search(query);
  try{
   const res=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(12000),headers:{Accept:store.type==='html'?'text/html':'application/json','User-Agent':'ObraSync-PriceResearch/1.0'}});
   const body=await readLimited(res);
   if(/captcha|access denied|enable javascript/i.test(body.slice(0,2000)))throw new Error('Consulta automática bloqueada pela loja');
   const offers=store.type==='html'?parsePotiguar(body,query,unit):parseVtex(JSON.parse(body),query,unit);
   return {name:store.name,url,status:offers.length?'ok':'empty',offers:offers.slice(0,6)};
  }catch{return {name:store.name,url,status:'unavailable',offers:[]};}
 }));
 const offers=results.flatMap(r=>r.offers),seen=new Set();
 return {offers:offers.filter(o=>{if(seen.has(o.url))return false;seen.add(o.url);return true;}).slice(0,12),
  sources:results.filter(r=>r.status!=='unavailable').map(r=>({title:`Busca na ${r.name}`,url:r.offers[0]?.url||'https://'+STORES.find(s=>s.name===r.name).host})),
  stores:results.map(({name,status})=>({name,status})),
  summary:offers.length?'Ofertas públicas encontradas. Confira a especificação antes de comparar com seu orçamento.':'Nenhuma oferta com preço pôde ser extraída. Tente uma descrição mais curta ou consulte a loja.',
 };
}
