// One explicitly selected budget is the baseline. Never add different revisions together.
export function compareInputs(budget, orders, projectId, tolerance = 5) {
  const planned = new Map();
  for (const item of budget?.items || []) {
    if (!item.inputId) continue;
    const key = `${item.source}:${item.inputId}|${item.unit.toLowerCase().trim()}`;
    const row = planned.get(key) || { id: item.inputId, description: item.description, unit: item.unit, plannedQuantity: 0, plannedValue: 0, purchasedQuantity: 0, actualValue: 0 };
    row.plannedQuantity += Number(item.quantity); row.plannedValue += Number(item.quantity) * Number(item.unitPrice); planned.set(key,row);
  }
  for (const order of orders.filter(o => o.projectId === projectId && o.approval_status === 'APPROVED' && o.purchased_at && o.status !== 'CANCELLED')) {
    const subtotal = order.items.reduce((sum,i)=>sum+Number(i.quantity)*Number(i.unitPrice),0);
    const quantityTotal = order.items.reduce((sum,i)=>sum+Number(i.quantity),0);
    const extra = Number(order.freight||0)+Number(order.taxes||0)-Number(order.discount||0);
    for (const item of order.items) {
      const inputId=item.catalog_input_id || item.cost_input_id;
      const key = `${item.catalog_input_id?'shared':'company'}:${inputId}|${item.unit.toLowerCase().trim()}`;
      const row = planned.get(key) || { id:inputId, description:item.name,unit:item.unit,plannedQuantity:0,plannedValue:0,purchasedQuantity:0,actualValue:0 };
      const base = Number(item.quantity)*Number(item.unitPrice);
      row.purchasedQuantity += Number(item.quantity);
      row.actualValue += base + extra * (subtotal > 0 ? base/subtotal : Number(item.quantity)/quantityTotal);
      planned.set(key,row);
    }
  }
  return [...planned.values()].map(row=>{
    const pp=row.plannedQuantity>0 ? row.plannedValue/row.plannedQuantity : null;
    const pr=row.purchasedQuantity>0 ? row.actualValue/row.purchasedQuantity : null;
    const comparable=pp!==null && pp>0 && pr!==null;
    const variance=comparable ? pr-pp : null;
    const percent=comparable ? variance/pp*100 : null;
    const remaining=Math.max(0,row.plannedQuantity-row.purchasedQuantity);
    return {...row,pp,pr,variance,percent,impact:comparable?variance*row.purchasedQuantity:null,remaining,
      excessQuantity:Math.max(0,row.purchasedQuantity-row.plannedQuantity),
      projection:pr!==null?row.actualValue+remaining*pr:row.plannedValue,
      status:pp===null||pp<=0?'Sem referência comparável':pr===null?'Sem compra':percent<=0?'Dentro/abaixo':percent<=tolerance?'Atenção':'Acima',
    };
  });
}
