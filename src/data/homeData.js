import { USER_ROLES } from './authData';
import { SCREENS, TABS } from '../navigation/routes';
import { formatCompactCurrency } from '../utils/currency';

const ACTIONS = {
  request: { id:'request', icon:'cart-outline', label:'Solicitar material', color:'#EA6A12', background:'#FFF2E8', destination:SCREENS.REQUEST, destinationType:'screen' },
  quotes: { id:'quotes', icon:'document-text-outline', label:'Cotações', color:'#1D6BD6', background:'#EEF3FF', destination:SCREENS.QUOTES, destinationType:'screen' },
  budget: { id:'budget', icon:'calculator-outline', label:'Criar orçamento', color:'#C65A0C', background:'#FFF2E8', destination:SCREENS.CREATE_BUDGET, destinationType:'screen' },
  viewBudget: { id:'view-budget', icon:'calculator-outline', label:'Orçamento liberado', color:'#C65A0C', background:'#FFF2E8', destination:TABS.BUDGET, destinationType:'tab' },
  company: { id:'company', icon:'people-outline', label:'Empresas e acessos', color:'#388FCA', background:'#EEF6FD', destination:SCREENS.MASTER_PANEL, destinationType:'screen' },
  receipt: { id:'receipt', icon:'cube-outline', label:'Recebimento', color:'#2BA569', background:'#E9F8EF', destination:SCREENS.RECEIPT, destinationType:'screen' },
  stock: { id:'stock', icon:'storefront-outline', label:'Estoque', color:'#C61D1F', background:'#FFEEEE', destination:SCREENS.STOCK, destinationType:'screen' },
  purchases: { id:'purchases', icon:'cart-outline', label:'Pedidos e compras', color:'#0B2A5B', background:'#EEF3FF', destination:SCREENS.PURCHASES, destinationType:'screen' },
  reports: { id:'reports', icon:'documents-outline', label:'Relatórios', color:'#0B2A5B', background:'#EEF3FF', destination:SCREENS.REPORTS, destinationType:'screen' },
  materials: { id:'materials', icon:'cube-outline', label:'Materiais', color:'#2BA569', background:'#E9F8EF', destination:TABS.MATERIALS, destinationType:'tab' },
  costs: { id:'costs', icon:'wallet-outline', label:'Custos', color:'#C61D1F', background:'#FFEEEE', destination:TABS.COSTS, destinationType:'tab' },
  projects: { id:'projects', icon:'business-outline', label:'Andamento da obra', color:'#1D6BD6', background:'#EEF3FF', destination:TABS.PROJECTS, destinationType:'tab' },
};

const ROLE_ACTIONS = {
  [USER_ROLES.MASTER]: ['request','quotes','budget','company','receipt','stock'],
  [USER_ROLES.ENGINEERING]: ['budget','quotes','materials','costs','projects','reports'],
  [USER_ROLES.PURCHASING]: ['request','quotes','purchases','receipt','stock','materials'],
  [USER_ROLES.REQUESTER]: ['request','projects','materials'],
  [USER_ROLES.CLIENT]: ['projects','viewBudget','reports'],
};

export function getHomeQuickActions(role) {
  return (ROLE_ACTIONS[role] || ROLE_ACTIONS[USER_ROLES.REQUESTER]).map((key) => ACTIONS[key]);
}

export function createHomeMetrics(dashboardData = {}) {
  return [
    {
      id:'budget',icon:'calculator',label:'Orçamento',value:formatCompactCurrency(Number(dashboardData.budget||0)),color:'#1D6BD6',backgroundColor:'#EEF3FF',destination:TABS.BUDGET,destinationType:'tab',
    },
    {
      id:'deviation',icon:'trending-up',label:'Desvio',value:`${Number(dashboardData.deviation||0)>=0?'+':''}${Number(dashboardData.deviation||0)}%`,color:'#C61D1F',backgroundColor:'#FFEEEE',destination:TABS.COSTS,destinationType:'tab',
    },
    {
      id:'deliveries',icon:'car',label:'Entregas',value:`${Number(dashboardData.lateDeliveries||0)} atrasadas`,color:'#C61D1F',iconColor:'#2BA569',backgroundColor:'#E9F8EF',destination:SCREENS.RECEIPT,destinationType:'screen',
    },
  ];
}

export function createHomeAlerts(dashboardData = {}) {
  const pending = Number(dashboardData.pendingRequests || 0);
  return [
    {
      id:'pending',title:'Solicitações pendentes',description:`${pending} registro(s) aguardando análise.`,icon:'time',color:'#EA6A12',backgroundColor:'#FFF2E8',borderColor:'#F7CCAD',destination:SCREENS.PURCHASES,
    },
  ];
}
