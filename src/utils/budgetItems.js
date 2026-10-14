import { parseCurrencyInput } from './currency';

export const BUDGET_ITEM_CATEGORIES = [
  'Materiais',
  'Mão de obra',
  'Equipamentos',
  'Serviços',
  'Outros',
];

export const BUDGET_ITEM_UNITS = ['un', 'kg', 'm', 'm²', 'm³', 'sc', 'h'];

export function validatePositiveNumber(value) {
  const number = parseCurrencyInput(value);
  return Number.isFinite(number) && number > 0
    ? true
    : 'Informe um valor maior que zero.';
}

export function createBudgetItem(formValues, project) {
  const quantity = parseCurrencyInput(formValues.quantity);
  const unitPrice = parseCurrencyInput(formValues.unitPrice);

  return {
    id: `BUD-${Date.now()}`,
    projectId: project.id,
    description: formValues.description.trim(),
    category: formValues.category,
    unit: formValues.unit,
    quantity,
    unitPrice,
    total: quantity * unitPrice,
    createdAt: new Date().toISOString(),
  };
}

export function getProjectBudgetItems(items, projectId) {
  return items.filter((item) => item.projectId === projectId);
}

export function sumBudgetItems(items) {
  return items.reduce((total, item) => total + Number(item.total || 0), 0);
}
