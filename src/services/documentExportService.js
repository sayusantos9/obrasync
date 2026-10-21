import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { makeXlsx } from '../utils/xlsxBuilder';
import { formatCurrency } from '../utils/currency';
import { getBudgetLines,getBudgetTotals,bdiTableRows } from '../utils/budgetRows';

export const safe = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const numeric = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const nameSafe = (value) => String(value || 'documento').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 52);

export function rowsForDocument(doc) {
  return (doc?.items || []).map((item) => {
    const qtd = numeric(item.quantity), price = numeric(item.unitPrice ?? item.unit_price);
    return [item.description || item.name || 'Item', item.unit || 'un', qtd, price, numeric(item.total ?? qtd * price)];
  });
}

export function documentSheets(document, project, kind = 'Orçamento') {
  if(kind==='Orçamento' && document?.bdiConfig){
    const lines=getBudgetLines(document),v=getBudgetTotals(document),bdi=bdiTableRows(document);
    return [
      {name:'Orçamento',rows:[
        ['OBRASYNC - PLANILHA ORÇAMENTÁRIA',project?.name||''],
        ['Documento',document.number||''],['Objeto',document.title||''],
        ['Cliente',document.clientName||''],['Validade',document.validUntil||''],
        [],['Código insumo','Descrição / Insumo','Unidade','Quantidade / coeficiente','Preço unitário (R$)','Total sem BDI (R$)','Total com BDI (R$)'],
        ...lines.map(i=>[i.code,i.description,i.unit,i.quantity,i.unitPrice,i.subtotal,i.totalWithBdi]),
        [],['TOTAL SEM BDI','','','','',v.subtotal],
        ['BDI (%)','','','','',v.bdiRate],['VALOR DO BDI (R$)','','','','',v.bdiAmount],
        ['TOTAL COM BDI (R$)','','','','',v.total],
      ]},
      {name:'Cálculo do BDI',rows:[
        ['CÁLCULO DO BDI - SEM DESONERAÇÃO'],
        ['PROPONENTE / TOMADOR',document.companyName||'Empresa cadastrada'],
        ['OBJETO',document.title||project?.name||''],
        ['BASE DE CÁLCULO ISS (%)',bdi.config.issBase],
        ['ALÍQUOTA DO ISS (%)',bdi.config.issRate],
        ['ITENS','SIGLAS','% ADOTADO'],...bdi.rows,
        [],['FÓRMULA','((1+AC+SG+R)*(1+DF)*(1+L)/(1-CP-ISS))-1'],
        ['ISS efetivo = base × alíquota / 100'],
        ['BDI sem desoneração (%)',bdi.calc.rate],
      ]},
    ];
  }
  const rows = rowsForDocument(document);
  return [{name:'Resumo',rows:[['ObraSync', kind],['Número',document?.number || ''],['Obra',project?.name || ''],['Título',document?.title || ''],['Cliente',document?.clientName || ''],['Fornecedor',document?.supplierName || ''],['Validade',document?.validUntil || ''],['Total (R$)',numeric(document?.total)],['Observações',document?.notes || '']]},
    {name:'Itens',rows:[['Descrição','Unidade','Quantidade','Preço unitário (R$)','Total (R$)'],...rows, ['TOTAL','','','',numeric(document?.total)]]}];
}
export function documentHtml(doc, project, kind = 'Orçamento') {
  if(kind==='Orçamento' && doc?.bdiConfig){
    const items=getBudgetLines(doc),v=getBudgetTotals(doc),bdi=bdiTableRows(doc);
    const linesHtml=items.map((line,i)=>`<tr><td>${i+1}</td><td>${safe(line.code)}</td><td>${safe(line.description)}</td><td>${safe(line.unit)}</td><td class="num">${line.quantity}</td><td class="num">${formatCurrency(line.unitPrice)}</td><td class="num">${formatCurrency(line.subtotal)}</td><td class="num">${formatCurrency(line.totalWithBdi)}</td></tr>`).join('');
    const rates=bdi.rows.map(r=>`<tr><td>${safe(r[0])}</td><td class="center">${safe(r[1])}</td><td class="num">${Number(r[2]).toFixed(2).replace('.',',')}%</td></tr>`).join('');
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
      @page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;color:#162438;font-size:10px}
      .header{border:1px solid #152a45;display:table;width:100%;padding:12px;box-sizing:border-box}
      .brand{display:table-cell;font-size:20px;font-weight:bold;color:#0B2A5B;width:30%;vertical-align:middle}
      .hTitle{display:table-cell;font-size:18px;font-weight:bold;vertical-align:middle;text-align:center}
      table{border-collapse:collapse;width:100%;margin-top:12px;font-size:9px}th,td{border:1px solid #738398;padding:7px 5px;vertical-align:top}
      th{background:#0B2A5B;color:white}td.num{text-align:right;white-space:nowrap}td.center{text-align:center}
      .meta{border:1px solid #738398;padding:8px;margin-top:9px;line-height:1.8}.section{font-size:15px;margin:18px 0 5px}
      .highlight{background:#fff7a8}.total{font-weight:bold;background:#E8EEF6}.bigTotal{font-size:14px;text-align:right;border:1px solid #0B2A5B;padding:12px}
      .note{margin-top:12px;white-space:pre-wrap}.pageBreak{page-break-before:always}.formula{text-align:center;font-size:13px;padding:17px;border:1px solid #738398;margin-top:16px}
      .foot{margin-top:18px;font-size:9px;color:#708097}
    </style></head><body>
      <div class="header"><div class="brand">ObraSync</div><div class="hTitle">Planilha Orçamentária</div></div>
      <div class="meta"><b>PROPONENTE / TOMADOR:</b> ${safe(doc.companyName||'Empresa cadastrada')}<br/><b>OBRA:</b> ${safe(project?.name||'Não informada')}<br/><b>OBJETO:</b> ${safe(doc.title)}<br/><b>Nº:</b> ${safe(doc.number||'')} &nbsp; <b>VALIDADE:</b> ${safe(doc.validUntil||'Não informada')}<br/><b>CLIENTE:</b> ${safe(doc.clientName||'Não vinculado')}</div>
      <h2 class="section">Composição analítica de insumos</h2>
      <table><thead><tr><th>Item</th><th>Código</th><th>Descrição</th><th>Und.</th><th>Coef./Qtd.</th><th>Valor unit.</th><th>Total s/ BDI</th><th>Total c/ BDI</th></tr></thead><tbody>${linesHtml}
        <tr class="total"><td colspan="6">TOTAL DOS INSUMOS — SEM BDI</td><td colspan="2" class="num">${formatCurrency(v.subtotal)}</td></tr>
        <tr><td colspan="6">BDI (${v.bdiRate.toFixed(2).replace('.',',')}%)</td><td colspan="2" class="num">${formatCurrency(v.bdiAmount)}</td></tr>
        <tr class="total"><td colspan="6">TOTAL COM BDI</td><td colspan="2" class="num">${formatCurrency(v.total)}</td></tr>
      </tbody></table>${doc.notes?`<p class="note"><b>Observações:</b> ${safe(doc.notes)}</p>`:''}
      <div class="pageBreak"></div>
      <div class="header"><div class="brand">ObraSync</div><div class="hTitle">Cálculo do BDI</div></div>
      <div class="meta"><b>PROPONENTE / TOMADOR:</b> ${safe(doc.companyName||'Empresa cadastrada')}<br/><b>OBJETO:</b> ${safe(doc.title||project?.name||'')}<br/><b>DESONERAÇÃO:</b> Não</div>
      <div class="meta">Conforme a referência informada: base municipal estimada de ISS <b>${bdi.config.issBase}%</b> e alíquota <b>${bdi.config.issRate}%</b>.<br/><b>ISS efetivo: ${bdi.calc.issEffective.toFixed(2).replace('.',',')}%</b></div>
      <table><thead><tr><th>Itens</th><th>Siglas</th><th>% Adotado</th></tr></thead><tbody>${rates}<tr class="total"><td>BDI SEM desoneração (Fórmula do modelo)</td><td class="center">BDI PAD</td><td class="num highlight">${bdi.calc.rate.toFixed(2).replace('.',',')}%</td></tr></tbody></table>
      <div class="formula">BDI = [(1 + AC + SG + R) × (1 + DF) × (1 + L) / (1 - CP - ISS)] - 1</div>
      <p>ISS efetivo = base de cálculo × alíquota do ISS / 100. Valores em percentuais convertidos em frações na fórmula.</p>
      <div class="foot">Demonstrativo elaborado pelo ObraSync • ${new Date().toLocaleDateString('pt-BR')}</div>
    </body></html>`;
  }
  const lines = rowsForDocument(doc);
  const tr = lines.length ? lines.map((line,i)=>`<tr><td>${i+1}</td><td>${safe(line[0])}</td><td>${safe(line[1])}</td><td class="n">${safe(line[2])}</td><td class="n">${formatCurrency(line[3])}</td><td class="n">${formatCurrency(line[4])}</td></tr>`).join('') : '<tr><td colspan="6">Sem itens</td></tr>';
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><style>
  @page{size:A4;margin:17mm}body{font-family:Arial,sans-serif;color:#172A43;font-size:11px}.top{background:#0B2A5B;color:white;padding:22px;border-radius:9px}.logo{font-size:24px;font-weight:900}.orange{color:#F5B47C}h1{font-size:20px;margin:8px 0 3px}.meta{color:#6C7C90}.grid{display:flex;gap:18px;margin-top:18px}.card{border:1px solid #DFE5EE;border-radius:8px;padding:12px;flex:1;line-height:1.9}table{border-collapse:collapse;width:100%;margin-top:20px;font-size:10px}th{background:#0B2A5B;color:white;padding:10px 6px;text-align:left}td{padding:9px 6px;border-bottom:1px solid #E7ECF3;vertical-align:top}.n{text-align:right;white-space:nowrap}.sum{margin-top:15px;text-align:right;font-size:19px;font-weight:900;color:#0B2A5B}.note{margin-top:15px;white-space:pre-wrap}.foot{margin-top:30px;border-top:1px solid #E7ECF3;color:#8993A1;font-size:10px;padding-top:10px}</style></head><body>
  <div class="top"><div class="logo">Obra<span class="orange">Sync</span></div><h1>${safe(kind)} ${safe(doc?.number)}</h1><div>${safe(project?.name || 'Obra não informada')}</div></div>
  <h2>${safe(doc?.title || kind)}</h2><div class="grid"><div class="card"><b>Cliente:</b> ${safe(doc?.clientName || '—')}<br/><b>Documento:</b> ${safe(doc?.clientDocument || '—')}</div><div class="card"><b>Fornecedor:</b> ${safe(doc?.supplierName || '—')}<br/><b>Validade:</b> ${safe(doc?.validUntil || 'Não informada')}</div></div>
  <table><thead><tr><th>#</th><th>Descrição</th><th>Un.</th><th>Qtd.</th><th>Preço unit.</th><th>Total</th></tr></thead><tbody>${tr}</tbody></table><div class="sum">TOTAL: ${formatCurrency(numeric(doc?.total))}</div>
  ${doc?.paymentTerms ? `<p><b>Condições de pagamento:</b> ${safe(doc.paymentTerms)}</p>`:''}${doc?.notes?`<p class="note"><b>Observações:</b> ${safe(doc.notes)}</p>`:''}
  <div class="foot">Documento emitido pelo ObraSync • ${new Date().toLocaleDateString('pt-BR')}</div></body></html>`;
}
export async function sharePdf(html, filename='ObraSync_documento') {
  const { uri } = await Print.printToFileAsync({html, base64:false});
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri,{mimeType:'application/pdf',dialogTitle:filename});
  return uri;
}
export async function shareWorkbook(sheets, filename='ObraSync_documento') {
  const bytes = makeXlsx(sheets);
  const file = new File(Paths.cache, `${nameSafe(filename)}_${Date.now()}.xlsx`);
  file.create({overwrite:true});
  file.write(bytes);
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri,{mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',dialogTitle:filename});
  return file.uri;
}
export async function exportDocument(doc, project, format, kind = 'Orçamento') {
  if(!doc) throw new Error('Documento não selecionado.');
  if(format === 'pdf') return sharePdf(documentHtml(doc,project,kind),`${kind} ${doc.number||''}`);
  if(format === 'excel') return shareWorkbook(documentSheets(doc,project,kind),`${kind}_${doc.number||'documento'}`);
  throw new Error('Formato de exportação não suportado.');
}
