export function returnableQuantity(item){
 return Math.max(0,Number(item.quantity||0)-(item.supplier_returns||[]).reduce((s,r)=>s+Number(r.quantity||0),0));
}
export function supplierReturnPayload(receipt,item,quantity,reason,nonconformity='',reference=''){
 const q=Number(String(quantity).trim().replace(',','.'));
 if(!receipt?.order_id||!item?.id||!Number.isFinite(q)||q<=0||q>returnableQuantity(item))throw new Error('Informe uma quantidade dentro do saldo devolvível.');
 if(String(reason).trim().length<5)throw new Error('Informe o motivo da devolução com ao menos 5 caracteres.');
 return {orderId:receipt.order_id,receiptItemId:item.id,quantity:q,reason:reason.trim(),nonconformity:nonconformity.trim(),reference:reference.trim()};
}
