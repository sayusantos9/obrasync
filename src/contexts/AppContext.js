import {rpcWithReauthentication} from '../services/recentAuth';
import {receiptQueue,saveReceiptCache,readReceiptCache} from '../services/receiptQueue';
import {isConnectionFailure} from '../utils/receiptQueueCore';
import {prepareComparableQuote} from '../utils/quoteComparison';
import {DEFAULT_ACCESSIBILITY,mergeAccessibility} from '../utils/accessibility';
import { readRequestQueue, updateRequestQueue, operationId } from '../services/requestQueue';
import { procurementAction, fetchOperations } from '../services/procurementService';
import { assertPermission } from '../utils/permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Alert, Vibration } from 'react-native';
import { USER_ROLES } from '../data/authData';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SCREENS, TABS } from '../navigation/routes';
import { fetchCostInputs, saveCompanyInput } from '../services/costInputService';
import { calculateBudget } from '../utils/bdi';
import { prepareQuote, encodeQuoteMeta, toQuote } from '../utils/quotes';
import { toDatabaseDate } from '../utils/dates';
import { parseProjectBudget, reconcileSelectedProject } from '../utils/projects';

const AppContext = createContext(null);

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
    baselineBudgetId: row.baseline_budget_id || null,
    startDate: row.start_date || null,
    endDate: row.end_date || null,
  };
}

