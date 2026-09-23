import { inventoryLabels } from '../data/mockData';

export const BARCODE_TYPES = ['qr', 'ean13', 'ean8', 'code128', 'upc_a', 'upc_e'];

export function findMaterialFromCode(data) {
  const match = data.match(/^obrasync:\/\/material\/([^?]+)/i);
  if (!match) return null;

  const materialId = decodeURIComponent(match[1]);
  return inventoryLabels.find((item) => item.id === materialId) ?? null;
}

export function formatScannerDetails(item) {
  return `${item.name}\nCódigo: ${item.materialCode ?? item.id}\nLote: ${item.lot}\nLocal: ${item.location}`;
}

export function getScannerActionLabel(hasPermission, isScanned) {
  if (!hasPermission) return 'Permitir uso da câmera';
  if (isScanned) return 'Escanear novamente';
  return 'Câmera pronta';
}
