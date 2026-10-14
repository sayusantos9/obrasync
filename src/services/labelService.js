import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const createLabelHtml = (item, qrBase64) => `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>@page{margin:18px}body{font-family:Arial,sans-serif;color:#27232B}.label{width:340px;border:2px solid #0B2A5B;border-radius:18px;padding:22px;text-align:center}.brand{font-size:25px;font-weight:800;color:#0B2A5B}.brand span{color:#EA6A12}.qr{width:190px;height:190px;margin:18px auto}.name{font-size:20px;font-weight:800}.code{color:#1D6BD6;font-weight:700;margin:5px}.row{display:flex;justify-content:space-between;border-top:1px solid #DCE5EE;padding:9px 0;font-size:13px}.footer{margin-top:10px;font-size:11px;color:#6F7D8C}</style></head><body><div class="label"><div class="brand">Obra<span>Sync</span></div><img class="qr" src="data:image/png;base64,${qrBase64}"/><div class="name">${escapeHtml(item.name)}</div><div class="code">${escapeHtml(item.id)}</div><div class="row"><span>Etiqueta</span><strong>${escapeHtml(item.labelId)}</strong></div><div class="row"><span>Lote</span><strong>${escapeHtml(item.lot)}</strong></div><div class="row"><span>Unidade</span><strong>${escapeHtml(item.unit)}</strong></div><div class="row"><span>Local</span><strong>${escapeHtml(item.location)}</strong></div><div class="row"><span>Recebido em</span><strong>${escapeHtml(item.receivedAt)}</strong></div><div class="footer">${escapeHtml(item.projectName || 'ObraSync')} • Etiqueta interna de rastreabilidade</div></div></body></html>`;

export const printMaterialLabel = async (item, qrBase64) => {
  await Print.printAsync({ html: createLabelHtml(item, qrBase64) });
};

export const shareMaterialLabel = async (item, qrBase64) => {
  if (!(await Sharing.isAvailableAsync())) return false;
  const { uri } = await Print.printToFileAsync({ html: createLabelHtml(item, qrBase64) });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Etiqueta ${item.id}` });
  return true;
};
