import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { api } from '../services/api';
import { projects } from '../data/mockData';
import { SCREENS, TABS } from '../navigation/routes';

const STORAGE_PENDING = '@obrasync:pending-requests';
const STORAGE_PROJECT = '@obrasync:selected-project';
const STORAGE_EXPENSES = '@obrasync:extra-expenses';
const AppContext = createContext(null);

const categoryStyle = {
  Materiais: { icon: 'cube', color: '#5A1B73', bg: '#EDE6F1' },
  'Mão de obra': { icon: 'people', color: '#B5473E', bg: '#FBE9E7' },
  Frete: { icon: 'car', color: '#2F9E7A', bg: '#E5F5EF' },
  Equipamentos: { icon: 'construct', color: '#E0A526', bg: '#FFF4D6' },
  Outros: { icon: 'receipt', color: '#7B3F91', bg: '#F3EAF6' },
};

const formatDate = (value) => {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return value || 'Hoje';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace('.', '');
};

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [screen, setScreen] = useState(SCREENS.TABS);
  const [history, setHistory] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [extraExpenses, setExtraExpenses] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const selectTab = useCallback((tab) => {
    setActiveTab(tab);
    setScreen(SCREENS.TABS);
    setHistory([]);
  }, []);

  const openScreen = useCallback((target) => {
    if (!target || target === screen) return;
    setHistory((items) => [...items, screen].slice(-10));
    setScreen(target);
  }, [screen]);

  const goBack = useCallback(() => {
    setHistory((items) => {
      const next = [...items];
      const previous = next.pop() || SCREENS.TABS;
      setScreen(previous);
      return next;
    });
  }, []);

  const openScanner = useCallback(() => openScreen(SCREENS.SCANNER), [openScreen]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_PENDING),
      AsyncStorage.getItem(STORAGE_PROJECT),
      AsyncStorage.getItem(STORAGE_EXPENSES),
    ]).then(([pending, project, expenses]) => {
      if (pending) setPendingRequests(JSON.parse(pending));
      if (project) {
        const parsed = JSON.parse(project);
        const current = projects.find((item) => item.id === parsed.id);
        if (current) setSelectedProject(current);
      }
      if (expenses) setExtraExpenses(JSON.parse(expenses));
    }).catch(() => {});
  }, []);

  const selectProject = useCallback(async (project) => {
    setSelectedProject(project);
    await AsyncStorage.setItem(STORAGE_PROJECT, JSON.stringify(project));
    setActiveTab(TABS.HOME);
    setScreen(SCREENS.TABS);
    setHistory([]);
  }, []);

  const persistPending = useCallback(async (items) => {
    setPendingRequests(items);
    await AsyncStorage.setItem(STORAGE_PENDING, JSON.stringify(items));
  }, []);

  const submitRequest = useCallback(async (formData) => {
    const payload = { ...formData, projectId: selectedProject.id, projectName: selectedProject.name };
    if (isOffline) {
      const localRequest = { id: `LOCAL-${Date.now()}`, ...payload, status: 'Aguardando sincronização' };
      await persistPending([...pendingRequests, localRequest]);
      return localRequest;
    }
    return api.submitMaterialRequest(payload);
  }, [isOffline, pendingRequests, persistPending, selectedProject]);

  const addExpense = useCallback(async (formData) => {
    const style = categoryStyle[formData.category] || categoryStyle.Outros;
    const expense = {
      id: `EXP-${Date.now()}`,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      name: formData.name.trim(),
      category: formData.category,
      supplier: formData.supplier?.trim() || '',
      notes: formData.notes?.trim() || '',
      amount: Number(formData.amount),
      date: formatDate(formData.date),
      createdAt: new Date().toISOString(),
      ...style,
    };
    const next = [expense, ...extraExpenses];
    setExtraExpenses(next);
    await AsyncStorage.setItem(STORAGE_EXPENSES, JSON.stringify(next));
    return expense;
  }, [extraExpenses, selectedProject]);

  const sync = useCallback(async () => {
    if (isOffline) return Alert.alert('Sem conexão', 'Desative o modo offline para sincronizar os registros.');
    if (!pendingRequests.length) return Alert.alert('Tudo certo', 'Não há registros pendentes.');
    setIsSyncing(true);
    try {
      const result = await api.syncPendingRecords(pendingRequests);
      await persistPending([]);
      Alert.alert('Sincronização concluída', `${result.synced} registro(s) enviado(s).`);
    } finally { setIsSyncing(false); }
  }, [isOffline, pendingRequests, persistPending]);

  const value = useMemo(() => ({
    activeTab, selectTab, screen, openScreen, openScanner, goBack,
    selectedProject, selectProject,
    isOffline, setIsOffline, pendingRequests, submitRequest, sync, isSyncing,
    extraExpenses, addExpense,
  }), [activeTab, selectTab, screen, openScreen, openScanner, goBack, selectedProject, selectProject, isOffline, pendingRequests, submitRequest, sync, isSyncing, extraExpenses, addExpense]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
};
