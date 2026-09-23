export const projects = [
  { id: '1', name: 'Residencial Aurora', client: 'Aurora Empreendimentos', city: 'São Luís - MA', address: 'São Luís - MA', progress: 68, status: 'Em andamento' },
  { id: '2', name: 'Centro Logístico Norte', client: 'Norte Logística', city: 'Paço do Lumiar - MA', address: 'Paço do Lumiar - MA', progress: 31, status: 'Atenção' },
  { id: '3', name: 'Edifício Mirante', client: 'Mirante Incorporações', city: 'São José de Ribamar - MA', address: 'São José de Ribamar - MA', progress: 12, status: 'Planejamento' },
];

export const materials = [
  { id: '1', code: 'CIM-001', name: 'Cimento CP II 50 kg', unit: 'sc', planned: 800, purchased: 620, variation: 12.4, price: 39.12 },
  { id: '2', code: 'ACO-014', name: 'Aço CA-50 10 mm', unit: 'kg', planned: 2400, purchased: 1850, variation: -2.1, price: 7.86 },
  { id: '3', code: 'ARE-003', name: 'Areia média lavada', unit: 'm³', planned: 180, purchased: 96, variation: 4.8, price: 128.5 },
  { id: '4', code: 'TUB-021', name: 'Tubo PVC 100 mm', unit: 'm', planned: 320, purchased: 190, variation: 0, price: 42.9 },
];

export const inventoryLabels = [
  { id: 'ACO-014', name: 'Aço CA-50 10 mm', lot: '4587', unit: 'Barra 12 m', location: 'Galpão A • Setor 03', receivedAt: '17/09/2026' },
  { id: 'CIM-001', name: 'Cimento CP II 50 kg', lot: 'CPII-0926', unit: 'Saco 50 kg', location: 'Depósito 01 • Palete 08', receivedAt: '16/09/2026' },
  { id: 'TUB-021', name: 'Tubo PVC 100 mm', lot: 'PVC-3108', unit: 'Barra 6 m', location: 'Galpão B • Rack 02', receivedAt: '15/09/2026' },
];

export const alerts = [
  { id: '1', type: 'danger', icon: 'warning', title: 'Cimento acima do previsto', description: 'Variação de 12,4% no custo unitário.', time: 'Agora' },
  { id: '2', type: 'warning', icon: 'time', title: 'Aprovação pendente', description: 'Pedido #115 aguarda sua decisão.', time: '18 min' },
  { id: '3', type: 'danger', icon: 'car', title: 'Entrega atrasada', description: 'Aço CA-50 está com 2 dias de atraso.', time: '1 h' },
  { id: '4', type: 'info', icon: 'pricetag', title: 'Cotação vence hoje', description: 'A cotação #028 recebeu 3 propostas.', time: '3 h' },
];

export const defaultExpenses = [
  { id: 'EXP-001', name: 'Concreto usinado', date: '12 jun 2026', amount: 12450, category: 'Materiais', icon: 'construct', color: '#E0A526', bg: '#FFF4D6' },
  { id: 'EXP-002', name: 'Aço CA-50', date: '11 jun 2026', amount: 8320, category: 'Materiais', icon: 'cube', color: '#5A1B73', bg: '#EDE6F1' },
  { id: 'EXP-003', name: 'Frete de materiais', date: '10 jun 2026', amount: 2800, category: 'Frete', icon: 'car', color: '#2F9E7A', bg: '#E5F5EF' },
  { id: 'EXP-004', name: 'Mão de obra', date: '09 jun 2026', amount: 15600, category: 'Mão de obra', icon: 'people', color: '#B5473E', bg: '#FBE9E7' },
];
