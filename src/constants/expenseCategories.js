export const EXPENSE_CATEGORY_STYLES = Object.freeze({
  Materiais: Object.freeze({
    icon: 'cube',
    color: '#5A1B73',
    backgroundColor: '#EDE6F1',
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
    color: '#E0A526',
    backgroundColor: '#FFF4D6',
  }),
  Outros: Object.freeze({
    icon: 'receipt',
    color: '#7B3F91',
    backgroundColor: '#F3EAF6',
  }),
});

export const EXPENSE_CATEGORIES = Object.freeze(
  Object.keys(EXPENSE_CATEGORY_STYLES),
);

export function getExpenseCategoryStyle(category) {
  return EXPENSE_CATEGORY_STYLES[category] ?? EXPENSE_CATEGORY_STYLES.Outros;
}
