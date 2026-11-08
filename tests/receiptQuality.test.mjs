import test from 'node:test';
import assert from 'node:assert/strict';
import {receiptPayload,createReceiptQueue} from '../src/utils/receiptQueueCore.js';
import {returnableQuantity,supplierReturnPayload} from '../src/utils/receiptQuality.js';
import {buildExecutiveReport} from '../src/utils/executiveReport.js';
import {buildFinancialComparison} from '../src/utils/financialComparison.js';
const order={id:'o',projectId:'p',number:'P1',approval_status:'APPROVED',purchased_at:'2026-11-08',status:'SENT',items:[{id:'li',name:'Cimento',quantity:10,received_quantity:0,unit:'sc'}]};
test('Conferência distingue aceita/rejeitada, valida soma e motivo e permite rejeição total',()=>{
 const p=receiptPayload(order,{li:6},' NF 1 ',{li:{rejectedQuantity:4,reason:' Avaria ',nonconformity:'NC1'}});
 assert.deepEqual(p.items,[{id:'li',quantity:6,rejectedQuantity:4,reason:'Avaria',nonconformity:'NC1'}]);
 assert.equal(receiptPayload(order,{li:0},'',{li:{rejectedQuantity:10,reason:'Produto errado'}}).items[0].quantity,0);
 for(const quality of [{rejectedQuantity:5,reason:'Avaria'},{rejectedQuantity:4,reason:'x'},{rejectedQuantity:-1},{rejectedQuantity:'NaN'}])assert.throws(()=>receiptPayload(order,{li:6},'',{li:quality}));
});
test('Saldo devolvível desconta devoluções anteriores e exige motivo',()=>{
 const receipt={order_id:'o'},item={id:'ri',quantity:6,supplier_returns:[{quantity:2}]};
 assert.equal(returnableQuantity(item),4);
 assert.equal(supplierReturnPayload(receipt,item,'1,5','Defeito após entrega').quantity,1.5);
 for(const q of [5,0,-1,'','Infinity'])assert.throws(()=>supplierReturnPayload(receipt,item,q,'Defeito'));
 assert.throws(()=>supplierReturnPayload(receipt,item,1,'x'));
});
test('Devolução na fila mantém operação e chave após resposta ambígua e reinício',async()=>{
 const values=new Map(),storage={getItem:async k=>values.get(k),setItem:async(k,v)=>values.set(k,v)},user={id:'u',companyId:'c'},seen=[];
 let fail=true;const send=async(action,pid,data)=>{seen.push({action,pid,data});if(fail){fail=false;throw new Error('fetch failed');}return {id:'return'};};
 const queue=createReceiptQueue(storage,send),payload={orderId:'o',receiptItemId:'ri',quantity:2,reason:'Material avariado'};
 await queue.enqueue(user,'p',order,payload,'return-key-123456','RETURN');await queue.sync(user);
 assert.equal((await queue.read(user))[0].uncertain,true);
 await assert.rejects(queue.discard(user,'return-key-123456'));
 const restarted=createReceiptQueue(storage,send);await restarted.sync(user);
 assert.equal((await restarted.read(user)).length,0);assert.deepEqual(seen[0],seen[1]);assert.equal(seen[0].action,'RETURN');
});
const snapshot=()=>({project:{id:'p',name:'Obra'},baseline:{id:'b',project_id:'p',total:100,items:[{catalog_input_id:'c',description:'Cimento',unit:'sc',quantity:10,unit_price:10}]},orders:[{id:'o',project_id:'p',approval_status:'APPROVED',status:'PARTIALLY_RECEIVED',purchased_at:'2026-11-08',total:120,items:[{id:'li',catalog_input_id:'c',description:'Cimento',unit:'sc',quantity:10,unit_price:12}]}],receipts:[{id:'r',project_id:'p',order_id:'o',items:[{id:'ri',order_item_id:'li',material_id:'m',description:'Cimento',unit:'sc',quantity:6}]}],quality:[{project_id:'p',receipt_id:'r',order_item_id:'li',accepted_quantity:6,rejected_quantity:4,reason:'Avaria',nonconformity:'NC1'}],returns:[{id:'ret',project_id:'p',receipt_item_id:'ri',quantity:2,reason:'Defeito',nonconformity:'NC2'}],stock:[{project_id:'p',material_id:'m',quantity:1,material:{catalog_input_id:'c',name:'Cimento',unit:'sc'}}],movements:[{project_id:'p',material_id:'m',movement_type:'OUT',quantity:2,supplier_return_id:'ret'},{project_id:'p',material_id:'m',movement_type:'OUT',quantity:3}]});
test('Executivo usa recebido líquido, mantém comprado, separa devolução de consumo e exporta qualidade',()=>{
 const r=buildExecutiveReport(snapshot());assert.equal(r.metrics.received,48);assert.equal(r.metrics.toReceive,72);assert.equal(r.metrics.purchased,120);assert.equal(r.metrics.consumedEstimate,36);assert.equal(r.metrics.stockEstimate,12);
 assert.equal(r.sheets.find(s=>s.name==='Qualidade do recebimento').rows[1][3],4);
 assert.equal(r.sheets.find(s=>s.name==='Devoluções').rows[1][2],2);
 assert.equal(r.sheets.find(s=>s.name==='Movimentações').rows[1][3],'Devolução ao fornecedor');
 assert.ok(r.warnings.some(w=>w.includes('crédito/reembolso')));
});
test('Comparação não transforma devolução em consumo ou crédito financeiro fictício',()=>{
 const r=buildFinancialComparison(snapshot());assert.equal(r.summary.actual,120);assert.equal(r.rows[0].purchasedQuantity,10);assert.equal(r.rows[0].consumed,3);assert.ok(r.warnings.some(w=>w.includes('reposição pendente')));
});
test('Reposição fecha recebido líquido sem apagar conferência nem confundir unidades',()=>{
 const f=snapshot();f.receipts.push({id:'r2',project_id:'p',order_id:'o',items:[{id:'ri2',order_item_id:'li',material_id:'m',description:'Cimento',unit:'sc',quantity:6}]});
 const r=buildExecutiveReport(f);assert.equal(r.metrics.received,120);assert.equal(r.metrics.toReceive,0);assert.equal(r.metrics.purchased,120);
});
