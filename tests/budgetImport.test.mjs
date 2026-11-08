import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {readBudgetWorkbook,sheetRows,guessMapping,validateImport} from '../src/utils/budgetImport.js';
const catalog=[{id:'a',code:'IOPES-001',sourceCode:'001',sourceBank:'IOPES',source:'shared',unit:'kg',inputType:'MATERIAL',description:'Material'}];
const headers=['Código','Base','Unidade','Quantidade','Preço unitário'];
const mapping=guessMapping(headers);
test('Importação preserva código, decimal brasileiro e preço zero explícito',()=>{
 const r=validateImport([headers,['001','IOPES','kg','2,5','1.200,50']],mapping,catalog);
 assert.equal(r.errors.length,0);assert.equal(r.items[0].total,3001.25);assert.equal(r.items[0].code,'IOPES-001');
 assert.equal(validateImport([headers,['001','IOPES','kg',1,0]],mapping,catalog).errors.length,0);
});
test('Importação recusa preço ausente, unidade diferente, duplicidade e código desconhecido',()=>{
 for(const row of [['001','IOPES','kg',1,''],['001','IOPES','un',1,2],['xxx','','kg',1,2]])assert.equal(validateImport([headers,row],mapping,catalog).errors.length,1);
 assert.equal(validateImport([headers,['001','IOPES','kg',1,2],['001','IOPES','kg',1,3]],mapping,catalog).errors[0].row,3);
});
test('Código ambíguo requer origem; mapeamento não aceita colunas repetidas',()=>{
 const other={...catalog[0],id:'b',code:'ORSE-001',sourceBank:'ORSE'};
 assert.equal(validateImport([headers,['001','','kg',1,2]],mapping,[...catalog,other]).errors.length,1);
 assert.equal(validateImport([headers,['001','ORSE','kg',1,2]],mapping,[...catalog,other]).items[0].inputId,'b');
 assert.equal(validateImport([headers],{...mapping,unit:0},catalog).errors.length,1);
});
test('XLSX real preserva zeros formatados e bloqueia fórmulas',()=>{
 const ws=XLSX.utils.aoa_to_sheet([headers,[1,'IOPES','kg',2,5]]);ws.A2.z='000';
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Insumos');
 const parsed=readBudgetWorkbook(XLSX.write(wb,{type:'base64',bookType:'xlsx'}));
 assert.equal(validateImport(sheetRows(parsed,'Insumos'),mapping,catalog).items.length,1);
 parsed.Sheets.Insumos.E2.f='1+4';
 assert.match(validateImport(sheetRows(parsed,'Insumos'),mapping,catalog).errors[0].message,/fórmulas/);
});
test('CSV com aspas e limite de linhas',()=>{
 const wb=readBudgetWorkbook(Buffer.from('Código;Base;Unidade;Quantidade;Preço unitário\r\n001;IOPES;kg;"2,5";"10,00"').toString('base64'));
 // CSV codes must be text: reader must not coerce leading-zero identifiers.
 assert.equal(validateImport(sheetRows(wb,wb.SheetNames[0]),mapping,catalog).items.length,1);
 assert.throws(()=>sheetRows({Sheets:{s:{'!ref':'A1:A2002'}}},'s'),/2000/);
});
