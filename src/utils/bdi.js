/** Modelo BDI PAD não desonerado da planilha enviada pelo usuário.
 * ISS efetivo = base de cálculo municipal (%) * alíquota ISS (%) / 100.
 * BDI=((1+AC+SG+R)*(1+DF)*(1+L)/(1-CP-ISS))-1.
 */
export const DEFAULT_BDI = Object.freeze({
  ac: 5.29, sg: 0.25, r: 1.00, df: 1.01, l: 8.00, cp: 3.65,
  issBase: 60, issRate: 5, desonerado: false,
});
export const BDI_FIELDS = Object.freeze([
  {key:'ac',label:'Administração Central (AC)'},
  {key:'sg',label:'Seguro e Garantia (SG)'},
  {key:'r',label:'Risco (R)'},
  {key:'df',label:'Despesas Financeiras (DF)'},
  {key:'l',label:'Lucro (L)'},
  {key:'cp',label:'Tributos PIS / COFINS (CP)'},
  {key:'issBase',label:'Base de cálculo ISS (%)'},
  {key:'issRate',label:'Alíquota ISS (%)'},
]);
export function parseDecimal(value) {
  if (typeof value === 'number') return value;
  const text=String(value ?? '').trim().replace(/\s|R\$|%/g,'');
  if (!text) return Number.NaN;
  if (text.includes(',') && text.includes('.')) return Number(text.replace(/\./g,'').replace(',','.'));
  return Number(text.replace(',','.'));
}
export function roundMoney(value) {
  return Math.round((Number(value)+Number.EPSILON)*100)/100;
}
export function calculateBdi(input=DEFAULT_BDI) {
  const data={...DEFAULT_BDI,...input};
  for(const field of BDI_FIELDS) {
    if(!Number.isFinite(Number(data[field.key]))||Number(data[field.key])<0||Number(data[field.key])>100)
      throw new Error(`Percentual inválido: ${field.label}.`);
  }
  const issEffective=Number(data.issBase)*Number(data.issRate)/100;
  const divisor=1-(Number(data.cp)+issEffective)/100;
  if(divisor<=0)throw new Error('CP + ISS efetivo deve ser menor que 100%.');
  const factor=(1+(Number(data.ac)+Number(data.sg)+Number(data.r))/100)
    *(1+Number(data.df)/100)*(1+Number(data.l)/100)/divisor;
  return {rate:roundMoney((factor-1)*100), factor, issEffective:roundMoney(issEffective), config:data};
}
export function calculateBudget(items=[],bdi=DEFAULT_BDI) {
  if (!items.length) throw new Error('Selecione ao menos um insumo.');
  const calc=calculateBdi(bdi);
  const lines=items.map((item,index)=>{
    const quantity=parseDecimal(item.quantity);
    const unitPrice=parseDecimal(item.unitPrice ?? item.unit_price);
    if (!item.inputId || !item.code || !item.description || !item.unit) throw new Error(`Selecione um insumo cadastrado na linha ${index+1}.`);
    if (!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(unitPrice)||unitPrice<0)
      throw new Error(`Quantidade/coeficiente ou preço unitário inválido na linha ${index+1}.`);
    return {...item,quantity,unitPrice,total:roundMoney(quantity*unitPrice)};
  });
  const subtotal=roundMoney(lines.reduce((sum,item)=>sum+item.total,0));
  const bdiAmount=roundMoney(subtotal*calc.rate/100);
  return {items:lines,subtotal,bdiRate:calc.rate,bdiAmount,total:roundMoney(subtotal+bdiAmount),bdiConfig:calc.config,issEffective:calc.issEffective};
}
