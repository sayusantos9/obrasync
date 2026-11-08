const normalized=v=>String(v||'').trim().toLowerCase();
export function requestQuoteItem(requestItem,catalogInput){
 if(!catalogInput?.id||!['shared','company'].includes(catalogInput.source))throw new Error('Associe o item a um insumo do catálogo.');
 if(normalized(requestItem.unit)!==normalized(catalogInput.unit))throw new Error(`Unidade incompatível: a solicitação usa ${requestItem.unit} e o catálogo usa ${catalogInput.unit}. Não há conversão automática.`);
 if(requestItem.catalog_input_id&&(catalogInput.source!=='shared'||requestItem.catalog_input_id!==catalogInput.id))throw new Error('Mantenha o insumo identificado na solicitação.');
 if(requestItem.cost_input_id&&(catalogInput.source!=='company'||requestItem.cost_input_id!==catalogInput.id))throw new Error('Mantenha o insumo identificado na solicitação.');
 return {id:`REQ-${requestItem.id}`,requestItemId:requestItem.id,inputId:catalogInput.id,source:catalogInput.source,code:catalogInput.code,inputType:catalogInput.inputType,description:catalogInput.description,unit:catalogInput.unit,quantity:Number(requestItem.quantity),unitPrice:'',total:0};
}
export function prepareRequestItems(request,catalog){
 return (request?.items||[]).flatMap(i=>{
  const input=catalog.find(c=>(i.catalog_input_id&&c.source==='shared'&&c.id===i.catalog_input_id)||(i.cost_input_id&&c.source==='company'&&c.id===i.cost_input_id));
  return input?[requestQuoteItem(i,input)]:[];
 });
}
export function budgetReferenceLabel(origin,traceVersion){
 if(!traceVersion)return 'Documento anterior à rastreabilidade; origem não reconstruída.';
 const b=origin?.budget;
 return b?`${b.number} · revisão ${b.revision} · data-base ${b.baseDate||'não informada'}`:'Sem orçamento-base definido na criação.';
}
export const requestStatusLabel=s=>({PENDING:'Aguardando cotação',APPROVED:'Aprovada para cotação',QUOTING:'Em cotação',ORDERED:'Pedido gerado',PARTIALLY_RECEIVED:'Recebida parcialmente',RECEIVED:'Recebida',CANCELLED:'Cancelada',REJECTED:'Rejeitada'})[s]||s;
export const TRACE_HEADERS=['Documento','Solicitação','Cotação de origem','Orçamento de origem','Revisão','Item adquirido','Item do orçamento (ID)','Código previsto','Quantidade prevista','Unidade prevista','Preço previsto sem BDI'];
export function procurementTraceRows(document){
 const origin=document.originSnapshot||document.origin_snapshot||{},prefix=[document.number||document.id,origin.request?.number||'Sem vínculo',origin.quote?.number||'',origin.budget?.number||((document.traceVersion||document.trace_version)?'Sem base':'Legado sem referência'),origin.budget?.revision||''];
 return (document.items||[]).flatMap(i=>{const refs=i.budgetRefs||i.budget_refs||[];return refs.length?refs.map(r=>[...prefix,i.description||i.name||'',r.id,r.code,r.quantity,r.unit,r.unitPrice]):[[...prefix,i.description||i.name||'','Sem correspondência','','','','']];});
}
