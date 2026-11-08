import {parseDecimal} from './bdi.js';
import {toDatabaseDate} from './dates.js';
export function orderStage(order){
 if(order.status==='CANCELLED'||order.approval_status==='REJECTED')return 'Rejeitados';
 if(order.status==='RECEIVED')return 'Recebidos';
 if(order.status==='PARTIALLY_RECEIVED')return 'Recebidos parcialmente';
 if(order.purchased_at)return 'Comprados';
 if(order.approval_status==='APPROVED')return 'Aprovados';
 return 'Aguardando aprovação';
}
export function filterOrders(orders,filter,query){const q=query.trim().toLocaleLowerCase('pt-BR');return orders.filter(o=>(filter==='Todos'||orderStage(o)===filter)&&(!q||`${o.number||''} ${o.supplier||''} ${(o.items||[]).map(i=>i.name||i.description||'').join(' ')}`.toLocaleLowerCase('pt-BR').includes(q)));}
export function prepareOrder(form,items){
 if(!form.supplier.trim()||!items.length)throw new Error('Informe o fornecedor e adicione os insumos ao pedido.');
 const amounts=Object.fromEntries(['freight','taxes','discount'].map(key=>[key,parseDecimal(form[key]||'0')]));
 if(Object.values(amounts).some(n=>!Number.isFinite(n)||n<0))throw new Error('Frete, tributos e desconto devem ser valores válidos e não negativos.');
 const subtotal=items.reduce((total,i)=>total+i.quantity*i.unitPrice,0);
 if(amounts.discount>subtotal+amounts.freight+amounts.taxes)throw new Error('O desconto não pode superar o valor total do pedido.');
 return {supplierId:form.supplierId||null,supplier:form.supplier.trim(),expectedAt:toDatabaseDate(form.expectedAt),...amounts,items};
}
