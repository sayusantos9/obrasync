import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatCurrency } from '../utils/currency';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
}

function itemRows(items = []) {
  if (!items.length) return '<tr><td colspan="5">Nenhum item informado.</td></tr>';
  return items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const total = Number(item.total ?? quantity * unitPrice);
    return `<tr><td>${escapeHtml(item.description || item.name || 'Item')}</td><td>${escapeHtml(item.unit || 'un')}</td><td>${quantity}</td><td>${formatCurrency(unitPrice)}</td><td>${formatCurrency(total)}</td></tr>`;
  }).join('');
}

function buildHtml(document, project) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;color:#0F1F3C;padding:28px}.brand{font-size:28px;font-weight:800;color:#0B2A5B}.brand span{color:#EA6A12}
  h1{font-size:24px;margin:22px 0 4px}.muted{color:#686C78;font-size:12px}.summary{border:1px solid #EBEEF5;border-radius:14px;padding:14px;margin:20px 0}
  table{width:100%;border-collapse:collapse;margin-top:18px;font-size:11px}th{background:#0B2A5B;color:#fff;text-align:left;padding:9px}td{border-bottom:1px solid #EBEEF5;padding:9px}
  .total{text-align:right;font-size:20px;font-weight:800;margin-top:18px}.footer{margin-top:28px;color:#686C78;font-size:10px}</style></head><body>
  <div class="brand">Obra<span>Sync</span></div><h1>${escapeHtml(document.title || 'Orçamento')}</h1>
  <div class="muted">${escapeHtml(project?.name || '')} • ${escapeHtml(document.number || '')}</div>
  <div class="summary"><strong>Cliente:</strong> ${escapeHtml(document.clientName || '')}<br/><strong>Documento:</strong> ${escapeHtml(document.clientDocument || '')}<br/><strong>Validade:</strong> ${escapeHtml(document.validUntil || 'Não informada')}</div>
  <table><thead><tr><th>Descrição</th><th>Un.</th><th>Qtd.</th><th>Preço un.</th><th>Total</th></tr></thead><tbody>${itemRows(document.items)}</tbody></table>
  <div class="total">Total: ${formatCurrency(Number(document.total || 0))}</div>
  ${document.notes ? `<p><strong>Observações:</strong> ${escapeHtml(document.notes)}</p>` : ''}
  <div class="footer">Documento gerado pelo ObraSync.</div></body></html>`;
}

export async function generateBudgetDocumentPdf(document, project) {
  const { uri } = await Print.printToFileAsync({ html: buildHtml(document, project) });
  const available = await Sharing.isAvailableAsync();
  if (available) await Sharing.shareAsync(uri, { mimeType:'application/pdf', dialogTitle:`${document.number || 'Orçamento'} - ${project?.name || 'ObraSync'}` });
  return { uri, wasShared: available };
}

export const generateBudgetPdf = async ({ project, budgetItems = [], ...rest }) => generateBudgetDocumentPdf({
  title:'Orçamento da obra', number:rest?.budget?.version || '', clientName:project?.client || '', items:budgetItems,
  total:rest.plannedTotal || project?.budget || 0, notes:'Relatório consolidado da obra.',
}, project);
