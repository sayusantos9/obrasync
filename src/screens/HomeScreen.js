import { ActivityIndicator, ScrollView } from 'react-native';
import { QuickAction } from '../components/common/QuickAction';
import { HomeAlertCard, HomeHero, HomeMetricCard, SyncStatusCard } from '../components/home';
import { AppHeader } from '../components/layout/AppHeader';
import { SearchBar } from '../components/common/SearchBar';
import { Content, LinkText, Screen, Scroll, SectionHeader, SectionTitle } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { createHomeAlerts, createHomeMetrics, getHomeQuickActions } from '../data/homeData';
import { TABS } from '../navigation/routes';
import { ErrorCard, ErrorText, LoadingArea, MetricsList, QuickActionsGrid } from './HomeScreen.styles';

export function HomeScreen() {
  const {
    currentUser,
    dashboard,
    isOffline,
    isRefreshing,
    isSyncing,
    openScreen,
    pendingRequests,
    projects,
    refreshCurrentProject,
    selectProject,
    selectTab,
    syncPendingRequests,
  } = useApp();

  const metrics = createHomeMetrics(dashboard || {});
  const alerts = createHomeAlerts(dashboard || {});
  const actions = getHomeQuickActions(currentUser?.role);

  function navigate(action) {
    if (action.destinationType === 'tab') selectTab(action.destination);
    else openScreen(action.destination);
  }

  return (
    <Screen>
      <Scroll>
        <AppHeader />
        <Content>
          <SearchBar placeholder="O que você precisa?" />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: 18 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {projects.map((project) => (
              <HomeHero
                key={project.id}
                project={project}
                onOpenDetails={async () => {
                  await selectProject(project);
                  selectTab(TABS.PROJECTS);
                }}
              />
            ))}
          </ScrollView>

          <SectionHeader><SectionTitle>Ações rápidas</SectionTitle></SectionHeader>
          <QuickActionsGrid>
            {actions.map((action) => <QuickAction key={action.id} {...action} onPress={() => navigate(action)} />)}
          </QuickActionsGrid>

          <SectionHeader><SectionTitle>Resumo da obra</SectionTitle><LinkText onPress={() => selectTab(TABS.PROJECTS)}>Ver mais</LinkText></SectionHeader>
          {isRefreshing && !dashboard ? <LoadingArea><ActivityIndicator color="#0B2A5B" /></LoadingArea> : null}
          {!dashboard && !isRefreshing ? <ErrorCard onPress={refreshCurrentProject}><ErrorText>Não foi possível carregar o resumo. Toque para tentar novamente.</ErrorText></ErrorCard> : null}
          {!!dashboard && <MetricsList>{metrics.map((metric) => <HomeMetricCard key={metric.id} metric={metric} onPress={() => navigate(metric)} />)}</MetricsList>}

          <SectionHeader><SectionTitle>Atenção hoje</SectionTitle><LinkText onPress={() => openScreen('alerts')}>Ver todas</LinkText></SectionHeader>
          {alerts.map((alert) => <HomeAlertCard key={alert.id} alert={alert} onPress={() => openScreen(alert.destination)} />)}

          <SyncStatusCard isOffline={isOffline} isSyncing={isSyncing} pendingCount={pendingRequests.length} onPress={syncPendingRequests} />
        </Content>
      </Scroll>
    </Screen>
  );
}
