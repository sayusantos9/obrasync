import * as XLSX from 'xlsx';
import {parseDecimal,roundMoney} from './bdi.js';
export const IMPORT_FIELDS=[['code','Código'],['source','Base / origem (opcional)'],['unit','Unidade'],['quantity','Quantidade'],['unitPrice','Preço unitário']];
const norm=v=>String(v??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function readBudgetWorkbook(base64){
 if(base64.length>2800000)throw new Error('Selecione um arquivo de até 2 MB.');
 const wb=XLSX.read(base64,{type:'base64',cellText:true,cellFormula:true,sheetRows:2002});
 if(!wb.SheetNames.length)throw new Error('Arquivo sem abas.');
 return wb;
}
export function sheetRows(wb,name){
 const ws=wb.Sheets[name];
 const range=XLSX.utils.decode_range(ws['!fullref']||ws['!ref']||'A1');
 if(range.e.r>2000||range.e.c>49)throw new Error('Máximo de 2000 linhas de dados e 50 colunas por aba.');
 const rows=[];
 for(let r=0;r<=range.e.r;r++){
  const row=[];
  for(let c=0;c<=range.e.c;c++){
   const cell=ws[XLSX.utils.encode_cell({r,c})];
   row.push(cell?.f ? {formula:true} : cell?.t==='n' ? {value:cell.v,text:cell.w??String(cell.v)} : String(cell?.v??''));
  }
  rows.push(row);
 }
 return rows;
}
export const cellText=c=>typeof c==='object'&&c!==null ? c.formula?'[fórmula]':String(c.text??c.value??'') : String(c??'');
export function guessMapping(headers){
 const aliases={code:['codigo','codigo insumo','cod','code'],source:['base','origem','fonte','banco'],unit:['unidade','und','un'],quantity:['quantidade','qtd','coeficiente'],unitPrice:['preco unitario','valor unitario','preco','unitprice']};
 return Object.fromEntries(IMPORT_FIELDS.map(([key])=>[key,headers.findIndex(h=>aliases[key].includes(norm(cellText(h))))]));
}
export function validateImport(rows,mapping,catalog,headerIndex=0){
 const errors=[],items=[],seen=new Set();
 const required=['code','unit','quantity','unitPrice'];
 if(required.some(k=>!Number.isInteger(mapping[k])||mapping[k]<0))return {items,errors:[{row:headerIndex+1,message:'Mapeie código, unidade, quantidade e preço unitário.'}]};
 const mapped=Object.values(mapping).filter(i=>i>=0);
 if(new Set(mapped).size!==mapped.length)return {items,errors:[{row:headerIndex+1,message:'Cada coluna deve ter uma única função.'}]};
 rows.slice(headerIndex+1).forEach((row,index)=>{
  const line=index+headerIndex+2;
  if(row.every(c=>!cellText(c).trim()))return;
  const get=k=>cellText(row[mapping[k]]).trim();
  const fail=message=>errors.push({row:line,code:get('code'),message});
  if(mapped.some(i=>row[i]?.formula))return fail('Substitua fórmulas por valores antes de importar.');
  const code=get('code'),source=norm(get('source')),unit=get('unit');
  if(!code)return fail('Informe o código do insumo.');
  const matches=catalog.filter(i=>(norm(i.code)===norm(code)||norm(i.sourceCode)===norm(code))&&(!source||[norm(i.sourceBank),norm(i.source)].includes(source)));
  if(matches.length!==1)return fail(matches.length?'Código ambíguo. Informe a base de origem.':'Código não encontrado. Cadastre o insumo ou use o código completo do catálogo.');
  const input=matches[0],key=input.source+':'+input.id;
  if(!['MATERIAL','EQUIPMENT'].includes(input.inputType))return fail('Somente materiais e equipamentos são aceitos.');
  if(norm(unit)!==norm(input.unit))return fail(`Unidade incompatível. Use ${input.unit}; não há conversão automática.`);
  const number=k=>row[mapping[k]]?.value??get(k);
  const quantity=parseDecimal(number('quantity')),unitPrice=parseDecimal(number('unitPrice'));
  if(!Number.isFinite(quantity)||quantity<=0)return fail('Quantidade deve ser maior que zero.');
  if(!Number.isFinite(unitPrice)||unitPrice<0)return fail('Preço ausente ou inválido. Zero deve ser informado explicitamente.');
  if(seen.has(key))return fail('Insumo duplicado. Consolide as linhas na planilha.');
  seen.add(key);
  items.push({id:`IMPORT-${line}`,inputId:input.id,source:input.source,code:input.code,inputType:input.inputType,description:input.description,unit:input.unit,quantity,unitPrice,total:roundMoney(quantity*unitPrice)});
 });
 if(!items.length&&!errors.length)errors.push({row:headerIndex+1,message:'Nenhum item encontrado após o cabeçalho.'});
 return {items,errors};
}
