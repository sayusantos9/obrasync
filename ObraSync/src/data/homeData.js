import { SCREENS, TABS } from '../navigation/routes';
import { formatCompactCurrency } from '../utils/currency';

export const HOME_QUICK_ACTIONS = Object.freeze([
  {
    id: 'request-material',
    icon: 'cart-outline',
    label: 'Solicitar material',
    color: '#E0A526',
    background: '#FFF9E9',
    destination: SCREENS.REQUEST,
    destinationType: 'screen',
  },
  {
    id: 'quotes',
    icon: 'document-text-outline',
    label: 'Cotações',
    color: '#5A1B73',
    background: '#F7F1F9',
    destination: SCREENS.QUOTES,
    destinationType: 'screen',
  },
  {
    id: 'create-budget',
    icon: 'calculator-outline',
    label: 'Criar orçamento',
    color: '#9B6B08',
    background: '#FFF9E9',
    destination: SCREENS.CREATE_BUDGET,
    destinationType: 'screen',
  },
  {
    id: 'companies',
    icon: 'people-outline',
    label: 'Empresas e acessos',
    color: '#7B3F91',
    background: '#F7F1F9',
    destination: SCREENS.COMPANY_PERMISSIONS,
    destinationType: 'screen',
  },
  {
    id: 'receipt',
    icon: 'cube-outline',
    label: 'Recebimento',
    color: '#2F9E7A',
    background: '#EFF9F5',
    destination: SCREENS.RECEIPT,
    destinationType: 'screen',
  },
  {
    id: 'stock',
    icon: 'storefront-outline',
    label: 'Estoque',
    color: '#B5473E',
    background: '#FDF2F0',
    destination: SCREENS.STOCK,
    destinationType: 'screen',
  },
]);

export const HOME_ALERTS = Object.freeze([
  {
    id: 'cement-over-plan',
    title: 'Cimento acima do previsto',
    description: 'Consumo 18% maior que o planejado.',
    icon: 'warning',
    color: '#B5473E',
    backgroundColor: '#FBE9E7',
    borderColor: '#F2C8C4',
    destination: SCREENS.ALERTS,
  },
  {
    id: 'pending-approval',
    title: 'Aprovação pendente',
    description: '2 cotações aguardam sua aprovação.',
    icon: 'time',
    color: '#E0A526',
    backgroundColor: '#FFF4D6',
    borderColor: '#F2D98F',
    destination: SCREENS.APPROVALS,
  },
]);

export function createHomeMetrics(dashboardData) {
  if (!dashboardData) return [];

  return [
    {
      id: 'budget',
      icon: 'calculator',
      label: 'Orçamento',
      value: formatCompactCurrency(dashboardData.budget),
      color: '#5A1B73',
      backgroundColor: '#EDE6F1',
      destination: TABS.BUDGET,
      destinationType: 'tab',
    },
    {
      id: 'deviation',
      icon: 'trending-up',
      label: 'Desvio',
      value: `+${dashboardData.deviation}%`,
      color: '#B5473E',
      backgroundColor: '#FBE9E7',
      destination: TABS.COSTS,
      destinationType: 'tab',
    },
    {
      id: 'deliveries',
      icon: 'car',
      label: 'Entregas',
      value: `${dashboardData.lateDeliveries} atrasadas`,
      color: '#B5473E',
      iconColor: '#2F9E7A',
      backgroundColor: '#E5F5EF',
      destination: SCREENS.ORDERS,
      destinationType: 'screen',
    },
  ];
}
