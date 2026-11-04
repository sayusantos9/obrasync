import test from 'node:test';
import assert from 'node:assert/strict';
import {compareInputs} from '../src/utils/comparison.js';
import {calculateBudget} from '../src/utils/bdi.js';
const budget={items:[{source:'shared',inputId:'i',code:'I-1',unit:'m',description:'Cabo',quantity:10,unitPrice:10}]};
const order={projectId:'p',approval_status:'APPROVED',purchased_at:'2026-11-04',status:'SENT',freight:4,taxes:2,discount:1,items:[{catalog_input_id:'i',name:'Cabo',unit:'m',quantity:5,unitPrice:11}]};
test('compra confirmada rateia custos e separa desvio de preço e quantidade',()=>{
 const [r]=compareInputs(budget,[order],'p');
 assert.equal(r.pp,10);assert.equal(r.pr,12);assert.equal(r.percent,20);assert.equal(r.impact,10);assert.equal(r.remaining,5);assert.equal(r.projection,120);
});
test('pedido somente aprovado e outras obras não contam como compra',()=>{
 const [r]=compareInputs(budget,[{...order,purchased_at:null},{...order,projectId:'outra'}],'p');
 assert.equal(r.pr,null);assert.equal(r.purchasedQuantity,0);
});
test('unidades incompatíveis não são comparadas por descrição',()=>{
 const rows=compareInputs(budget,[{...order,items:[{...order.items[0],unit:'kg'}]}],'p');
 assert.equal(rows.length,2);assert.equal(rows[1].pp,null);assert.equal(rows[1].percent,null);
});
test('insumos próprios da empresa também são comparados pela identidade',()=>{
 const ownBudget={items:[{...budget.items[0],source:'company'}]};
 const ownOrder={...order,items:[{...order.items[0],catalog_input_id:null,cost_input_id:'i'}]};
 const [r]=compareInputs(ownBudget,[ownOrder],'p');
 assert.equal(r.pp,10);assert.equal(r.pr,12);
});
test('todos os tipos canônicos de insumo são aceitos no orçamento',()=>{
 for(const inputType of ['MATERIAL','LABOR','EQUIPMENT','COMPLEMENTARY','SERVICE_INPUT','OTHER']) {
  const b=calculateBudget([{...budget.items[0],inputType}],{ac:0,sg:0,r:0,df:0,l:0,cp:0,issBase:0,issRate:0});
  assert.equal(b.subtotal,100);
 }
});
