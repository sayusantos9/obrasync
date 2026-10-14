import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Alert, Vibration } from 'react-native';
import { USER_ROLES } from '../data/authData';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SCREENS, TABS } from '../navigation/routes';

const AppContext = createContext(null);

const DEFAULT_ACCESSIBILITY = Object.freeze({
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  screenReaderOptimized: true,
  visualAlerts: true,
  vibrationAlerts: false,
});

const DEMO_STOCK = [
  { id: 'MAT-001', code: 'CIM-CP2-50', name: 'Cimento CP II 50kg', unit: 'sc', quantity: 86, minQuantity: 30, location: 'Almoxarifado A' },
  { id: 'MAT-002', code: 'ACO-CA50-10', name: 'Aço CA-50 10mm', unit: 'barra', quantity: 124, minQuantity: 40, location: 'Pátio coberto' },
  { id: 'MAT-003', code: 'TIJ-09X19', name: 'Bloco cerâmico 9x19x19', unit: 'un', quantity: 1450, minQuantity: 500, location: 'Setor B' },
  { id: 'MAT-004', code: 'ARG-AC2-20', name: 'Argamassa AC-II 20kg', unit: 'sc', quantity: 34, minQuantity: 20, location: 'Almoxarifado A' },
];

const DEMO_QUOTES = [];
const DEMO_REQUESTS = [];
const DEMO_ORDERS = [];
const DEMO_RECEIPTS = [];
const DEMO_EXPENSES = [];
const DASHBOARD = { budget: 0, realized: 0, deviation: 0, progress: 0, lateDeliveries: 0, pendingRequests: 0 };

function toProject(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    client: row.client_name || '',
    clientUserId: row.client_user_id || null,
    location: row.location || '',
    status: row.status || 'PLANNED',
    progress: Number(row.progress || 0),
    budget: Number(row.budget || 0),
    startDate: row.start_date || null,
    endDate: row.end_date || null,
  };
}

function toBudget(row) {
  return {
    id: row.id,
    number: row.number || `ORC-${String(row.id).slice(0, 6).toUpperCase()}`,
    title: row.title,
    description: row.description || '',
    clientUserId: row.client_user_id || null,
    clientName: row.client_name || '',
    clientDocument: row.client_document || '',
    clientEmail: row.client_email || '',
    clientPhone: row.client_phone || '',
    total: Number(row.total || 0),
    status: row.status || 'DRAFT',
    validUntil: row.valid_until || '',
    notes: row.notes || '',
    projectId: row.project_id,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '',
    items: (row.budget_items || []).map((item) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity || 0),
      unit: item.unit || 'un',
      unitPrice: Number(item.unit_price || 0),
      total: Number(item.total || 0),
    })),
  };
}

function toMember(row) {
  return {
    id: row.id,
    name: row.name || row.email || 'Usuário',
    email: row.email || '',
    role: row.role,
    companyId: row.company_id,
    active: row.active,
  };
}

