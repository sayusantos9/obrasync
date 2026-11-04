import test from 'node:test';
import assert from 'node:assert/strict';
import { canPerform, canAccessRoute, requiresProject, assertPermission } from '../src/utils/permissions.js';
import { applyStockMovement } from '../src/utils/stockMovement.js';

test('perfis distinguem gestão, orçamento, compras e solicitação', () => {
  assert(canPerform('MASTER', 'manageMembers'));
  assert(!canPerform('ENGINEERING', 'manageMembers'));
  assert(canPerform('ENGINEERING', 'writeBudget'));
  assert(!canPerform('PURCHASING', 'writeBudget'));
  assert(canPerform('PURCHASING', 'manageStock'));
  assert(!canPerform('REQUESTER', 'manageStock'));
  assert(canPerform('REQUESTER', 'requestMaterial'));
  assert.throws(() => assertPermission('CLIENT', 'requestMaterial'));
  assert(canPerform('ENGINEERING', 'writeQuote'));
  assert(canPerform('PURCHASING', 'writeQuote'));
  assert(!canPerform('UNKNOWN', 'writeQuote'));
});
test('cliente só abre consulta; operações sem obra exigem seleção', () => {
  assert(canAccessRoute('CLIENT', 'tabs', 'budget'));
  assert(canAccessRoute('CLIENT', 'reports'));
  for (const route of ['receipt', 'stock', 'create-quote', 'create-budget', 'create-member', 'request']) assert(!canAccessRoute('CLIENT', route));
  assert(!canAccessRoute('REQUESTER', 'transfers'));
  assert(requiresProject('stock'));
  assert(requiresProject('tabs', 'costs'));
  assert(!requiresProject('tabs', 'materials'));
});
test('saída reduz saldo e entrada aumenta; rejeita saldo insuficiente e código inexistente', () => {
  const stock = [{id:'1',code:'CIM',quantity:10}];
  assert.equal(applyStockMovement(stock,{materialCode:'CIM',direction:'OUT',quantity:3})[0].quantity,7);
  assert.equal(applyStockMovement(stock,{materialCode:'CIM',direction:'IN',quantity:'2,5'})[0].quantity,12.5);
  for(const data of [{materialCode:'CIM',direction:'OUT',quantity:11},{materialCode:'CIM',direction:'IN',quantity:'abc'},{materialCode:'NO',direction:'IN',quantity:1}]) assert.throws(()=>applyStockMovement(stock,data));
  assert.equal(stock[0].quantity,10);
});
