export const EXPENSE_CATEGORIES = [
  'Materiais',
  'Mão de obra',
  'Frete',
  'Equipamentos',
  'Outros',
];

const EXPENSE_CATEGORY_STYLES = {
  Materiais: { icon: 'cube', color: '#5A1B73', backgroundColor: '#EDE6F1' },
  'Mão de obra': { icon: 'people', color: '#B5473E', backgroundColor: '#FBE9E7' },
  Frete: { icon: 'car', color: '#2F9E7A', backgroundColor: '#E5F5EF' },
  Equipamentos: { icon: 'construct', color: '#E0A526', backgroundColor: '#FFF4D6' },
  Outros: { icon: 'receipt', color: '#7B3F91', backgroundColor: '#F3EAF6' },
};

export function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

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
  const categoryStyle = EXPENSE_CATEGORY_STYLES[expenseData.category]
    ?? EXPENSE_CATEGORY_STYLES.Outros;

  return {
    ...expenseData,
    ...categoryStyle,
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
