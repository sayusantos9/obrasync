import { formatCurrency } from '../utils/currency';
import { safe, sharePdf, shareWorkbook } from './documentExportService';
const money = (n) => Number.isFinite(Number(n)) ? Number(n) : 0;
const texts = (v) => String(v || '');
const matchProject = (v, id) => !id || v?.projectId === id;

export function buildReports(data = {}, projectId) {
  const budgets = (data.budgetDocuments || []).filter((b) => matchProject(b, projectId));
  const quotes = (data.quotes || []).filter((q) => matchProject(q, projectId));
  const expenses = (data.extraExpenses || []).filter((e) => matchProject(e, projectId));
  const requests = (data.requests || []).filter((r) => matchProject(r, projectId));
  const orders = (data.orders || []).filter((r) => matchProject(r, projectId));
  const receipts = (data.receipts || []).filter((r) => matchProject(r, projectId));
  return {
    budgets: {
      title: 'Orçamentos',headers:['Número','Título','Cliente','Status','Total (R$)'],
      rows: budgets.map(b=>[b.number,b.title,b.clientName,b.status,money(b.total)]),
      total:budgets.reduce((n,b)=>n+money(b.total),0),
    },
    quotes: {
      title:'Cotações',headers:['Número','Título','Fornecedor','Status','Total (R$)'],
      rows:quotes.map(q=>[q.number,q.title,q.supplierName,q.status,money(q.total)]),
      total:quotes.reduce((n,q)=>n+money(q.total),0),
    },
    expenses: {
      title:'Despesas',headers:['Data','Descrição','Categoria','Valor (R$)'],
      rows:expenses.map(e=>[e.expenseDate||e.date||'',e.description||'',e.category||'',money(e.amount)]),
      total:expenses.reduce((n,e)=>n+money(e.amount),0),
    },
    requests: {
      title:'Solicitações',headers:['Número','Material / Descrição','Status','Prioridade'],
      rows:requests.map(r=>[r.number||r.id,r.materialName||r.description||'',r.status||'',r.priority||'']),
    },
    orders: {
      title:'Pedidos de compra',headers:['Número','Status','Fornecedor','Total (R$)'],
      rows:orders.map(o=>[o.number||o.id,o.status||'',o.supplierName||'',money(o.total)]),
      total:orders.reduce((n,o)=>n+money(o.total),0),
    },
    receipts: {
      title:'Recebimentos',headers:['Referência','Data','Observações'],
      rows:receipts.map(r=>[r.reference||r.id||'',r.receivedAt||'',r.notes||'']),
    },
  };
}
export function reportWorkbook(reports, key, project) {
  const selection = key === 'all' ? Object.values(reports) : [reports[key]].filter(Boolean);
  return [
    {name:'Indicadores',rows:[['ObraSync — Relatórios',project?.name || 'Todas as obras'],['Emitido em',new Date().toLocaleDateString('pt-BR')],...selection.map(r=>[r.title, r.rows.length]),...selection.filter(r=>r.total !== undefined).map(r=>[`Total ${r.title} (R$)`,r.total])]},
    ...selection.map(report=>({name:report.title,rows:[report.headers,...report.rows]})),
  ];
}
export function reportHtml(reports,key,project) {
  const selected = key === 'all' ? Object.values(reports) : [reports[key]].filter(Boolean);
  if(!selected.length) throw new Error('Relatório não encontrado.');
  const sections=selected.map(report=>`<section><h2>${safe(report.title)} <span>(${report.rows.length} registros)</span></h2>
    <table><thead><tr>${report.headers.map(h=>`<th>${safe(h)}</th>`).join('')}</tr></thead><tbody>
    ${report.rows.length ? report.rows.map(line=>`<tr>${line.map(v=>`<td>${safe(v)}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${report.headers.length}">Sem registros para a obra selecionada.</td></tr>`}
    </tbody></table>${report.total !== undefined ? `<p class="total">Total: ${formatCurrency(report.total)}</p>` : ''}</section>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"/><style>@page{size:A4 landscape;margin:13mm}body{font-family:Arial,sans-serif;color:#142A45}header{background:#0B2A5B;color:white;padding:18px;border-radius:8px}.title{font-size:24px;font-weight:bold}.orange{color:#F7BD86}.meta{font-size:12px;color:#CBD5E1}h2{font-size:18px;margin-top:24px}h2 span{color:#6B7890;font-size:12px}table{border-collapse:collapse;width:100%;font-size:10px}th{background:#0B2A5B;color:white;text-align:left}th,td{padding:9px 6px;border-bottom:1px solid #E3EAF3}.total{text-align:right;font-weight:900;margin:10px 0}section{page-break-inside:avoid}</style></head><body><header><div class="title">Obra<span class="orange">Sync</span> • Relatórios</div><div class="meta">${safe(project?.name || 'Visão geral')} • ${new Date().toLocaleDateString('pt-BR')}</div></header>${sections}</body></html>`;
}
export async function exportReport(reports, key, project, format) {
  if(format==='pdf')return sharePdf(reportHtml(reports,key,project),`ObraSync_Relatorio_${key}`);
  if(format==='excel')return shareWorkbook(reportWorkbook(reports,key,project),`ObraSync_Relatorio_${key}`);
  throw new Error('Formato inválido.');
}
