export const TABS = Object.freeze({
  HOME: 'home',
  PROJECTS: 'projects',
  BUDGET: 'budget',
  MATERIALS: 'materials',
  COSTS: 'costs',
});

export const TAB_ITEMS = Object.freeze([
  { id: TABS.HOME, label: 'Início', icon: 'home' },
  { id: TABS.PROJECTS, label: 'Obra', icon: 'business' },
  { id: TABS.BUDGET, label: 'Orçamento', icon: 'calculator' },
  { id: TABS.MATERIALS, label: 'Materiais', icon: 'cube' },
  { id: TABS.COSTS, label: 'Custos', icon: 'wallet' },
]);

export const SCREENS = Object.freeze({
  TABS: 'tabs',
  REQUEST: 'request',
  QUOTES: 'quotes',
  RECEIPT: 'receipt',
  STOCK: 'stock',
  ORDERS: 'orders',
  APPROVALS: 'approvals',
  ALERTS: 'alerts',
  PROFILE: 'profile',
  COMPANY_PERMISSIONS: 'company-permissions',
  ADD_EXPENSE: 'add-expense',
  SCANNER: 'scanner',
  LABEL: 'label',
});
