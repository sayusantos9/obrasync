export function parseCurrencyInput(value) {
  const normalizedValue = String(value ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(/^R\$/i, '');

  if (!normalizedValue) return Number.NaN;

  if (normalizedValue.includes(',') && normalizedValue.includes('.')) {
    return Number(normalizedValue.replace(/\./g, '').replace(',', '.'));
  }

  return Number(normalizedValue.replace(',', '.'));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCompactCurrency(value) {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    return `R$ ${(absoluteValue / 1_000_000).toFixed(2).replace('.', ',')} mi`;
  }

  if (absoluteValue >= 1_000) {
    const decimalPlaces = absoluteValue >= 100_000 ? 0 : 1;
    return `R$ ${(absoluteValue / 1_000).toFixed(decimalPlaces).replace('.', ',')} mil`;
  }

  return formatCurrency(absoluteValue);
}
