import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dashboard = await api.fetchDashboard();
      setData(dashboard);
    } catch {
      setError('Não foi possível carregar o resumo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    error,
    isLoading,
    reload: loadDashboard,
  };
}