function toBudget(row) {
  return {
    id: row.id,
    number: row.number || `ORC-${String(row.id).slice(0, 6).toUpperCase()}`,
    title: row.title,
    baseDate: row.base_date || null,
    revisionOf: row.revision_of || null,
    revisionRootId: row.revision_root_id || row.id,
    revisionNumber: row.revision_number || 1,
    revisionReason: row.revision_reason || "",
    description: row.description || '',
    clientUserId: row.client_user_id || null,
    clientName: row.client_name || '',
    clientDocument: row.client_document || '',
    clientEmail: row.client_email || '',
    clientPhone: row.client_phone || '',
    subtotal: row.subtotal_without_bdi == null ? undefined : Number(row.subtotal_without_bdi),
    bdiRate: Number(row.bdi_percent || 0),
    bdiAmount: Number(row.bdi_amount || 0),
    bdiConfig: row.bdi_config || null,
    total: Number(row.total || 0),
    status: row.status || 'DRAFT',
    validUntil: row.valid_until || '',
    notes: row.notes || '',
    projectId: row.project_id,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : '',
    items: (row.budget_items || []).map((item) => ({
      id: item.id,
      inputId: item.catalog_input_id || item.input_id,
      source: item.catalog_input_id ? 'shared' : 'company',
      code: item.input_code || '',
      inputType: item.input_type || 'MATERIAL',
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
  const [costInputs, setCostInputs] = useState([]);
  const [costInputsError, setCostInputsError] = useState('');
  async function refreshCostInputs() {
    try { const rows = await fetchCostInputs(); setCostInputs(rows); setCostInputsError(''); return rows; }
    catch (error) { setCostInputsError(error.message); throw error; }
  }
  async function createCostInput(draft) {
    assertPermission(currentUser?.role, 'writeCatalog');
    const item = await saveCompanyInput(draft, currentUser);
    setCostInputs(rows => [...rows, item]);
    return item;
  }
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [receipts, setReceipts] = useState(DEMO_RECEIPTS);
  const [stock, setStock] = useState([]);
  const [extraExpenses, setExtraExpenses] = useState(DEMO_EXPENSES);
  const [companies, setCompanies] = useState([]);
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingReceipts,setPendingReceipts]=useState([]);
  const [isSyncingReceipts,setIsSyncingReceipts]=useState(false);
  const [receiptCacheDate,setReceiptCacheDate]=useState(null);
  const userRef=useRef(currentUser);userRef.current=currentUser;
  const receiptSyncRef=useRef(false);
  const receiptRunRef=useRef(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState(DEFAULT_ACCESSIBILITY);
  const accessibilityRef = useRef(DEFAULT_ACCESSIBILITY);
  const accessibilityChanged = useRef(false);
  const accessibilityWrites = useRef(Promise.resolve());
  const syncingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem('@obrasync:accessibility').then(raw => {
      if (!mounted || accessibilityChanged.current || !raw) return;
      const saved = JSON.parse(raw);
      const next = mergeAccessibility(DEFAULT_ACCESSIBILITY,saved);
      accessibilityRef.current = next;
      setAccessibilitySettings(next);
    }).catch(() => { /* Preferências inválidas não impedem a abertura do app. */ });
    return () => { mounted = false; };
  }, []);

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

    const { error } = await rpcWithReauthentication(supabase,'create_my_company', {
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

    const [projectsResult, budgetsResult, quotesResult] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('budgets').select('*,budget_items(*)').order('created_at', { ascending: false }),
      supabase.from('quotations').select('*,quotation_items(*),quote_rounds!quotations_round_id_fkey(*)').order('created_at', { ascending: false }),
    ]);

    if (projectsResult.error) throw projectsResult.error;
    if (budgetsResult.error) throw budgetsResult.error;
    if (quotesResult.error) throw quotesResult.error;
    setQuotes((quotesResult.data || []).map(toQuote));
    if (['MASTER', 'ENGINEERING', 'PURCHASING'].includes(user.role)) {
      try { await refreshCostInputs(); } catch { /* O editor mostra o erro e permite atualizar. */ }
    } else { setCostInputs([]); setCostInputsError(''); }

    const nextProjects = (projectsResult.data || []).map(toProject);
    const nextBudgets = (budgetsResult.data || []).map(toBudget);
    const operations=await refreshOperations(user,false);
    await saveReceiptCache(user,nextProjects,operations.orders,operations.receipts).catch(()=>{});
    setReceiptCacheDate(null);
    setProjects(nextProjects);
    setBudgetDocuments(nextBudgets);
    setSelectedProject((current) => reconcileSelectedProject(current, nextProjects));

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
      userRef.current=null;setCurrentUser(null);
      setProjects([]);
      setBudgetDocuments([]);
      setQuotes([]); setCostInputs([]); setCostInputsError('');
      setRequests([]); setOrders([]); setReceipts([]); setStock([]); setExtraExpenses([]); setPendingRequests([]); setPendingReceipts([]); setReceiptCacheDate(null);
      setMembers([]);
      setCompanies([]);
      setSelectedProject(null);
      return null;
    }

    try {
    let profile = await fetchProfile(authUser);
    profile = await ensureMasterCompany(authUser, profile);
    if (!profile.active) throw new Error('Este acesso está desativado. Procure o Gestor da empresa.');

    userRef.current=profile;setCurrentUser(profile);
    await loadAppData(profile);
    setPendingRequests(await readRequestQueue(profile));
    setPendingReceipts(await receiptQueue.read(profile));
    return profile;
    } catch(error) {
      if(!isConnectionFailure(error)) throw error;
      const cached=await readReceiptCache(authUser);
      if(!cached)throw error;
      userRef.current=cached.profile;setCurrentUser(cached.profile);setProjects(cached.projects);setOrders(cached.orders);setReceipts(cached.receipts);
      setSelectedProject(cached.projects[0]||null);setReceiptCacheDate(cached.savedAt);
      setBudgetDocuments([]);setQuotes([]);setCostInputs([]);setRequests([]);setStock([]);setExtraExpenses([]);setMembers([]);setCompanies([]);
      setPendingReceipts(await receiptQueue.read(cached.profile));setPendingRequests(await readRequestQueue(cached.profile));
      navigation.openScreen(SCREENS.RECEIPT);
      return cached.profile;
    }
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
      if (event === 'SIGNED_OUT') {userRef.current=null;setCurrentUser(null);setPendingReceipts([]);setReceiptCacheDate(null);}
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
      userRef.current=null;setCurrentUser(null);
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
    userRef.current=profile;setCurrentUser(profile);
    await loadAppData(profile);
    setPendingRequests(await readRequestQueue(profile));
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
      userRef.current=null;setCurrentUser(null);
      setProjects([]);
      setBudgetDocuments([]);
      setQuotes([]); setCostInputs([]); setCostInputsError('');
      setRequests([]); setOrders([]); setReceipts([]); setStock([]); setExtraExpenses([]); setPendingRequests([]); setPendingReceipts([]); setReceiptCacheDate(null);
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

  useEffect(() => {
    const subscription=AppState.addEventListener('change',state=>{
      if(state==='active'&&currentUser) refreshCurrentProject().catch(()=>{});
    });
    return ()=>subscription.remove();
  },[currentUser?.id]);

  async function refreshCurrentProject() {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
      const profile=await fetchProfile({id:currentUser.id});
      if(!profile?.active){await logout();throw new Error('Este acesso foi desativado pelo Gestor.');}
      userRef.current=profile;setCurrentUser(profile);
      await loadAppData(profile);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function createProject(data) {
    if (!supabase || !currentUser?.companyId) throw new Error('Empresa não identificada.');
    if (currentUser.role !== USER_ROLES.MASTER) throw new Error('Somente o Gestor pode cadastrar obras.');
    if (!data.name?.trim()) throw new Error('Informe o nome da obra.');
    const budget = parseProjectBudget(data.budget);
    if (!Number.isFinite(budget)) throw new Error('Informe um orçamento válido, maior ou igual a zero.');
    const client = members.find((member) => member.role === USER_ROLES.CLIENT && member.active !== false && member.id === data.clientUserId);
    if (data.clientUserId && !client) throw new Error('O cliente selecionado não está mais disponível. Atualize a lista.');
    const { data: created, error } = await supabase
      .from('projects')
      .insert({
        company_id: currentUser.companyId,
        name: data.name?.trim(),
        client_name: client?.name || data.client || '',
        client_user_id: client?.id || null,
        location: data.location?.trim() || null,
        budget,
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
    assertPermission(currentUser?.role, 'writeBudget');
    if (!supabase || !currentUser?.companyId || !selectedProject?.id) throw new Error('Selecione uma obra antes de criar o orçamento.');

    const calculated = calculateBudget(data.items || [], data.bdiConfig);
    const { items, total } = calculated;
    const clientById = members.find((member) => member.id === data.clientUserId && member.role === USER_ROLES.CLIENT);
    const clientByEmail = members.find((member) => member.role === USER_ROLES.CLIENT && member.email.toLowerCase() === String(data.clientEmail || '').trim().toLowerCase());
    const client = clientById || clientByEmail || null;

    if (data.clientUserId && !client) throw new Error('Cliente não encontrado nesta empresa.');

    const {data: budgetId,error: budgetError}=await rpcWithReauthentication(supabase,'save_budget_version',{
      p_project_id:selectedProject.id,
      p_data:{...data,...calculated,clientUserId:client?.id||null,
        baseDate:toDatabaseDate(data.baseDate),validUntil:toDatabaseDate(data.validUntil)}
    });
    if(budgetError)throw budgetError;
    const budget={id:budgetId};

    if (client && selectedProject.clientUserId !== client.id) {
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

  async function setBudgetBaseline(document) {
    const {error}=await rpcWithReauthentication(supabase,'set_budget_baseline',{p_project_id:document.projectId,p_budget_id:document.id});
    if(error)throw error;
    const patch=p=>p?.id===document.projectId?{...p,budget:document.total,baselineBudgetId:document.id}:p;
    setProjects(rows=>rows.map(patch));setSelectedProject(patch);
  }

  async function removeBudgetDocument(id, reason) {
    assertPermission(currentUser?.role, 'writeBudget');
    if (!supabase) return;
    const { error } = await rpcWithReauthentication(supabase,'archive_document',{p_kind:'budget',p_id:id,p_reason:reason});
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

  async function refreshOperations(user=userRef.current,cache=true) {
    const data = await fetchOperations();
    if(user&&userRef.current?.id!==user.id)return data;
    setRequests(data.requests); setOrders(data.orders); setReceipts(data.receipts); setStock(data.stock); setExtraExpenses(data.expenses);
    if(cache&&user&&userRef.current?.id===user.id&&projects.length)await saveReceiptCache(user,projects,data.orders,data.receipts).catch(()=>{});
    return data;
  }
  async function refreshAfterWrite() {
    try { await refreshOperations(); }
    catch { Alert.alert('Registro salvo','O servidor confirmou a gravação, mas não foi possível atualizar a lista. Atualize a obra para consultar.'); }
  }
  async function submitMaterialRequest(data) {
    assertPermission(currentUser?.role, 'requestMaterial');
    if(!selectedProject?.id) throw new Error('Selecione uma obra.');
    const id=data.clientRequestId || operationId();
    const record={id,userId:currentUser.id,companyId:currentUser.companyId,projectId:selectedProject.id,data:{...data,clientRequestId:id}};
    setPendingRequests(await updateRequestQueue(currentUser,rows=>[...rows.filter(r=>r.id!==id),record]));
    if(isOffline) return {id,status:'QUEUED'};
    try {
      const item=await procurementAction('REQUEST',record.projectId,record.data);
      setPendingRequests(await updateRequestQueue(currentUser,rows=>rows.filter(r=>r.id!==id)));
      await refreshAfterWrite();
      return {...item,status:'PENDING'};
    } catch(error) {
      return {id,status:'QUEUED',message:error.message};
    }
  }
  async function discardPendingRequest(id) {
    setPendingRequests(await updateRequestQueue(currentUser,rows=>rows.filter(r=>r.id!==id)));
  }
  async function syncPendingRequests() {
    assertPermission(currentUser?.role,'requestMaterial');
    if(syncingRef.current) return;
    if(isOffline) throw new Error('Desative o modo de preenchimento offline para enviar.');
    syncingRef.current=true; setIsSyncing(true);
    try {
      const batch=await readRequestQueue(currentUser);
      for(const record of batch) {
        await procurementAction('REQUEST',record.projectId,record.data);
        setPendingRequests(await updateRequestQueue(currentUser,rows=>rows.filter(r=>r.id!==record.id)));
      }
      await refreshAfterWrite();
    } finally { syncingRef.current=false; setIsSyncing(false); }
  }

  async function addQuote(data) {
    assertPermission(currentUser?.role, 'writeQuote');
    if (!supabase || !currentUser?.companyId) throw new Error('Empresa não identificada.');
    const prepared = prepareComparableQuote(data, selectedProject?.id);
    const {data:id,error}=await rpcWithReauthentication(supabase,'save_comparable_quote',{p_project_id:prepared.projectId,p_data:{...prepared,encodedNotes:encodeQuoteMeta(prepared)}});
    if(error)throw error;
    const {data:row,error:reloadError}=await supabase.from('quotations').select('*,quotation_items(*),quote_rounds!quotations_round_id_fkey(*)').eq('id',id).single();
    if(reloadError)throw new Error('Proposta salva. Atualize a obra para consultar; não envie novamente.');
    const item = toQuote(row);
    setQuotes((current) => [item, ...current]);
      await refreshAfterWrite();
    return item;
  }
  async function awardQuote(id,reason){
    const {data:orderId,error}=await rpcWithReauthentication(supabase,'award_quote',{p_quote_id:id,p_reason:reason});
    if(error)throw error;
    try {
      const {data,error:readError}=await supabase.from('quotations').select('*,quotation_items(*),quote_rounds!quotations_round_id_fkey(*)').order('created_at',{ascending:false});
      if(readError)throw readError;setQuotes((data||[]).map(toQuote));await refreshAfterWrite();
    }catch{Alert.alert('Escolha registrada','Atualize a obra para visualizar o pedido e o resultado da rodada.');}
    return orderId;
  }
  async function removeQuote(id, reason) {
    assertPermission(currentUser?.role, 'writeQuote');
    const { error } = await rpcWithReauthentication(supabase,'archive_document',{p_kind:'quote',p_id:id,p_reason:reason});
    if (error) throw error;
    setQuotes((current) => current.filter((item) => item.id !== id));
  }
  async function addExpense(data) {
    assertPermission(currentUser?.role, 'writeExpense');
    const item=await procurementAction('EXPENSE',selectedProject?.id,data);
    await refreshAfterWrite(); return {...data,...item};
  }
  async function createCompany() { throw new Error('A empresa principal é criada no primeiro cadastro do Gestor.'); }
  async function createOrder(data) {
    assertPermission(currentUser?.role, 'managePurchase');
    const item = await procurementAction('ORDER', selectedProject?.id, data);
    await refreshAfterWrite(); return item;
  }
  async function confirmPurchase(id) {
    assertPermission(currentUser?.role,'managePurchase');
    await procurementAction('PURCHASE',selectedProject?.id,{id});
    await refreshAfterWrite();
  }
  async function decideOrder(id, approve, reason) {
    assertPermission(currentUser?.role, 'approvePurchase');
    await procurementAction(approve ? 'APPROVE' : 'REJECT', selectedProject?.id, { id, reason });
    await refreshAfterWrite();
  }
  async function createReceipt(data,action='RECEIVE') {
    if(!(action==='RETURN'?['MASTER','PURCHASING']:['MASTER','PURCHASING','REQUESTER']).includes(currentUser?.role))throw new Error('Perfil não autorizado.');
    const user=currentUser,order=orders.find(o=>o.id===data.orderId),id=operationId();
    await receiptQueue.enqueue(user,selectedProject?.id,order,data,id,action);
    setPendingReceipts(await receiptQueue.read(user));
    if(!isOffline)await syncPendingReceipts();
    const queued=(await receiptQueue.read(user)).find(r=>r.id===id);
    return {id,status:queued?queued.state:'SYNCED',message:queued?.error};
  }
  async function discardPendingReceipt(id){setPendingReceipts(await receiptQueue.discard(currentUser,id));}
  async function syncPendingReceipts(retryConflicts=false){
    const user=currentUser;
    if(!user||isOffline||receiptSyncRef.current)return;
    receiptSyncRef.current=true;setIsSyncingReceipts(true);
    try {
      const result=await receiptQueue.sync(user,{retryConflicts,onChange:rows=>{if(userRef.current?.id===user.id)setPendingReceipts(rows);}});
      if(userRef.current?.id===user.id){setPendingReceipts(result.rows);if(result.completed)await refreshAfterWrite();}
      return result;
    }finally{receiptSyncRef.current=false;if(userRef.current?.id===user.id)setIsSyncingReceipts(false);}
  }
  receiptRunRef.current=syncPendingReceipts;
  useEffect(()=>{
    if(!currentUser||isOffline||!['MASTER','PURCHASING','REQUESTER'].includes(currentUser.role))return;
    const run=()=>{if(AppState.currentState==='active')receiptRunRef.current().catch(()=>{});};
    run();const timer=setInterval(run,30000);const sub=AppState.addEventListener('change',state=>{if(state==='active')run();});
    return()=>{clearInterval(timer);sub.remove();};
  },[currentUser?.id,currentUser?.companyId,isOffline]);
  async function createStockMovement(data) {
    assertPermission(currentUser?.role, 'consumeStock');
    const item=await procurementAction('STOCK',selectedProject?.id,data);
    await refreshAfterWrite(); return item;
  }
  async function createLabel(data) {
    assertPermission(currentUser?.role, 'manageStock');
    if (!selectedProject?.id) throw new Error('Selecione uma obra antes de continuar.');
    const id = `LBL-${String(Date.now()).slice(-8)}`;
    const payload = `obrasync://label/${encodeURIComponent(id)}?material=${encodeURIComponent(data.materialCode || '')}&obra=${encodeURIComponent(selectedProject?.name || '')}&lote=${encodeURIComponent(data.lot || '')}&local=${encodeURIComponent(data.location || '')}`;
    return { label: { id, lot: data.lot || '-', ...data }, qr: { payload } };
  }

  async function updateAccessibility(patch) {
    accessibilityChanged.current = true;
    const next = mergeAccessibility(accessibilityRef.current,patch);
    accessibilityRef.current = next;
    setAccessibilitySettings(next);
    accessibilityWrites.current = accessibilityWrites.current.catch(() => {}).then(() => AsyncStorage.setItem('@obrasync:accessibility', JSON.stringify(next)));
    try { await accessibilityWrites.current; } catch { Alert.alert('Preferências não salvas', 'O ajuste foi aplicado nesta sessão, mas não pôde ser salvo neste aparelho.'); }
  }

  function notifyAccessible(title, message) {
    if (accessibilitySettings.vibrationAlerts) Vibration.vibrate(180);
    if (accessibilitySettings.screenReaderOptimized && !accessibilitySettings.muteSounds) AccessibilityInfo.announceForAccessibility(`${title}. ${message}`);
    if (accessibilitySettings.visualAlerts) Alert.alert(title, message);
  }

  const dashboard = useMemo(() => {
    const budget = Number(selectedProject?.budget || 0);
    const bought=orders.filter(o=>o.projectId===selectedProject?.id && o.purchased_at && o.status!=='CANCELLED');
    const realized=bought.reduce((sum,o)=>sum+Number(o.total),0)+extraExpenses.filter(e=>e.projectId===selectedProject?.id).reduce((sum,e)=>sum+Number(e.amount),0);
    return { ...DASHBOARD, budget, realized, deviation:budget>0?(realized-budget)/budget*100:0, progress: Number(selectedProject?.progress || 0), pendingRequests: requests.filter(item=>item.projectId===selectedProject?.id && item.status==='PENDING').length };
  }, [selectedProject, requests, orders, extraExpenses]);

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
    chooseProject: setSelectedProject,
    costInputs,
    costInputsError,
    refreshCostInputs,
    createCostInput,
    createProject,
    dashboard,
    refreshCurrentProject,
    isRefreshing,
    budgetDocuments,
    addBudgetDocument,
    setBudgetBaseline,
    removeBudgetDocument,
    quotes,
    addQuote,
    awardQuote,
    removeQuote,
    requests: requests.filter(item => item.projectId === selectedProject?.id),
    pendingRequests,
    pendingReceipts,isSyncingReceipts,receiptCacheDate,syncPendingReceipts,discardPendingReceipt,
    submitMaterialRequest,
    syncPendingRequests, discardPendingRequest,
    isSyncing,
    isOffline,
    setIsOffline,
    orders: orders.filter(item => item.projectId === selectedProject?.id),
    createOrder,
    decideOrder, confirmPurchase,
    refreshOperations,
    receipts: receipts.filter(item => item.projectId === selectedProject?.id),
    createReceipt,
    stock: stock.filter(item => item.projectId === selectedProject?.id),
    createStockMovement,
    extraExpenses: extraExpenses.filter(item=>item.projectId===selectedProject?.id),
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
    budgetDocuments, quotes, requests, pendingRequests, pendingReceipts, isSyncingReceipts, receiptCacheDate, isSyncing, isOffline, orders, receipts, stock,
    extraExpenses, companies, members, accessibilitySettings, costInputs, costInputsError,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
}
