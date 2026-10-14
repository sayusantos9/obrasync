export const EXPENSE_CATEGORY_STYLES = Object.freeze({
  Materiais: Object.freeze({
    icon: 'cube',
    color: '#1F6AA5',
    backgroundColor: '#EAF3FB',
  }),
  'Mão de obra': Object.freeze({
    icon: 'people',
    color: '#B5473E',
    backgroundColor: '#FBE9E7',
  }),
  Frete: Object.freeze({
    icon: 'car',
    color: '#2F9E7A',
    backgroundColor: '#E5F5EF',
  }),
  Equipamentos: Object.freeze({
    icon: 'construct',
    color: '#F47C20',
    backgroundColor: '#FFF0E2',
  }),
  Outros: Object.freeze({
    icon: 'receipt',
    color: '#3D8DD1',
    backgroundColor: '#EDF5FD',
  }),
});

export const EXPENSE_CATEGORIES = Object.freeze(
  Object.keys(EXPENSE_CATEGORY_STYLES),
);

export function getExpenseCategoryStyle(category) {
  return EXPENSE_CATEGORY_STYLES[category] ?? EXPENSE_CATEGORY_STYLES.Outros;
}
