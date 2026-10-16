import { USER_ROLES } from '../data/authData';

export const TABS = Object.freeze({
  HOME: 'home',
  PROJECTS: 'projects',
  BUDGET: 'budget',
  MATERIALS: 'materials',
  COSTS: 'costs',
});

export const SCREENS = Object.freeze({
  TABS: 'tabs',
  REQUEST: 'request',
  QUOTES: 'quotes',
  CREATE_QUOTE: 'create-quote',
  CREATE_BUDGET: 'create-budget',
  RECEIPT: 'receipt',
  STOCK: 'stock',
  PURCHASES: 'purchases',
  TRANSFERS: 'transfers',
  REPORTS: 'reports',
  ORDERS: 'orders',
  APPROVALS: 'approvals',
  ALERTS: 'alerts',
  PROFILE: 'profile',
  COMPANY_PERMISSIONS: 'company-permissions',
  MASTER_PANEL: 'master-panel',
  COMPANIES: 'companies',
  CREATE_COMPANY: 'create-company',
  CREATE_MEMBER: 'create-member',
  ADD_EXPENSE: 'add-expense',
  SCANNER: 'scanner',
  LABEL: 'label',
  SETTINGS: 'settings',
  GUIDE: 'guide',
  ACCESSIBILITY: 'accessibility',
});

const baseTabs = [
  { id: 'home', label: 'Início', icon: 'home', tab: TABS.HOME },
  { id: 'projects', label: 'Obra', icon: 'business', tab: TABS.PROJECTS },
  { id: 'budget', label: 'Orçamento', icon: 'calculator', tab: TABS.BUDGET },
  { id: 'materials', label: 'Materiais', icon: 'cube', tab: TABS.MATERIALS },
  { id: 'costs', label: 'Custos', icon: 'wallet', tab: TABS.COSTS },
];

export function getRoleTabs(role) {
  if (role === USER_ROLES.MASTER) {
    return [
      { id: 'home', label: 'Início', icon: 'home', tab: TABS.HOME },
      { id: 'companies', label: 'Empresas', icon: 'business', screen: SCREENS.COMPANIES },
      { id: 'members', label: 'Usuários', icon: 'people', screen: SCREENS.CREATE_MEMBER },
      { id: 'projects', label: 'Obras', icon: 'business', tab: TABS.PROJECTS },
      { id: 'more', label: 'Mais', icon: 'menu', screen: SCREENS.PROFILE },
    ];
  }

  if (role === USER_ROLES.PURCHASING) {
    return [
      { id: 'home', label: 'Início', icon: 'home', tab: TABS.HOME },
      { id: 'stock', label: 'Estoque', icon: 'cube', screen: SCREENS.STOCK },
      { id: 'purchases', label: 'Compras', icon: 'cart', screen: SCREENS.PURCHASES },
      { id: 'projects', label: 'Obras', icon: 'business', tab: TABS.PROJECTS },
      { id: 'more', label: 'Mais', icon: 'menu', screen: SCREENS.PROFILE },
    ];
  }

  if (role === USER_ROLES.REQUESTER) {
    return [
      { id: 'home', label: 'Início', icon: 'home', tab: TABS.HOME },
      { id: 'request', label: 'Solicitar', icon: 'cart', screen: SCREENS.REQUEST },
      { id: 'projects', label: 'Obras', icon: 'business', tab: TABS.PROJECTS },
      { id: 'materials', label: 'Materiais', icon: 'cube', tab: TABS.MATERIALS },
      { id: 'more', label: 'Mais', icon: 'menu', screen: SCREENS.PROFILE },
    ];
  }

  if (role === USER_ROLES.CLIENT) {
    return [
      { id: 'home', label: 'Início', icon: 'home', tab: TABS.HOME },
      { id: 'projects', label: 'Minha obra', icon: 'business', tab: TABS.PROJECTS },
      { id: 'budget', label: 'Orçamento', icon: 'calculator', tab: TABS.BUDGET },
      { id: 'reports', label: 'Documentos', icon: 'documents', screen: SCREENS.REPORTS },
      { id: 'more', label: 'Mais', icon: 'menu', screen: SCREENS.PROFILE },
    ];
  }

  return baseTabs;
}
