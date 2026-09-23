import { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { authenticateTestUser } from '../data/authData';
import { projects } from '../data/mockData';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { usePersistentState } from '../hooks/usePersistentState';
import { TABS } from '../navigation/routes';
import { api } from '../services/api';
import { createBudgetItem } from '../utils/budgetItems';
import { createExpense } from '../utils/expenses';

const AppContext = createContext(null);

function restoreProject(storedProject = {}) {
  return projects.find((project) => project.id === storedProject.id) ?? projects[0];
}

function addProjectContext(payload, project) {
  return {
    ...payload,
    projectId: project.id,
    projectName: project.name,
  };
}

function sumDocumentItems(items = []) {
  return items.reduce((total, item) => total + Number(item.total || 0), 0);
}

function normalizeDocument(payload, project, prefix, sequence) {
  return {
    id: `${prefix}-${Date.now()}`,
    number: `${prefix}-${String(sequence).padStart(3, '0')}`,
    ...payload,
    projectId: project.id,
    projectName: project.name,
    total: sumDocumentItems(payload.items),
    createdAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }) {
  const navigation = useAppNavigation();
  const [currentUser, setCurrentUser, isAuthReady] = usePersistentState(
    STORAGE_KEYS.CURRENT_USER,
    null,
  );
  const [selectedProject, setSelectedProject] = usePersistentState(
    STORAGE_KEYS.SELECTED_PROJECT,
    projects[0],
    restoreProject,
  );
  const [pendingRequests, setPendingRequests] = usePersistentState(
    STORAGE_KEYS.PENDING_REQUESTS,
    [],
  );
  const [extraExpenses, setExtraExpenses] = usePersistentState(
    STORAGE_KEYS.EXTRA_EXPENSES,
    [],
  );
  const [budgetItems, setBudgetItems] = usePersistentState(
    STORAGE_KEYS.BUDGET_ITEMS,
    [],
  );
  const [budgetDocuments, setBudgetDocuments] = usePersistentState(
    STORAGE_KEYS.BUDGET_DOCUMENTS,
    [],
  );
  const [quotes, setQuotes] = usePersistentState(STORAGE_KEYS.QUOTES, []);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  async function login(credentials) {
    const user = authenticateTestUser(credentials.email, credentials.password);
    if (!user) return null;
    await setCurrentUser(user);
    navigation.resetNavigation();
    return user;
  }

  async function logout() {
    await setCurrentUser(null);
    navigation.resetNavigation();
  }

  async function selectProject(project) {
    await setSelectedProject(project);
    navigation.selectTab(TABS.HOME);
  }

  async function submitMaterialRequest(requestData) {
    const requestWithProject = addProjectContext(requestData, selectedProject);

    if (!isOffline) {
      return api.submitMaterialRequest(requestWithProject);
    }

    const pendingRequest = {
      id: `LOCAL-${Date.now()}`,
      ...requestWithProject,
      status: 'Aguardando sincronização',
    };

    await setPendingRequests((currentRequests) => [
      ...currentRequests,
      pendingRequest,
    ]);
    return pendingRequest;
  }

  async function addExpense(expenseData) {
    const newExpense = createExpense(expenseData, selectedProject);
    await setExtraExpenses((currentExpenses) => [newExpense, ...currentExpenses]);
    return newExpense;
  }

  async function addBudgetItem(itemData) {
    const newBudgetItem = createBudgetItem(itemData, selectedProject);
    await setBudgetItems((currentItems) => [newBudgetItem, ...currentItems]);
    return newBudgetItem;
  }

  async function removeBudgetItem(itemId) {
    await setBudgetItems((currentItems) => (
      currentItems.filter((budgetItem) => budgetItem.id !== itemId)
    ));
  }

  async function addBudgetDocument(documentData) {
    const newBudget = normalizeDocument(
      documentData,
      selectedProject,
      'ORC',
      budgetDocuments.length + 1,
    );
    await setBudgetDocuments((current) => [newBudget, ...current]);
    return newBudget;
  }

  async function removeBudgetDocument(documentId) {
    await setBudgetDocuments((current) => current.filter((document) => document.id !== documentId));
  }

  async function addQuote(quoteData) {
    const newQuote = normalizeDocument(
      quoteData,
      selectedProject,
      'COT',
      quotes.length + 1,
    );
    await setQuotes((current) => [newQuote, ...current]);
    return newQuote;
  }

  async function removeQuote(quoteId) {
    await setQuotes((current) => current.filter((quote) => quote.id !== quoteId));
  }

  async function syncPendingRequests() {
    if (isOffline) {
      Alert.alert(
        'Sem conexão',
        'Desative o modo offline para sincronizar os registros.',
      );
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
    currentUser,
    isAuthReady,
    login,
    logout,
    selectedProject,
    selectProject,
    isOffline,
    setIsOffline,
    pendingRequests,
    submitMaterialRequest,
    syncPendingRequests,
    isSyncing,
    extraExpenses,
    addExpense,
    budgetItems,
    addBudgetItem,
    removeBudgetItem,
    budgetDocuments,
    addBudgetDocument,
    removeBudgetDocument,
    quotes,
    addQuote,
    removeQuote,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }

  return context;
}
