/** Modelo BDI PAD não desonerado da planilha enviada pelo usuário.
 * ISS efetivo = base de cálculo municipal (%) * alíquota ISS (%) / 100.
 * BDI=((1+AC+SG+R)*(1+DF)*(1+L)/(1-CP-ISS))-1.
 */
export const DEFAULT_BDI = Object.freeze({
  ac: 5.29, sg: 0.25, r: 1.00, df: 1.01, l: 8.00, cp: 3.65,
  issBase: 60, issRate: 5, desonerado: false,
});
// New documents start without BDI. DEFAULT_BDI remains the legacy component model.
export const DEFAULT_COMPANY_BDI = Object.freeze({schemaVersion:2,enabled:false,mode:'PERCENT',rate:0,ac:0,sg:0,r:0,df:0,l:0,cp:0,issBase:0,issRate:0,desonerado:false});
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
export function calculateBdi(input=DEFAULT_COMPANY_BDI) {
  const modern=input?.schemaVersion===2||input?.enabled!==undefined||input?.mode!==undefined;
  const data={...(modern?DEFAULT_COMPANY_BDI:DEFAULT_BDI),...input};
  if(data.enabled!==undefined&&typeof data.enabled!=='boolean')throw new Error('Aplicação do BDI inválida.');
  const enabled=data.enabled!==false,mode=data.mode||'COMPONENTS';
  if(!['PERCENT','COMPONENTS'].includes(mode))throw new Error('Modo de BDI inválido.');
  const config={schemaVersion:2,enabled,mode,desonerado:data.desonerado===true};
  for(const field of BDI_FIELDS) {
    const value=parseDecimal(data[field.key]),valid=Number.isFinite(value)&&value>=0&&value<=100;
    if(enabled&&mode==='COMPONENTS'&&!valid)throw new Error(`Percentual inválido: ${field.label}.`);
    config[field.key]=valid?value:0;
  }
  const direct=parseDecimal(data.rate??0);
  config.rate=Number.isFinite(direct)&&direct>=0&&direct<=100?roundMoney(direct):0;
  if(!enabled)return {rate:0,factor:1,issEffective:0,config};
  if(mode==='PERCENT'){
    if(!Number.isFinite(direct)||direct<0||direct>100)throw new Error('Informe um BDI entre 0 e 100%.');
    return {rate:config.rate,factor:1+config.rate/100,issEffective:0,config};
  }
  const issEffective=config.issBase*config.issRate/100;
  const divisor=1-(config.cp+issEffective)/100;
  if(divisor<=0)throw new Error('CP + ISS efetivo deve ser menor que 100%.');
  const factor=(1+(config.ac+config.sg+config.r)/100)*(1+config.df/100)*(1+config.l/100)/divisor;
  config.rate=roundMoney((factor-1)*100);
  return {rate:config.rate,factor,issEffective:roundMoney(issEffective),config};
}
export function budgetBdiSnapshot(doc){
 const config=doc?.bdiConfig??doc?.bdi_config;
 if(config&&typeof config==='object'&&(config.schemaVersion===2||config.enabled!==undefined||config.mode!==undefined||BDI_FIELDS.every(f=>config[f.key]!==undefined)))return calculateBdi(config).config;
 const rate=Number(doc?.bdiRate??doc?.bdi_percent??0);
 return {...DEFAULT_COMPANY_BDI,enabled:rate!==0,rate};
}
export function calculateBudget(items=[],bdi=DEFAULT_COMPANY_BDI) {
  if (!items.length) throw new Error('Selecione ao menos um insumo.');
  const calc=calculateBdi(bdi);
  const lines=items.map((item,index)=>{
    if (!['MATERIAL','LABOR','EQUIPMENT','COMPLEMENTARY','SERVICE_INPUT','OTHER'].includes(item.inputType) || !['shared','company'].includes(item.source)) throw new Error('Selecione um insumo válido do catálogo.');
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
