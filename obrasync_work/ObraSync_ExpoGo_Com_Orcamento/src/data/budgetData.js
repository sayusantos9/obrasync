const PROJECT_BUDGETS = {
  '1': {
    total: 1_200_000,
    realized: 684_250,
    version: 'v3 • 15 set 2026',
    services: [
      { code: '01', name: 'Fundação e estrutura', planned: 388_000, realized: 251_400, compositions: 18, icon: 'construct-outline', backgroundColor: '#FFF4D6', color: '#9B6B08' },
      { code: '02', name: 'Alvenaria e revestimentos', planned: 276_000, realized: 172_600, compositions: 24, icon: 'layers-outline', backgroundColor: '#EDE6F1', color: '#5A1B73' },
      { code: '03', name: 'Instalações elétricas e hidráulicas', planned: 224_000, realized: 128_950, compositions: 31, icon: 'flash-outline', backgroundColor: '#E5F5EF', color: '#2F9E7A' },
      { code: '04', name: 'Esquadrias e acabamentos', planned: 196_000, realized: 91_800, compositions: 22, icon: 'home-outline', backgroundColor: '#FBE9E7', color: '#B5473E' },
      { code: '05', name: 'Administração e apoio', planned: 116_000, realized: 39_500, compositions: 9, icon: 'briefcase-outline', backgroundColor: '#F3EAF6', color: '#7B3F91' },
    ],
  },
  '2': {
    total: 2_450_000,
    realized: 759_500,
    version: 'v2 • 12 set 2026',
    services: [
      { code: '01', name: 'Terraplenagem e fundações', planned: 720_000, realized: 248_400, compositions: 20, icon: 'construct-outline', backgroundColor: '#FFF4D6', color: '#9B6B08' },
      { code: '02', name: 'Estrutura metálica', planned: 840_000, realized: 286_700, compositions: 17, icon: 'grid-outline', backgroundColor: '#EDE6F1', color: '#5A1B73' },
      { code: '03', name: 'Piso industrial e cobertura', planned: 510_000, realized: 154_900, compositions: 14, icon: 'layers-outline', backgroundColor: '#E5F5EF', color: '#2F9E7A' },
      { code: '04', name: 'Instalações e apoio', planned: 380_000, realized: 69_500, compositions: 25, icon: 'flash-outline', backgroundColor: '#FBE9E7', color: '#B5473E' },
    ],
  },
  '3': {
    total: 1_860_000,
    realized: 223_200,
    version: 'v1 • 05 set 2026',
    services: [
      { code: '01', name: 'Serviços preliminares', planned: 205_000, realized: 84_200, compositions: 12, icon: 'clipboard-outline', backgroundColor: '#FFF4D6', color: '#9B6B08' },
      { code: '02', name: 'Fundação', planned: 465_000, realized: 139_000, compositions: 16, icon: 'construct-outline', backgroundColor: '#EDE6F1', color: '#5A1B73' },
      { code: '03', name: 'Estrutura', planned: 610_000, realized: 0, compositions: 21, icon: 'grid-outline', backgroundColor: '#E5F5EF', color: '#2F9E7A' },
      { code: '04', name: 'Vedações e acabamentos', planned: 580_000, realized: 0, compositions: 33, icon: 'home-outline', backgroundColor: '#FBE9E7', color: '#B5473E' },
    ],
  },
};

const FALLBACK_BUDGET = PROJECT_BUDGETS['1'];

export function getProjectBudget(projectId) {
  return PROJECT_BUDGETS[projectId] ?? FALLBACK_BUDGET;
}
