import test from 'node:test';
import assert from 'node:assert/strict';
import {requestQuoteItem,prepareRequestItems,budgetReferenceLabel,requestStatusLabel,procurementTraceRows} from '../src/utils/procurementTrace.js';
import {toQuote} from '../src/utils/quotes.js';
const input={id:'i1',source:'shared',code:'CIM',description:'Cimento',unit:'sc',inputType:'MATERIAL'};
test('Solicitação preserva identidade, unidade e quantidade; preços não são herdados como oferta',()=>{
 const r={id:'r1',catalog_input_id:'i1',quantity:4,unit:'SC'};const i=requestQuoteItem(r,input);
 assert.equal(i.requestItemId,'r1');assert.equal(i.quantity,4);assert.equal(i.unitPrice,'');
 assert.throws(()=>requestQuoteItem(r,{...input,unit:'kg'}));assert.throws(()=>requestQuoteItem(r,{...input,id:'i2'}));assert.throws(()=>requestQuoteItem(r,{...input,source:'company'}));
});
test('Solicitação antiga nunca é associada automaticamente apenas pelo nome',()=>{
 const r={items:[{id:'known',catalog_input_id:'i1',quantity:2,unit:'sc'},{id:'old',material_name:'Cimento',quantity:1,unit:'sc'}]};
 assert.equal(prepareRequestItems(r,[input]).length,1);assert.equal(requestQuoteItem(r.items[1],input).requestItemId,'old');
});
test('Cotação recupera a origem e referências da versão histórica para outras propostas',()=>{
 const origin={budget:{id:'b1',number:'ORC-01',revision:2,baseDate:'2026-11-07'},request:{id:'r',number:'SOL-1'}};
 const q=toQuote({id:'q',request_id:'r',quote_rounds:{origin_snapshot:origin,trace_version:1},quotation_items:[{id:'qi',request_item_id:'ri',budget_item_id:'bi',budget_refs:[{id:'bi',unitPrice:10}],catalog_input_id:'i1'}]});
 assert.equal(q.requestId,'r');assert.equal(q.items[0].requestItemId,'ri');assert.equal(q.items[0].budgetRefs[0].unitPrice,10);assert.match(budgetReferenceLabel(q.originSnapshot,q.traceVersion),/revisão 2/);
 const exported=procurementTraceRows(q);assert.equal(exported[0][1],'SOL-1');assert.equal(exported[0][3],'ORC-01');assert.equal(exported[0][4],2);assert.equal(exported[0][6],'bi');assert.equal(exported[0][10],10);
 assert.match(budgetReferenceLabel({},0),/não reconstruída/);assert.match(budgetReferenceLabel({},1),/Sem orçamento/);assert.equal(requestStatusLabel('PARTIALLY_RECEIVED'),'Recebida parcialmente');
});
