import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatCurrency } from '../utils/currency';

function escapeHtml(value = '') {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  };

  return String(value).replace(/[&<>'"]/g, (character) => htmlEntities[character]);
}

function buildServiceRows(services) {
  return services
    .map((service) => {
      const executionPercentage = service.planned
        ? (service.realized / service.planned) * 100
        : 0;

      return `
        <tr>
          <td><strong>${escapeHtml(service.code)}</strong></td>
          <td>${escapeHtml(service.name)}</td>
          <td>${service.compositions}</td>
          <td>${formatCurrency(service.planned)}</td>
          <td>${formatCurrency(service.realized)}</td>
          <td>${executionPercentage.toFixed(1).replace('.', ',')}%</td>
        </tr>`;
    })
    .join('');
}

function buildBudgetHtml({ project, budget, realizedTotal, balance, isOverBudget, extraExpensesTotal }) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        body{font-family:Arial,sans-serif;color:#27232B;padding:28px}
        .brand{font-size:28px;font-weight:800;color:#5A1B73}.brand span{color:#E0A526}
        h1{font-size:24px;margin:24px 0 5px}.muted{color:#756D7A;font-size:12px}
        .summary{display:flex;gap:12px;margin:22px 0}.box{border:1px solid #E9E2E8;border-radius:12px;padding:13px;flex:1}
        .label{font-size:10px;color:#756D7A;text-transform:uppercase}.value{font-size:18px;font-weight:700;margin-top:4px}
        table{width:100%;border-collapse:collapse;margin-top:18px;font-size:11px}
        th{background:#260D35;color:white;text-align:left;padding:9px}td{border-bottom:1px solid #E9E2E8;padding:9px}
        .footer{margin-top:24px;font-size:10px;color:#756D7A}
      </style>
    </head>
    <body>
      <div class="brand">Obra<span>Sync</span></div>
      <h1>Orçamento da obra</h1>
      <div class="muted">${escapeHtml(project.name)} • ${escapeHtml(project.client)} • ${escapeHtml(budget.version)}</div>
      <div class="summary">
        <div class="box"><div class="label">Previsto</div><div class="value">${formatCurrency(budget.total)}</div></div>
        <div class="box"><div class="label">Realizado</div><div class="value">${formatCurrency(realizedTotal)}</div></div>
        <div class="box"><div class="label">Saldo</div><div class="value">${isOverBudget ? '-' : ''}${formatCurrency(Math.abs(balance))}</div></div>
      </div>
      <table>
        <thead><tr><th>Cód.</th><th>Serviço</th><th>Composições</th><th>Previsto</th><th>Realizado</th><th>Execução</th></tr></thead>
        <tbody>${buildServiceRows(budget.services)}</tbody>
      </table>
      <div class="footer">Relatório gerado pelo ObraSync. Despesas lançadas no app para esta obra: ${formatCurrency(extraExpensesTotal)}.</div>
    </body>
  </html>`;
}

export async function generateBudgetPdf(reportData) {
  const html = buildBudgetHtml(reportData);
  const { uri } = await Print.printToFileAsync({ html });
  const isSharingAvailable = await Sharing.isAvailableAsync();

  if (isSharingAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Orçamento - ${reportData.project.name}`,
      UTI: 'com.adobe.pdf',
    });
  }

  return { uri, wasShared: isSharingAvailable };
}
