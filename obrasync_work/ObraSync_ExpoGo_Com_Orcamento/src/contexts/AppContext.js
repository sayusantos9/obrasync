import { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { projects } from '../data/mockData';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { usePersistentState } from '../hooks/usePersistentState';
import { TABS } from '../navigation/routes';
import { api } from '../services/api';
import { createExpense } from '../utils/expenses';

const STORAGE_KEYS = {
  pendingRequests: '@obrasync:pending-requests',
  selectedProject: '@obrasync:selected-project',
  extraExpenses: '@obrasync:extra-expenses',
};

const AppContext = createContext(null);

function resolveStoredProject(storedProject = {}) {
  return projects.find((project) => project.id === storedProject.id) ?? projects[0];
}

function attachProjectContext(payload, project) {
  return {
    ...payload,
    projectId: project.id,
    projectName: project.name,
  };
}

export function AppProvider({ children }) {
  const navigation = useAppNavigation();
  const [selectedProject, setSelectedProject] = usePersistentState(
    STORAGE_KEYS.selectedProject,
    projects[0],
    resolveStoredProject,
  );
  const [pendingRequests, setPendingRequests] = usePersistentState(
    STORAGE_KEYS.pendingRequests,
    [],
  );
  const [extraExpenses, setExtraExpenses] = usePersistentState(
    STORAGE_KEYS.extraExpenses,
    [],
  );
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  async function selectProject(project) {
    await setSelectedProject(project);
    navigation.selectTab(TABS.HOME);
  }

  async function submitRequest(requestData) {
    const requestPayload = attachProjectContext(requestData, selectedProject);

    if (!isOffline) {
      return api.submitMaterialRequest(requestPayload);
    }

    const pendingRequest = {
      id: `LOCAL-${Date.now()}`,
      ...requestPayload,
      status: 'Aguardando sincronização',
    };

    await setPendingRequests((currentRequests) => [...currentRequests, pendingRequest]);
    return pendingRequest;
  }

  async function addExpense(expenseData) {
    const expense = createExpense(expenseData, selectedProject);
    await setExtraExpenses((currentExpenses) => [expense, ...currentExpenses]);
    return expense;
  }

  async function syncPendingRequests() {
    if (isOffline) {
      Alert.alert('Sem conexão', 'Desative o modo offline para sincronizar os registros.');
      return;
    }

    if (!pendingRequests.length) {
      Alert.alert('Tudo certo', 'Não há registros pendentes.');
      return;
    }

    setIsSyncing(true);

    try {
      const { synced } = await api.syncPendingRecords(pendingRequests);
      await setPendingRequests([]);
      Alert.alert('Sincronização concluída', `${synced} registro(s) enviado(s).`);
    } finally {
      setIsSyncing(false);
    }
  }

  const contextValue = {
    ...navigation,
    selectedProject,
    selectProject,
    isOffline,
    setIsOffline,
    pendingRequests,
    submitRequest,
    sync: syncPendingRequests,
    isSyncing,
    extraExpenses,
    addExpense,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }

  return context;
}
