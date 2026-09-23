export const ROLE_OPTIONS = Object.freeze([
  'Gestor/Master',
  'Orçamentista/Engenharia',
  'Compras/Almoxarifado',
  'Obra/Solicitante',
  'Consulta/Cliente',
]);

export const ROLE_DETAILS = Object.freeze({
  'Gestor/Master': {
    color: '#5A1B73',
    backgroundColor: '#EDE6F1',
    access: 'Administração da empresa, usuários, obras e acesso aos módulos operacionais.',
  },
  'Orçamentista/Engenharia': {
    color: '#9B6B08',
    backgroundColor: '#FFF4D6',
    access: 'Orçamentos, insumos, composições, custos e apoio às cotações.',
  },
  'Compras/Almoxarifado': {
    color: '#2F9E7A',
    backgroundColor: '#E5F5EF',
    access: 'Solicitações, cotações, pedidos, recebimentos e estoque.',
  },
  'Obra/Solicitante': {
    color: '#B5473E',
    backgroundColor: '#FBE9E7',
    access: 'Solicitações e operações vinculadas às obras autorizadas.',
  },
  'Consulta/Cliente': {
    color: '#7B3F91',
    backgroundColor: '#F3EAF6',
    access: 'Consulta de informações liberadas, sem administração de cadastros.',
  },
});

export const INITIAL_COMPANIES = Object.freeze([
  {
    id: 'PLANENGEN',
    name: 'PLANENGEN Consultoria',
    document: '00.000.000/0001-00',
    email: 'contato@planengen.com.br',
    status: 'Ativa',
  },
  {
    id: 'AURORA',
    name: 'Aurora Empreendimentos',
    document: '11.111.111/0001-11',
    email: 'contato@aurora.com.br',
    status: 'Ativa',
  },
]);

export const INITIAL_MEMBERS = Object.freeze([
  {
    id: '1',
    name: 'Emelly Santos',
    email: 'gestor@planengen.com.br',
    role: 'Gestor/Master',
    companyId: 'PLANENGEN',
  },
  {
    id: '2',
    name: 'Lucas Almeida',
    email: 'engenharia@planengen.com.br',
    role: 'Orçamentista/Engenharia',
    companyId: 'PLANENGEN',
  },
  {
    id: '3',
    name: 'Ana Paula',
    email: 'compras@planengen.com.br',
    role: 'Compras/Almoxarifado',
    companyId: 'PLANENGEN',
  },
  {
    id: '4',
    name: 'João Costa',
    email: 'obra@planengen.com.br',
    role: 'Obra/Solicitante',
    companyId: 'PLANENGEN',
  },
  {
    id: '5',
    name: 'Cliente Aurora',
    email: 'cliente@aurora.com.br',
    role: 'Consulta/Cliente',
    companyId: 'AURORA',
  },
]);

export const DEFAULT_MEMBER_FORM = Object.freeze({
  name: '',
  email: '',
  role: 'Obra/Solicitante',
  companyId: 'PLANENGEN',
});

export const DEFAULT_COMPANY_FORM = Object.freeze({
  name: '',
  document: '',
  email: '',
});
