export const USER_ROLES = Object.freeze({
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  COMPANY: 'company',
  EMPLOYEE: 'employee',
});

export const ROLE_LABELS = Object.freeze({
  [USER_ROLES.SUPER_ADMIN]: 'Super administrador',
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.COMPANY]: 'Empresa',
  [USER_ROLES.EMPLOYEE]: 'Funcionário',
});

export const TEST_USERS = Object.freeze([
  {
    id: 'USR-SUPER',
    name: 'Super Admin',
    email: 'superadmin@obrasync.com',
    password: '123456',
    role: USER_ROLES.SUPER_ADMIN,
    companyId: 'OBRASYNC',
    companyName: 'ObraSync',
  },
  {
    id: 'USR-ADMIN',
    name: 'Administrador ObraSync',
    email: 'admin@obrasync.com',
    password: '123456',
    role: USER_ROLES.ADMIN,
    companyId: 'PLANENGEN',
    companyName: 'PLANENGEN Consultoria',
  },
  {
    id: 'USR-COMPANY',
    name: 'Gestor da Empresa',
    email: 'empresa@obrasync.com',
    password: '123456',
    role: USER_ROLES.COMPANY,
    companyId: 'PLANENGEN',
    companyName: 'PLANENGEN Consultoria',
  },
  {
    id: 'USR-EMPLOYEE',
    name: 'Funcionário Teste',
    email: 'funcionario@obrasync.com',
    password: '123456',
    role: USER_ROLES.EMPLOYEE,
    companyId: 'PLANENGEN',
    companyName: 'PLANENGEN Consultoria',
  },
]);

export const TEST_LOGIN_HINTS = TEST_USERS.map(({ email, role }) => ({
  email,
  roleLabel: ROLE_LABELS[role],
  password: '123456',
}));

export function authenticateTestUser(email, password) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const normalizedPassword = String(password ?? '').trim();

  const user = TEST_USERS.find(
    (candidate) => candidate.email === normalizedEmail
      && candidate.password === normalizedPassword,
  );

  if (!user) return null;

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function canManageCompanies(role) {
  return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN;
}

export function canManageEmployees(role) {
  return role === USER_ROLES.SUPER_ADMIN
    || role === USER_ROLES.ADMIN
    || role === USER_ROLES.COMPANY;
}
