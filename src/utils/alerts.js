export function buildAlerts({ dashboard, orders, requests, budgetDocuments }) {
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
    if (!order.expected_at || !order.purchased_at || ['RECEIVED', 'CANCELLED', 'Recebido', 'Cancelado'].includes(order.status)) return false;
    return new Date(`${order.expected_at.slice(0,10)}T23:59:59`) < new Date();
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

  const pendingRequests = requests.filter((request) => ['PENDING','Pendente'].includes(request.status));
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
      description: `${budgetDocuments[0].number || 'Documento'} está disponível para consulta e exportação.`,
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
