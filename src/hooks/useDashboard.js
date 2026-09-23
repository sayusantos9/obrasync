import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setData(await api.fetchDashboard()); }
    catch { setError('Não foi possível carregar o resumo.'); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { data, isLoading, error, reload: load };
}
