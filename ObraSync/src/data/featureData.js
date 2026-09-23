export const FEATURE_SCREEN_CONFIG = Object.freeze({
  receipt: {
    title: 'Recebimento',
    eyebrow: 'PEDIDO #115',
    big: 'Construmais',
    section: 'Conferência do material',
  },
  stock: {
    title: 'Estoque',
    eyebrow: 'RESIDENCIAL AURORA',
    big: '142 itens cadastrados',
    section: 'Movimentações recentes',
  },
  orders: {
    title: 'Pedidos e compras',
    eyebrow: '4 PEDIDOS ATIVOS',
    big: 'R$ 33.088 em compras',
    section: 'Acompanhe os pedidos',
  },
  approvals: {
    title: 'Aprovações',
    eyebrow: 'AÇÃO NECESSÁRIA',
    big: '2 compras pendentes',
    section: 'Aguardando decisão',
  },
});

export const FEATURE_ROWS = Object.freeze({
  stock: [
    { title: 'Entrada', subtitle: 'Cimento CP II', value: '+100 sc', color: '#2F9E7A' },
    { title: 'Saída', subtitle: 'Aço CA-50', value: '-320 kg', color: '#E0A526' },
    { title: 'Perda', subtitle: 'Cerâmica 60x60', value: '-12 un', color: '#B5473E' },
  ],
  orders: [
    { title: '#115 • Construmais', subtitle: 'Em trânsito', value: 'R$ 4.620', color: '#5A1B73' },
    { title: '#109 • Norte Aço', subtitle: 'Atrasado', value: 'R$ 18.340', color: '#B5473E' },
    { title: '#102 • Hidrocenter', subtitle: 'Entrega parcial', value: 'R$ 6.218', color: '#9B6B08' },
  ],
  approvals: [
    { title: 'Pedido #115', subtitle: 'Construmais • acima do previsto', value: 'R$ 4.620', color: '#B5473E' },
    { title: 'Pedido #118', subtitle: 'Norte Materiais • dentro da alçada', value: 'R$ 2.870', color: '#2F9E7A' },
  ],
});
