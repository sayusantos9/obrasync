import { useApp } from '../contexts/AppContext';

export function useDashboard() {
  const { dashboard, isRefreshing, refreshCurrentProject } = useApp();
  return {
    data: dashboard,
    error: null,
    isLoading: !dashboard && isRefreshing,
    reload: refreshCurrentProject,
  };
}
