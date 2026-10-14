import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Text } from 'react-native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import {
  AlertCard,
  AlertIcon,
  AlertInfo,
  AlertTitle,
  Description,
  FilterChip,
  FilterRow,
  FilterText,
  Header,
  MarkButton,
  Time,
  Title,
} from './AlertsScreen.styles';

const ALERT_FILTERS = ['Todos', 'Custos', 'Prazos', 'Aprovações'];
const ALERT_PALETTE = {
  danger: { backgroundColor: '#FBE9E7', color: '#B5473E' },
  warning: { backgroundColor: '#FFF2E8', color: '#C85E0D' },
  info: { backgroundColor: '#EEF3FF', color: '#1D6BD6' },
  success: { backgroundColor: '#E9F8EF', color: '#2BA569' },
};

function buildAlerts({ dashboard, orders, requests, budgetDocuments }) {
  const result = [];

  if (Number(dashboard?.deviation) > 0) {
    result.push({
      id: 'cost-deviation',
      category: 'Custos',
      type: 'danger',
      icon: 'trending-up-outline',
      title: 'Desvio de custos',
      description: `A obra está ${Number(dashboard.deviation).toLocaleString('pt-BR')}% acima do orçamento previsto.`,
      time: 'Agora',
    });
  }

  const lateOrders = orders.filter((order) => {
    if (!order.expected_at || ['Recebido', 'Cancelado'].includes(order.status)) return false;
    return new Date(order.expected_at) < new Date();
  });

  if (lateOrders.length) {
    result.push({
      id: 'late-orders',
      category: 'Prazos',
      type: 'warning',
      icon: 'time-outline',
      title: 'Entregas em atraso',
      description: `${lateOrders.length} pedido(s) ainda aguardam recebimento.`,
      time: 'Hoje',
    });
  }

  const pendingRequests = requests.filter((request) => request.status === 'Pendente');
  if (pendingRequests.length) {
    result.push({
      id: 'pending-requests',
      category: 'Aprovações',
      type: 'info',
      icon: 'clipboard-outline',
      title: 'Solicitações pendentes',
      description: `${pendingRequests.length} solicitação(ões) aguardam andamento.`,
      time: 'Hoje',
    });
  }

  if (budgetDocuments.length) {
    result.push({
      id: 'latest-budget',
      category: 'Custos',
      type: 'success',
      icon: 'document-text-outline',
      title: 'Orçamento disponível',
      description: `${budgetDocuments[0].number || 'Documento'} está disponível na demonstração e pronto para gerar PDF.`,
      time: 'Atual',
    });
  }

  if (!result.length) {
    result.push({
      id: 'all-good',
      category: 'Todos',
      type: 'success',
      icon: 'checkmark-circle-outline',
      title: 'Nenhum alerta crítico',
      description: 'Não há pendências relevantes para a obra selecionada.',
      time: 'Agora',
    });
  }

  return result;
}

export function AlertsScreen() {
  const { budgetDocuments, dashboard, orders, requests } = useApp();
  const [activeFilter, setActiveFilter] = useState('Todos');
  const alerts = useMemo(
    () => buildAlerts({ dashboard, orders, requests, budgetDocuments }),
    [budgetDocuments, dashboard, orders, requests],
  );
  const visibleAlerts = activeFilter === 'Todos'
    ? alerts
    : alerts.filter((alert) => alert.category === activeFilter);

  return (
    <Screen>
      <Scroll>
        <Header>
          <Title>Alertas</Title>
          <MarkButton accessibilityRole="button" accessibilityLabel="Alertas atualizados">
            <Ionicons name="checkmark-done" size={25} color="white" />
          </MarkButton>
        </Header>

        <Content>
          <FilterRow>
            {ALERT_FILTERS.map((label) => {
              const isActive = activeFilter === label;
              return (
                <FilterChip
                  accessibilityRole="button"
                  key={label}
                  $isActive={isActive}
                  onPress={() => setActiveFilter(label)}
                >
                  <FilterText $isActive={isActive}>{label}</FilterText>
                </FilterChip>
              );
            })}
          </FilterRow>

          {!visibleAlerts.length && (
            <Text accessibilityRole="text">Nenhum alerta nesta categoria.</Text>
          )}

          {visibleAlerts.map((alert) => {
            const palette = ALERT_PALETTE[alert.type] ?? ALERT_PALETTE.info;
            return (
              <AlertCard
                accessible
                accessibilityLabel={`${alert.title}. ${alert.description}. ${alert.time}`}
                key={alert.id}
              >
                <AlertIcon $backgroundColor={palette.backgroundColor}>
                  <Ionicons name={alert.icon} size={23} color={palette.color} />
                </AlertIcon>
                <AlertInfo>
                  <AlertTitle>{alert.title}</AlertTitle>
                  <Description>{alert.description}</Description>
                </AlertInfo>
                <Time>{alert.time}</Time>
              </AlertCard>
            );
          })}
        </Content>
      </Scroll>
    </Screen>
  );
}
