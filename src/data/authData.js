export const USER_ROLES = Object.freeze({
  MASTER: 'MASTER',
  ENGINEERING: 'ENGINEERING',
  PURCHASING: 'PURCHASING',
  REQUESTER: 'REQUESTER',
  CLIENT: 'CLIENT',
});

export const ROLE_LABELS = Object.freeze({
  [USER_ROLES.MASTER]: 'Gestor/Master',
  [USER_ROLES.ENGINEERING]: 'Orçamentista/Engenharia',
  [USER_ROLES.PURCHASING]: 'Compras/Almoxarifado',
  [USER_ROLES.REQUESTER]: 'Obra/Solicitante',
  [USER_ROLES.CLIENT]: 'Consulta/Cliente',
});

export const ROLE_OPTIONS = Object.freeze([
  USER_ROLES.MASTER,
  USER_ROLES.ENGINEERING,
  USER_ROLES.PURCHASING,
  USER_ROLES.REQUESTER,
  USER_ROLES.CLIENT,
]);

export const ROLE_ACCESS = Object.freeze({
  [USER_ROLES.MASTER]: 'Administração da empresa, usuários, obras e acesso a todos os módulos.',
  [USER_ROLES.ENGINEERING]: 'Orçamentos, insumos, composições, custos e apoio às cotações.',
  [USER_ROLES.PURCHASING]: 'Solicitações, cotações, pedidos, recebimentos, etiquetas e estoque.',
  [USER_ROLES.REQUESTER]: 'Solicitações e operações vinculadas às obras autorizadas.',
  [USER_ROLES.CLIENT]: 'Consulta das informações liberadas, sem alteração de cadastros.',
});

export function canManageCompanies(role) {
  return role === USER_ROLES.MASTER;
}

export function canManageEmployees(role) {
  return role === USER_ROLES.MASTER;
}

export function isReadOnlyRole(role) {
  return role === USER_ROLES.CLIENT;
}
