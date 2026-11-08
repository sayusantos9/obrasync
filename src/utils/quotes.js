/** Validadores e mapeadores do módulo de cotações (sem dependências da interface). */
import { toDatabaseDate, dateForDisplay } from './dates.js';
export const META_PREFIX = 'OBRASYNC_QUOTE_V1:';
export function getProjectQuotes(quotes, projectId) {
  return !projectId ? [] : (quotes || []).filter(q=>q?.projectId===projectId);
}
export function prepareQuote(data, projectId) {
  if(!projectId)throw new Error('Selecione uma obra antes de cadastrar a cotação.');
  for(const [field,message] of [['title','Informe o título.'],['clientName','Informe o cliente.'],['supplierName','Informe o fornecedor.'],['validUntil','Informe a validade.']]){
    if(!String(data?.[field]||'').trim())throw new Error(message);
  }
  const validity=toDatabaseDate(data.validUntil);
  if(!Array.isArray(data.items)||!data.items.length)throw new Error('Adicione pelo menos um item à cotação.');
  const items = data.items.map(item=>{
    const quantity=Number(item?.quantity),unitPrice=Number(item?.unitPrice);
    if(!item?.description?.trim()||!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(unitPrice)||unitPrice<0)
      throw new Error('Revise descrição, quantidade e preço unitário dos itens.');
    return {description:item.description.trim(),quantity,unit:item.unit||'un',unitPrice,total:Math.round(quantity*unitPrice*100)/100};
  });
  return {...data,validUntil:validity,projectId,items,total:Math.round(items.reduce((s,i)=>s+i.total,0)*100)/100};
}
export function encodeQuoteMeta(data){
  const {title,clientName,clientDocument,supplierName,supplierDocument,supplierContact,supplierEmail,paymentTerms,notes}=data;
  return META_PREFIX+JSON.stringify({title,clientName,clientDocument,supplierName,supplierDocument,supplierContact,supplierEmail,paymentTerms,notes});
}
export function decodeQuoteMeta(value){
  if(!String(value||'').startsWith(META_PREFIX))return {notes:value||''};
  try{return JSON.parse(value.slice(META_PREFIX.length));}catch{return {notes:value||''};}
}
export function toQuote(row){
  const info=decodeQuoteMeta(row.notes);
  return {id:row.id,number:row.number||`COT-${String(row.id).slice(0,6)}`,projectId:row.project_id,
    requestId:row.request_id||null,originSnapshot:row.quote_rounds?.origin_snapshot||{},traceVersion:row.quote_rounds?.trace_version||0,roundId:row.round_id||null,roundTitle:row.quote_rounds?.title||'',awardedQuoteId:row.quote_rounds?.awarded_quote_id||null,awardReason:row.quote_rounds?.award_reason||'',orderId:row.quote_rounds?.order_id||null,
    freight:Number(row.freight||0),taxes:Number(row.taxes||0),discount:Number(row.discount||0),expectedAt:row.expected_at||null,
    companyId:row.company_id,status:row.status||'OPEN',total:Number(row.total||0),validUntil:dateForDisplay(row.expires_at),
    title:info.title||`Cotação ${row.number||''}`,clientName:info.clientName||'',clientDocument:info.clientDocument||'',
    supplierName:info.supplierName||'',supplierDocument:info.supplierDocument||'',supplierContact:info.supplierContact||'',
    supplierEmail:info.supplierEmail||'',paymentTerms:info.paymentTerms||'',notes:info.notes||'',
    items:(row.quotation_items||[]).map(item=>({id:item.id,requestItemId:item.request_item_id||null,budgetRefs:item.budget_refs||[],budgetItemId:item.budget_item_id||null,inputId:item.catalog_input_id||item.cost_input_id,source:item.catalog_input_id?'shared':item.cost_input_id?'company':null,code:item.input_code||'',inputType:item.input_type||null,description:item.description,unit:item.unit||'un',quantity:Number(item.quantity||0),unitPrice:Number(item.unit_price||0),total:Number(item.total??(Number(item.quantity||0)*Number(item.unit_price||0)))}))};
}
