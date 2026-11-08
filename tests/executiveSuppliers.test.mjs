import test from 'node:test';
import assert from 'node:assert/strict';
import {buildExecutiveReport} from '../src/utils/executiveReport.js';
import {prepareSupplier,supplierMatches} from '../src/utils/suppliers.js';
const item={id:'li',catalog_input_id:'cement',description:'Cimento',quantity:4,unit:'sc',unit_price:10};
const fixture=()=>({generatedAt:'2026-11-07T12:00:00Z',project:{id:'p',name:'Obra'},baseline:{id:'base',project_id:'p',total:120,items:[{...item,id:'bi',quantity:10}]},orders:[{id:'o',project_id:'p',number:'P1',approval_status:'APPROVED',purchased_at:'2026-11-07',status:'PARTIALLY_RECEIVED',total:48,freight:10,taxes:2,discount:4,items:[item]},{id:'pending',project_id:'p',approval_status:'APPROVED',status:'SENT',total:26,items:[{...item,id:'li2',quantity:2,unit_price:13}]}],receipts:[{id:'r',project_id:'p',order_id:'o',items:[{id:'ri',order_item_id:'li',material_id:'m',description:'Cimento',quantity:2,unit:'sc'}]}],stock:[{project_id:'p',material_id:'m',quantity:1,material:{name:'Cimento',unit:'sc'}}],movements:[{project_id:'p',material_id:'m',movement_type:'OUT',quantity:1},{project_id:'p',destination_project_id:'p2',material_id:'m',movement_type:'TRANSFER',quantity:3}],expenses:[{project_id:'p',amount:5}]});
test('Executivo concilia base, etapas sobrepostas, recebimento parcial e projeção sem duplicar despesas',()=>{
 const r=buildExecutiveReport(fixture());assert.deepEqual(r.metrics,{baselineDirect:100,baselineWithBdi:120,committed:74,approvedNotPurchased:26,purchased:48,received:24,toReceive:24,consumedEstimate:12,stockEstimate:12,budgetBalance:26,projection:122,expenses:5});
 assert.equal(r.items.length,1);assert.equal(r.items[0].remaining,4);assert.equal(r.items[0].priceImpact,8);
});
test('Pendentes, rejeitados, cancelados, arquivados e outra obra não viram custo realizado',()=>{
 const f=fixture(),o=f.orders[0];f.orders.push({...o,id:'bad',approval_status:'PENDING'},{...o,id:'bad2',approval_status:'REJECTED'},{...o,id:'bad3',status:'CANCELLED'},{...o,id:'bad4',deleted_at:'today'},{...o,id:'foreign',project_id:'elsewhere'});
 assert.equal(buildExecutiveReport(f).metrics.committed,74);
});
test('Sem base não inventa orçamento zero; saldo/saída sem custo ficam explicitamente sem valoração',()=>{
 const f=fixture();f.baseline=null;f.stock.push({project_id:'p',material_id:'unknown',quantity:7,material:{unit:'kg',name:'Entrada manual'}});f.movements.push({project_id:'p',material_id:'unknown',quantity:2,movement_type:'OUT'});
 const r=buildExecutiveReport(f);assert.equal(r.metrics.baselineDirect,null);assert.equal(r.metrics.projection,null);assert.equal(r.unknownStock,1);assert.equal(r.unknownConsumed,1);assert.equal(r.metrics.stockEstimate,12);assert.equal(r.metrics.consumedEstimate,12);
});
test('Identidades e unidades distintas não são consolidadas pelo nome; rateio fecha os centavos do pedido',()=>{
 const f=fixture();f.orders=[{...f.orders[0],total:1,freight:1,items:[{...item,id:'a',quantity:1,unit_price:0},{...item,id:'b',quantity:1,unit:'kg',unit_price:0},{...item,id:'c',catalog_input_id:null,cost_input_id:'cement',quantity:1,unit_price:0}]}];f.receipts=[];
 const r=buildExecutiveReport(f);assert.equal(r.items.length,3);assert.equal(r.items.reduce((s,i)=>s+Math.round(i.committed*100),0),100);assert.ok(r.warnings.some(w=>w.includes('igualmente')));
});
test('Recebimento sem vínculo ou com unidade incompatível não gera valor fictício',()=>{
 const f=fixture();f.receipts[0].items[0].unit='kg';const r=buildExecutiveReport(f);assert.equal(r.metrics.received,0);assert.ok(r.warnings.some(w=>w.includes('conciliável')));
});
test('Fornecedor normaliza identificação, valida contatos e permite busca sem acento',()=>{
 const s=prepareSupplier({name:'  São Pedro  ',document:'12.345.678/0001-90',email:' CONTACT@EXAMPLE.COM ',phone:'(98) 99999-0000',contactName:'Maria'});
 assert.equal(s.document,'12345678000190');assert.equal(s.email,'contact@example.com');assert.ok(supplierMatches(s,'sao'));assert.ok(supplierMatches(s,'12.345.678'));
 for(const patch of [{name:'a'},{email:'a@b'},{phone:'123'},{document:'123'},{contactName:'x'.repeat(121)}])assert.throws(()=>prepareSupplier({...s,...patch}));
});
