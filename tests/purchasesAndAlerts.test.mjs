import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareOrder,filterOrders,orderStage} from '../src/utils/purchasePresentation.js';
import {buildAlerts} from '../src/utils/alerts.js';
test('pedido valida valor brasileiro, desconto e data antes do envio',()=>{
 const form={supplier:' Loja ',expectedAt:'15/11/2026',freight:'1.200,50',taxes:'0',discount:'10'};
 const order=prepareOrder(form,[{quantity:2,unitPrice:100}]);assert.equal(order.freight,1200.5);assert.equal(order.expectedAt,'2026-11-15');assert.equal(order.supplier,'Loja');
 assert.throws(()=>prepareOrder({...form,freight:'-1'},order.items));assert.throws(()=>prepareOrder({...form,discount:'99999'},order.items));assert.throws(()=>prepareOrder({...form,expectedAt:'31/02/2026'},order.items));
});
test('filtros distinguem aprovação, compra, recebimento parcial e rejeição',()=>{
 const orders=[{number:'PED-1',supplier:'Loja A',approval_status:'PENDING'},{number:'PED-2',supplier:'Loja B',approval_status:'APPROVED',purchased_at:'2026-11-01',status:'PARTIALLY_RECEIVED'}];
 assert.equal(filterOrders(orders,'Aguardando aprovação','loja a').length,1);assert.equal(orderStage(orders[1]),'Recebidos parcialmente');assert.equal(orderStage({status:'CANCELLED',purchased_at:'2026-11-01'}),'Rejeitados');
});
test('entrega atrasada exige compra confirmada e não inclui pedido recebido',()=>{
 const alerts=buildAlerts({dashboard:{},orders:[{expected_at:'2020-01-01',status:'SENT'},{expected_at:'2020-01-01',purchased_at:'2020-01-01',status:'RECEIVED'}],requests:[],budgetDocuments:[]});assert(!alerts.some(a=>a.id==='late-orders'));
});
