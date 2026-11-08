import { calculateBdi,roundMoney,budgetBdiSnapshot } from './bdi.js';
export function getBudgetLines(doc){
  const bdi=Number(doc?.bdiRate ?? doc?.bdi_percent ?? 0);
  return (doc?.items||[]).map(i=>{const qty=Number(i.quantity||0),price=Number(i.unitPrice??i.unit_price??0);const subtotal=roundMoney(qty*price);
    return {code:i.code||i.inputCode||i.input_code||'—',description:i.description||'',unit:i.unit||'un',quantity:qty,unitPrice:price,subtotal,totalWithBdi:roundMoney(subtotal*(1+bdi/100))};});
}
export function getBudgetTotals(doc){
  const lines=getBudgetLines(doc);
  const subtotal=doc?.subtotal??doc?.subtotal_without_bdi??roundMoney(lines.reduce((n,i)=>n+i.subtotal,0));
  const bdiRate=Number(doc?.bdiRate??doc?.bdi_percent??0);
  const bdiAmount=Number(doc?.bdiAmount??doc?.bdi_amount??roundMoney(subtotal*bdiRate/100));
  const total=Number(doc?.total??roundMoney(subtotal+bdiAmount));
  return {subtotal:Number(subtotal),bdiRate,bdiAmount,total};
}
export function bdiTableRows(doc){
  const cfg=budgetBdiSnapshot(doc);
  const calc=calculateBdi(cfg);
  const hasComponents=cfg.enabled&&cfg.mode==='COMPONENTS';
  return {rows:hasComponents?[['Administração Central','AC',cfg.ac],['Seguro e Garantia','SG',cfg.sg],['Risco','R',cfg.r],['Despesas Financeiras','DF',cfg.df],['Lucro','L',cfg.l],['Tributos (PIS/COFINS)','CP',cfg.cp],['ISS efetivo','ISS',calc.issEffective],['BDI sem desoneração','BDI PAD',calc.rate]]:[[cfg.enabled?'Percentual direto':'BDI não aplicado','BDI',calc.rate]],config:cfg,calc,hasComponents,title:!cfg.enabled?'BDI não aplicado':hasComponents?'BDI por componentes':'BDI percentual direto'};
}
