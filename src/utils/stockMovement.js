export function applyStockMovement(stock, data) {
  const quantity = Number(String(data.quantity ?? '').replace(',', '.'));
  const direction = data.direction || data.type;
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Informe uma quantidade válida maior que zero.');
  if (!['IN', 'OUT'].includes(direction)) throw new Error('Informe entrada ou saída.');
  const index = stock.findIndex(item => item.code === data.materialCode || (data.materialId && item.id === data.materialId));
  if (index < 0) throw new Error('Material não encontrado no estoque.');
  const balance = Number(stock[index].quantity || 0);
  if (direction === 'OUT' && quantity > balance) throw new Error('Saldo insuficiente.');
  return stock.map((item, i) => i === index ? { ...item, quantity: balance + (direction === 'OUT' ? -quantity : quantity) } : item);
}