export function AppProvider({ children }) {
  const navigation = useAppNavigation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [budgetDocuments, setBudgetDocuments] = useState([]);
  const [quotes, setQuotes] = useState(DEMO_QUOTES);
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [receipts, setReceipts] = useState(DEMO_RECEIPTS);
  const [stock, setStock] = useState(DEMO_STOCK);
  const [extraExpenses, setExtraExpenses] = useState(DEMO_EXPENSES);
  const [companies, setCompanies] = useState([]);
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState(DEFAULT_ACCESSIBILITY);

  async function fetchProfile(authUser) {
    if (!authUser || !supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id,name,email,role,company_id,active,companies(name)')
      .eq('id', authUser.id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
      email: data.email || authUser.email || '',
      role: data.role || USER_ROLES.CLIENT,
      companyId: data.company_id || null,
      companyName: data.companies?.name || '',
      active: data.active !== false,
    };
  }

  async function ensureMasterCompany(authUser, profile) {
    if (!authUser || !profile || profile.companyId || profile.role === USER_ROLES.MASTER) return profile;

    const metadata = authUser.user_metadata || {};
    if (metadata.registration_intent !== USER_ROLES.MASTER || !metadata.company_name) return profile;

    const { error } = await supabase.rpc('create_my_company', {
      p_name: metadata.company_name,
      p_document: metadata.company_document || null,
      p_email: authUser.email || null,
      p_phone: metadata.company_phone || null,
    });

    if (error) throw error;
    return fetchProfile(authUser);
  }

  async function loadAppData(user) {
    if (!supabase || !user) return;

    const [projectsResult, budgetsResult] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('budgets').select('*,budget_items(*)').order('created_at', { ascending: false }),
    ]);

    if (projectsResult.error) throw projectsResult.error;
    if (budgetsResult.error) throw budgetsResult.error;

    const nextProjects = (projectsResult.data || []).map(toProject);
    const nextBudgets = (budgetsResult.data || []).map(toBudget);
    setProjects(nextProjects);
    setBudgetDocuments(nextBudgets);
    setSelectedProject((current) => {
      if (current && nextProjects.some((project) => project.id === current.id)) return current;
      return nextProjects[0] || null;
    });

    if (user.role === USER_ROLES.MASTER || user.role === USER_ROLES.ENGINEERING) {
      const [membersResult, companyResult] = await Promise.all([
        supabase.from('profiles').select('id,name,email,role,company_id,active').order('name'),
        user.companyId
          ? supabase.from('companies').select('*').eq('id', user.companyId)
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (membersResult.error) throw membersResult.error;
      if (companyResult.error) throw companyResult.error;
      setMembers((membersResult.data || []).map(toMember));
      setCompanies(companyResult.data || []);
    } else {
      setMembers([]);
      setCompanies([]);
    }
  }

  async function establishSession(authUser) {
    if (!authUser) {
      setCurrentUser(null);
      setProjects([]);
      setBudgetDocuments([]);
      setMembers([]);
      setCompanies([]);
      setSelectedProject(null);
      return null;
    }

    let profile = await fetchProfile(authUser);
    profile = await ensureMasterCompany(authUser, profile);
    if (!profile.active) throw new Error('Este acesso está desativado. Procure o Gestor da empresa.');

    setCurrentUser(profile);
    await loadAppData(profile);
    return profile;
  }

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) {
          setAuthError('Supabase não configurado.');
          setIsAuthReady(true);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session?.user) await establishSession(data.session.user);
      } catch (error) {
        if (mounted) setAuthError(error.message || 'Não foi possível restaurar a sessão.');
      } finally {
        if (mounted) setIsAuthReady(true);
      }
    }

    restoreSession();

    const { data: listener } = supabase?.auth.onAuthStateChange((event) => {
      if (!mounted || event === 'INITIAL_SESSION') return;
      if (event === 'SIGNED_OUT') setCurrentUser(null);
    }) || { data: null };

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function login({ email, password, role }) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : error.message);
    }

    const profile = await establishSession(data.user);
    if (role && profile?.role !== role) {
      await supabase.auth.signOut();
      setCurrentUser(null);
      throw new Error('Este usuário pertence a outro perfil. Volte e escolha o perfil correto.');
    }

    setAuthError('');
    navigation.resetNavigation();
    if (profile?.role === USER_ROLES.MASTER) navigation.openScreen(SCREENS.MASTER_PANEL);
    return profile;
  }

  async function registerCompany(payload) {
    if (!supabase) throw new Error('Supabase não configurado.');

    const email = payload.email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.name?.trim() || '',
          registration_intent: USER_ROLES.MASTER,
          company_name: payload.companyName?.trim() || '',
          company_document: payload.companyDocument?.trim() || '',
          company_phone: payload.companyPhone?.trim() || '',
        },
      },
    });

    if (error) throw new Error(error.message);

    if (!data.session) {
      return { requiresEmailConfirmation: true, email };
    }

    let profile = await fetchProfile(data.user);
    profile = await ensureMasterCompany(data.user, profile);
    setCurrentUser(profile);
    await loadAppData(profile);
    setAuthError('');
    navigation.resetNavigation();
    navigation.openScreen(SCREENS.MASTER_PANEL);
    return profile;
  }

  async function logout() {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) console.warn('Falha ao encerrar sessão no Supabase:', error.message);
      }
    } finally {
      setCurrentUser(null);
      setProjects([]);
      setBudgetDocuments([]);
      setMembers([]);
      setCompanies([]);
      setSelectedProject(null);
      setAuthError('');
      navigation.resetNavigation();
    }
  }

  async function selectProject(project) {
    setSelectedProject(project);
    navigation.selectTab(TABS.HOME);
  }

  async function refreshCurrentProject() {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
      await loadAppData(currentUser);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createProject(data) {
    if (!supabase || !currentUser?.companyId) throw new Error('Empresa não identificada.');
    const client = members.find((member) => member.role === USER_ROLES.CLIENT && member.id === data.clientUserId);
    const { data: created, error } = await supabase
      .from('projects')
      .insert({
        company_id: currentUser.companyId,
        name: data.name?.trim(),
        client_name: client?.name || data.client || '',
        client_user_id: client?.id || null,
        location: data.location?.trim() || null,
        budget: Number(data.budget || 0),
        status: 'PLANNED',
        progress: 0,
        created_by: currentUser.id,
      })
      .select('*')
      .single();
    if (error) throw error;
    const project = toProject(created);
    setProjects((current) => [project, ...current]);
    setSelectedProject(project);
    return project;
  }

  async function addBudgetDocument(data) {
    if (!supabase || !currentUser?.companyId || !selectedProject?.id) throw new Error('Selecione uma obra antes de criar o orçamento.');

    const items = data.items || [];
    const total = Number(items.reduce((sum, item) => sum + Number(item.total || Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0));
    const clientById = members.find((member) => member.id === data.clientUserId && member.role === USER_ROLES.CLIENT);
    const clientByEmail = members.find((member) => member.role === USER_ROLES.CLIENT && member.email.toLowerCase() === String(data.clientEmail || '').trim().toLowerCase());
    const client = clientById || clientByEmail || null;

    if (!client) {
      throw new Error('Vincule este orçamento a um Cliente cadastrado pelo Gestor.');
    }

    const number = `ORC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        company_id: currentUser.companyId,
        project_id: selectedProject.id,
        number,
        title: data.title?.trim(),
        description: data.description?.trim() || null,
        status: 'DRAFT',
        total,
        valid_until: data.validUntil || null,
        notes: data.notes?.trim() || null,
        client_user_id: client.id,
        client_name: client.name,
        client_document: data.clientDocument?.trim() || null,
        client_email: client.email,
        client_phone: data.clientPhone?.trim() || null,
        created_by: currentUser.id,
      })
      .select('*')
      .single();

    if (budgetError) throw budgetError;

    const itemRows = items.map((item) => ({
      budget_id: budget.id,
      description: item.description,
      quantity: Number(item.quantity || 0),
      unit: item.unit || 'un',
      unit_price: Number(item.unitPrice || 0),
    }));

    if (itemRows.length) {
      const { error: itemsError } = await supabase.from('budget_items').insert(itemRows);
      if (itemsError) {
        await supabase.from('budgets').delete().eq('id', budget.id);
        throw itemsError;
      }
    }

    if (selectedProject.clientUserId !== client.id) {
      const { error: projectLinkError } = await supabase
        .from('projects')
        .update({ client_user_id: client.id, client_name: client.name })
        .eq('id', selectedProject.id);
      if (!projectLinkError) {
        setProjects((current) => current.map((project) => project.id === selectedProject.id
          ? { ...project, clientUserId: client.id, client: client.name }
          : project));
        setSelectedProject((current) => current?.id === selectedProject.id
          ? { ...current, clientUserId: client.id, client: client.name }
          : current);
      }
    }

    const { data: complete, error: reloadError } = await supabase
      .from('budgets')
      .select('*,budget_items(*)')
      .eq('id', budget.id)
      .single();
    if (reloadError) throw reloadError;

    const document = toBudget(complete);
    setBudgetDocuments((current) => [document, ...current]);
    return document;
  }

  async function removeBudgetDocument(id) {
    if (!supabase) return;
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw error;
    setBudgetDocuments((current) => current.filter((item) => item.id !== id));
  }

  async function createMember(data) {
    if (!supabase) throw new Error('Supabase não configurado.');
    if (currentUser?.role !== USER_ROLES.MASTER) throw new Error('Somente o Gestor pode cadastrar usuários.');

    const { data: created, error } = await supabase.functions.invoke('create-member', {
      body: {
        name: data.name?.trim(),
        email: data.email?.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      },
    });

    if (error) throw new Error(error.message || 'Não foi possível cadastrar o usuário.');
    if (created?.error) throw new Error(created.error);

    const member = toMember(created);
    setMembers((current) => [...current.filter((item) => item.id !== member.id), member].sort((a, b) => a.name.localeCompare(b.name)));
    return member;
  }

  async function submitMaterialRequest(data) {
    const item = { id: `REQ-${Date.now()}`, status: isOffline ? 'Aguardando sincronização' : 'Pendente', ...data };
    if (isOffline) setPendingRequests((current) => [item, ...current]);
    else setRequests((current) => [item, ...current]);
    return item;
  }

  async function syncPendingRequests() {
    if (!pendingRequests.length) {
      Alert.alert('Tudo certo', 'Não há pendências.');
      return;
    }
    setIsSyncing(true);
    setRequests((current) => [...pendingRequests.map((item) => ({ ...item, status: 'Pendente' })), ...current]);
    setPendingRequests([]);
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert('Sincronização', 'Pendências sincronizadas.');
    }, 350);
  }

  async function addQuote(data) {
    const item = { id: `COT-${Date.now()}`, number: `COT-${String(Date.now()).slice(-6)}`, status: 'Em análise', items: [], ...data };
    setQuotes((current) => [item, ...current]);
    return item;
  }
  async function removeQuote(id) { setQuotes((current) => current.filter((item) => item.id !== id)); }
  async function addExpense(data) { const item = { id: `EXP-${Date.now()}`, ...data, amount: Number(data.amount || 0) }; setExtraExpenses((c) => [item, ...c]); return item; }
  async function createCompany() { throw new Error('A empresa principal é criada no primeiro cadastro do Gestor.'); }
  async function createOrder(data) { const item = { id: `PO-${Date.now()}`, number: `PED-${String(Date.now()).slice(-6)}`, status: 'Criado', ...data }; setOrders((c) => [item, ...c]); return item; }
  async function createReceipt(data) { const item = { id: `REC-${Date.now()}`, receivedAt: new Date().toLocaleDateString('pt-BR'), ...data }; setReceipts((c) => [item, ...c]); return item; }
  async function createStockMovement(data) {
    const quantity = Number(data.quantity || 0);
    setStock((current) => current.map((item) => item.code === data.materialCode || item.id === data.materialId
      ? { ...item, quantity: Math.max(0, Number(item.quantity || 0) + (data.type === 'OUT' ? -quantity : quantity)) }
      : item));
    return { id: `MOV-${Date.now()}`, ...data, quantity };
  }
  async function createLabel(data) {
    const id = `LBL-${String(Date.now()).slice(-8)}`;
    const payload = `obrasync://label/${encodeURIComponent(id)}?material=${encodeURIComponent(data.materialCode || '')}&obra=${encodeURIComponent(selectedProject?.name || '')}&lote=${encodeURIComponent(data.lot || '')}&local=${encodeURIComponent(data.location || '')}`;
    return { label: { id, lot: data.lot || '-', ...data }, qr: { payload } };
  }

  async function updateAccessibility(patch) {
    const next = { ...accessibilitySettings, ...patch };
    setAccessibilitySettings(next);
    try { await AsyncStorage.setItem('@obrasync:accessibility', JSON.stringify(next)); } catch {}
  }

  function notifyAccessible(title, message) {
    if (accessibilitySettings.vibrationAlerts) Vibration.vibrate(180);
    if (accessibilitySettings.screenReaderOptimized) AccessibilityInfo.announceForAccessibility(`${title}. ${message}`);
    if (accessibilitySettings.visualAlerts) Alert.alert(title, message);
  }

  const dashboard = useMemo(() => {
    const budget = Number(selectedProject?.budget || 0);
    return { ...DASHBOARD, budget, progress: Number(selectedProject?.progress || 0), pendingRequests: requests.filter((item) => item.status === 'Pendente').length };
  }, [selectedProject, requests]);

  const value = useMemo(() => ({
    ...navigation,
    currentUser,
    authToken: null,
    isAuthReady,
    needsBootstrap: false,
    authError,
    connectionStatus: isSupabaseConfigured ? 'online' : 'offline',
    checkConnection: async () => isSupabaseConfigured,
    login,
    registerCompany,
    logout,
    projects,
    selectedProject,
    selectProject,
    createProject,
    dashboard,
    refreshCurrentProject,
    isRefreshing,
    budgetDocuments,
    addBudgetDocument,
    removeBudgetDocument,
    quotes,
    addQuote,
    removeQuote,
    requests,
    pendingRequests,
    submitMaterialRequest,
    syncPendingRequests,
    isSyncing,
    isOffline,
    setIsOffline,
    orders,
    createOrder,
    receipts,
    createReceipt,
    stock,
    createStockMovement,
    extraExpenses,
    addExpense,
    companies,
    members,
    createCompany,
    createMember,
    createLabel,
    accessibilitySettings,
    updateAccessibility,
    notifyAccessible,
  }), [
    navigation, currentUser, isAuthReady, authError, projects, selectedProject, dashboard, isRefreshing,
    budgetDocuments, quotes, requests, pendingRequests, isSyncing, isOffline, orders, receipts, stock,
    extraExpenses, companies, members, accessibilitySettings,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
}
