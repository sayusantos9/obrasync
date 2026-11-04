const RULES = {
  manageCompany: ['MASTER'], manageMembers: ['MASTER'], manageProjects: ['MASTER'],
  writeBudget: ['MASTER', 'ENGINEERING'], writeExpense: ['MASTER', 'ENGINEERING'],
  writeCatalog: ['MASTER', 'ENGINEERING'], writeQuote: ['MASTER', 'ENGINEERING', 'PURCHASING'],
  requestMaterial: ['MASTER', 'PURCHASING', 'REQUESTER'],
  manageStock: ['MASTER', 'PURCHASING'], managePurchase: ['MASTER', 'PURCHASING'],
};
export function canPerform(role, action) { return Boolean(RULES[action]?.includes(role)); }
export function assertPermission(role, action) {
  if (!canPerform(role, action)) throw new Error('Seu perfil não tem permissão para esta operação.');
}
const WRITE_ROUTES = { 'create-budget': 'writeBudget', 'add-expense': 'writeExpense', 'create-quote': 'writeQuote', request: 'requestMaterial', transfers: 'manageStock', label: 'manageStock', 'create-member': 'manageMembers', 'create-company': 'manageCompany', companies: 'manageCompany', 'company-permissions': 'manageMembers', 'master-panel': 'manageCompany' };
export function canAccessRoute(role, screen, tab) {
  if (!['MASTER', 'ENGINEERING', 'PURCHASING', 'REQUESTER', 'CLIENT'].includes(role)) return false;
  if (WRITE_ROUTES[screen]) return canPerform(role, WRITE_ROUTES[screen]);
  if (role === 'CLIENT') return screen === 'tabs' ? ['home', 'projects', 'budget'].includes(tab) : ['settings', 'profile', 'accessibility', 'guide', 'reports'].includes(screen);
  return true;
}
export function requiresProject(screen, tab) {
  return ['request', 'receipt', 'stock', 'purchases', 'orders', 'transfers', 'label', 'scanner', 'add-expense'].includes(screen) || (screen === 'tabs' && tab === 'costs');
}
