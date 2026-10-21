import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { calculateBudget, calculateBdi } from '../src/utils/bdi.js';
import { getBudgetLines, getBudgetTotals, bdiTableRows } from '../src/utils/budgetRows.js';
import { makeXlsx } from '../src/utils/xlsxBuilder.js';
import { encodeQuoteMeta, toQuote } from '../src/utils/quotes.js';

const bdi = { ac:20, sg:0, r:0, df:0, l:0, cp:0, issBase:0, issRate:0 };
const material = { inputId:'shared-1', source:'shared', inputType:'MATERIAL', code:'TUR-0001', description:'Cabo & cobre', unit:'m', quantity:2, unitPrice:12.35 };

test('BDI aplicado uma vez; totais, tipos e valores inválidos são verificados', () => {
  const doc = calculateBudget([{...material,total:999}], bdi);
  assert.equal(doc.subtotal,24.7);
  assert.equal(doc.bdiRate,20);
  assert.equal(doc.bdiAmount,4.94);
  assert.equal(doc.total,29.64);
  assert.equal(getBudgetTotals(doc).total,29.64);
  assert.equal(getBudgetLines(doc)[0].totalWithBdi,29.64);
  assert.throws(()=>calculateBudget([{...material,inputType:'MAO_DE_OBRA'}],bdi), /materiais/);
  assert.throws(()=>calculateBudget([{...material,quantity:0}],bdi), /inválido/);
  assert.throws(()=>calculateBdi({...bdi,cp:100}), /menor/);
});

test('orçamento recarregado conserva BDI e origem dos materiais', () => {
  const source = fs.readFileSync(new URL('../src/contexts/AppContext.js',import.meta.url),'utf8');
  const mapper = source.slice(source.indexOf('function toBudget('),source.indexOf('function toMember('));
  const toBudget = vm.runInNewContext(mapper+'; toBudget');
  const doc = toBudget({id:'b',project_id:'obra',total:29.64,subtotal_without_bdi:24.7,bdi_percent:20,bdi_amount:4.94,bdi_config:bdi,
    budget_items:[{id:'linha',catalog_input_id:'shared-1',input_code:'TUR-0001',input_type:'MATERIAL',quantity:2,unit_price:12.35,total:24.7}]});
  assert.equal(doc.bdiRate,20);
  assert.equal(doc.items[0].source,'shared');
  assert.equal(doc.items[0].inputId,'shared-1');
  assert.equal(getBudgetTotals(doc).total,29.64);
});

test('cotação recarregada conserva fornecedor, obra, total e linhas', () => {
  const quote=toQuote({id:'q',project_id:'obra',total:'24.70',expires_at:'2026-11-01',
    notes:encodeQuoteMeta({title:'Materiais',supplierName:'Fornecedor',clientName:'Cliente'}),
    quotation_items:[{description:'Cabo',quantity:2,unit_price:12.35,total:24.7}]});
  assert.equal(quote.supplierName,'Fornecedor');
  assert.equal(quote.projectId,'obra');
  assert.equal(quote.items[0].total,24.7);
});

test('PDF e Excel recebem BDI, códigos e texto escapado; XLSX contém planilhas válidas', () => {
  const source=fs.readFileSync(new URL('../src/services/documentExportService.js',import.meta.url),'utf8')
    .replace(/^import .*;\r?\n/gm,'').replace(/export /g,'');
  const exports=vm.runInNewContext(source+'; ({documentHtml,documentSheets})',{
    getBudgetLines,getBudgetTotals,bdiTableRows,formatCurrency:n=>Number(n).toFixed(2),
  });
  const doc={...calculateBudget([material],bdi),title:'<script>Teste</script>',number:'ORC-1'};
  const html=exports.documentHtml(doc,{name:'Obra'});
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('29.64'));
  assert.ok(html.includes('TUR-0001'));
  const sheets=exports.documentSheets(doc,{name:'Obra'});
  assert.equal(sheets.length,2);
  const zip=Buffer.from(makeXlsx(sheets));
  assert.equal(zip.readUInt32LE(0),0x04034b50);
  const entries={}; let offset=0;
  while(zip.readUInt32LE(offset)===0x04034b50){
    assert.equal(zip.readUInt16LE(offset+8),0);
    const size=zip.readUInt32LE(offset+18),len=zip.readUInt16LE(offset+26),extra=zip.readUInt16LE(offset+28);
    const name=zip.subarray(offset+30,offset+30+len).toString('utf8'),start=offset+30+len+extra;
    entries[name]=zip.subarray(start,start+size).toString('utf8'); offset=start+size;
  }
  assert.ok(entries['xl/worksheets/sheet1.xml'].includes('29.64'));
  assert.ok(entries['xl/worksheets/sheet1.xml'].includes('Cabo &amp; cobre'));
  assert.ok(entries['xl/worksheets/sheet2.xml']);
});
