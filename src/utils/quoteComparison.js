import {parseDecimal,roundMoney} from './bdi.js';
import {toDatabaseDate} from './dates.js';
export function prepareComparableQuote(data,projectId){
 if(!projectId)throw new Error('Selecione uma obra.');
 if(!data.title?.trim()||!data.supplierName?.trim())throw new Error('Informe título e fornecedor.');
 if(!data.roundId&&!data.roundTitle?.trim())throw new Error('Informe o nome da rodada de cotações.');
 const validUntil=toDatabaseDate(data.validUntil),expectedAt=toDatabaseDate(data.expectedAt);
 if(!validUntil||!expectedAt)throw new Error('Informe validade e entrega prevista.');
 if(!data.items?.length)throw new Error('Selecione os insumos do catálogo.');
 const seen=new Set();
 const items=data.items.map(i=>{
  const quantity=parseDecimal(i.quantity),unitPrice=parseDecimal(i.unitPrice),key=i.source+':'+i.inputId;
  if(!i.inputId||!i.code||!['shared','company'].includes(i.source)||!['MATERIAL','EQUIPMENT'].includes(i.inputType)||!i.unit)throw new Error('Selecione somente insumos cadastrados.');
  if(seen.has(key))throw new Error('Consolide itens repetidos antes de salvar.');seen.add(key);
  if(!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(unitPrice)||unitPrice<0)throw new Error('Revise quantidades e preços.');
  return {...i,quantity,unitPrice,total:roundMoney(quantity*unitPrice)};
 });
 const fees=Object.fromEntries(['freight','taxes','discount'].map(k=>{const value=parseDecimal(data[k]||0);if(!Number.isFinite(value)||value<0)throw new Error('Frete, tributos e desconto devem ser valores positivos ou zero.');return [k,value];}));
 const subtotal=roundMoney(items.reduce((s,i)=>s+i.total,0)),total=roundMoney(subtotal+fees.freight+fees.taxes-fees.discount);
 if(total<0)throw new Error('Desconto maior que o valor da proposta.');
 return {...data,...fees,items,subtotal,total,validUntil,expectedAt,projectId};
}
export function basketSignature(items=[]){
 if(!items.length||items.some(i=>!i.inputId||!i.source))return null;
 return JSON.stringify(items.map(i=>[i.source,i.inputId,String(i.unit).trim().toLowerCase(),Number(i.quantity)]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
}
const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
export function compareQuoteRound(quotes=[],today=localDate()){
 const signature=basketSignature(quotes[0]?.items);
 const sameBasket=!!signature&&quotes.every(q=>basketSignature(q.items)===signature);
 const rows=quotes.map(q=>({...q,expired:!q.validUntil||toDatabaseDate(q.validUntil)<today,comparable:sameBasket&&!!q.roundId}));
 const eligible=rows.filter(q=>q.comparable&&!q.expired);
 const lowest=eligible.length?Math.min(...eligible.map(q=>q.total)):null;
 return {sameBasket,rows:rows.map(q=>({...q,lowest:q.comparable&&!q.expired&&q.total===lowest,difference:lowest===null?null:roundMoney(q.total-lowest)}))};
}
