import {
  EXPENSE_CATEGORIES,
  getExpenseCategoryStyle,
} from '../constants/expenseCategories';
import { parseCurrencyInput } from './currency';

export { EXPENSE_CATEGORIES };

export function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function validateExpenseAmount(value) {
  const amount = parseCurrencyInput(value);
  return Number.isFinite(amount) && amount > 0
    ? true
    : 'Informe um valor maior que zero.';
}

export function validateExpenseDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? true
    : 'Use o formato AAAA-MM-DD.';
}

function formatExpenseDate(value) {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();

  if (Number.isNaN(date.getTime())) return value || 'Hoje';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(date)
    .replace('.', '');
}

export function createExpense(expenseData, project) {
  return {
    ...expenseData,
    ...getExpenseCategoryStyle(expenseData.category),
    id: `EXP-${Date.now()}`,
    projectId: project.id,
    projectName: project.name,
    name: expenseData.name.trim(),
    supplier: expenseData.supplier?.trim() || '',
    notes: expenseData.notes?.trim() || '',
    amount: Number(expenseData.amount),
    date: formatExpenseDate(expenseData.date),
    createdAt: new Date().toISOString(),
  };
}
