export const BARCODE_TYPES = ['qr', 'ean13', 'ean8', 'code128', 'upc_a', 'upc_e'];

export function getMaterialCodeFromQr(data) {
  const match = data.match(/^obrasync:\/\/material\/([^?]+)/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export function findStockMaterial(stock, data) {
  const qrCode = getMaterialCodeFromQr(data);
  const rawCode = qrCode || String(data || '').trim();
  const normalized = rawCode.toLowerCase();

  if (!normalized) return null;
  return stock.find((item) => String(item.code || '').toLowerCase() === normalized) || null;
}

export function formatScannerDetails(item) {
  const name = item.name || item.materialName || 'Material';
  const code = item.materialCode ?? item.code ?? item.id ?? 'Não informado';
  const lot = item.lot || 'Não informado';
  const location = item.location || item.project || 'Não informado';
  const quantity = item.quantity !== undefined ? `\nSaldo: ${item.quantity} ${item.unit || ''}` : '';

  return `${name}\nCódigo: ${code}\nLote: ${lot}\nLocal: ${location}${quantity}`;
}

export function getScannerActionLabel(hasPermission, isScanned) {
  if (!hasPermission) return 'Permitir uso da câmera';
  if (isScanned) return 'Escanear novamente';
  return 'Câmera pronta';
}
