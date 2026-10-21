import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQuote, getProjectQuotes } from '../src/utils/quotes.js';

const validQuote = {
  title: 'Materiais elétricos', clientName: 'Cliente A', supplierName: 'Fornecedor B',
  validUntil: '2026-11-01', items: [
    { description: 'Cabo', quantity: 2, unit: 'm', unitPrice: 12.35 },
    { description: 'EPI', quantity: 3, unit: 'un', unitPrice: 4.50 },
  ],
};

test('cotação recebe a obra e o total calculado por item', () => {
  const quote = buildQuote(validQuote, 'obra-123', 1234567890000);
  assert.equal(quote.projectId, 'obra-123');
  assert.equal(quote.total, 38.20);
  assert.equal(quote.items[0].total, 24.70);
  assert.equal(quote.items[1].total, 13.50);
  assert.equal(quote.number, 'COT-890000');
});

test('filtra apenas cotações da obra ativa e é seguro sem obra', () => {
  const quote = buildQuote(validQuote, 'obra-123', 1234567890000);
  assert.deepEqual(getProjectQuotes([quote], 'obra-123'), [quote]);
  assert.deepEqual(getProjectQuotes([quote], 'obra-456'), []);
  assert.deepEqual(getProjectQuotes([quote], null), []);
  assert.deepEqual(getProjectQuotes(undefined, 'obra-123'), []);
});

test('não salva cotação sem obra, cliente, fornecedor, validade ou itens', () => {
  assert.throws(() => buildQuote(validQuote, null), /Selecione uma obra/);
  assert.throws(() => buildQuote({ ...validQuote, clientName: '' }, 'obra-123'), /cliente/);
  assert.throws(() => buildQuote({ ...validQuote, supplierName: '' }, 'obra-123'), /fornecedor/);
  assert.throws(() => buildQuote({ ...validQuote, validUntil: '' }, 'obra-123'), /validade/);
  assert.throws(() => buildQuote({ ...validQuote, items: [] }, 'obra-123'), /material/);
});

test('rejeita quantidade inválida e recalcula totais adulterados', () => {
  assert.throws(() => buildQuote({ ...validQuote, items: [{ description: 'Cabo', quantity: -1, unitPrice: 1 }] }, 'obra-123'), /Revise/);
  const quote = buildQuote({ ...validQuote, items: [{ description: 'Cabo', quantity: 2, unitPrice: 8.99, total: 99999 }] }, 'obra-123');
  assert.equal(quote.total, 17.98);
  assert.equal(quote.items[0].total, 17.98);
});
