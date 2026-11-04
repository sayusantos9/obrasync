export function marketComparison(offers, quantity, postalCode, payment, now=new Date()) {
  const latest=new Map();
  for(const o of [...offers].sort((a,b)=>b.observed_on.localeCompare(a.observed_on)||b.created_at.localeCompare(a.created_at))) {
    const key=[o.supplier.trim().toLowerCase(),o.url||o.product.trim().toLowerCase(),o.payment.trim().toLowerCase(),o.postal_code].join('|');
    if(!latest.has(key))latest.set(key,o);
  }
  return [...latest.values()].map(o=>{
    const age=(now-new Date(`${o.observed_on}T12:00:00`))/86400000;
    const packs=Math.ceil(quantity/Number(o.pack_quantity));
    const total=packs*Number(o.price)+(o.freight==null?0:Number(o.freight));
    const reasons=[];
    if(!o.verified_spec)reasons.push('Especificação não conferida');
    if(!o.in_stock)reasons.push('Disponibilidade não confirmada');
    if(age>7)reasons.push('Consulta com mais de 7 dias');
    if(o.freight==null)reasons.push('Frete não informado');
    if(o.postal_code!==postalCode)reasons.push('CEP diferente');
    if(o.payment.trim().toLowerCase()!==payment.trim().toLowerCase())reasons.push('Pagamento diferente');
    if(Number(o.surveyed_quantity)!==quantity)reasons.push('Quantidade diferente da cotada');
    return {...o,packs,total,unitPrice:Number(o.price)/Number(o.pack_quantity),reasons,eligible:reasons.length===0};
  }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||a.total-b.total);
}
