import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { api } from '../services/api';
import { SCREENS, TABS } from '../navigation/routes';

const STORAGE_KEY = '@obrasync:pending-requests';
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [screen, setScreen] = useState(SCREENS.TABS);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const selectTab = useCallback((tab) => {
    setActiveTab(tab);
    setScreen(SCREENS.TABS);
  }, []);

  const openScanner = useCallback(() => {
    setScreen(SCREENS.SCANNER);
  }, []);

  useEffect(() => { AsyncStorage.getItem(STORAGE_KEY).then((value) => value && setPendingRequests(JSON.parse(value))); }, []);

  const persistPending = useCallback(async (items) => {
    setPendingRequests(items);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const submitRequest = useCallback(async (formData) => {
    if (isOffline) {
      const localRequest = { id: `LOCAL-${Date.now()}`, ...formData, status: 'Aguardando sincronização' };
      await persistPending([...pendingRequests, localRequest]);
      return localRequest;
    }
    return api.submitMaterialRequest(formData);
  }, [isOffline, pendingRequests, persistPending]);

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

  const value = useMemo(() => ({ activeTab, selectTab, openScanner, screen, openScreen: setScreen, goBack: () => setScreen(SCREENS.TABS), isOffline, setIsOffline, pendingRequests, submitRequest, sync, isSyncing }), [activeTab, selectTab, openScanner, screen, isOffline, pendingRequests, submitRequest, sync, isSyncing]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider');
  return context;
};
