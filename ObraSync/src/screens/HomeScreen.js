import { ActivityIndicator } from 'react-native';
import { QuickAction } from '../components/common/QuickAction';
import {
  HomeAlertCard,
  HomeHero,
  HomeMetricCard,
  SyncStatusCard,
} from '../components/home';
import { AppHeader } from '../components/layout/AppHeader';
import { SearchBar } from '../components/common/SearchBar';
import {
  Content,
  LinkText,
  Screen,
  Scroll,
  SectionHeader,
  SectionTitle,
} from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import {
  createHomeMetrics,
  HOME_ALERTS,
  HOME_QUICK_ACTIONS,
} from '../data/homeData';
import { useDashboard } from '../hooks/useDashboard';
import { TABS } from '../navigation/routes';
import {
  ErrorCard,
  ErrorText,
  LoadingArea,
  MetricsList,
  QuickActionsGrid,
} from './HomeScreen.styles';

export function HomeScreen() {
  const {
    isOffline,
    isSyncing,
    openScreen,
    pendingRequests,
    selectedProject,
    selectTab,
    syncPendingRequests,
  } = useApp();
  const { data, error, isLoading, reload } = useDashboard();
  const metrics = createHomeMetrics(data);

  function navigateTo(destinationType, destination) {
    if (destinationType === 'tab') {
      selectTab(destination);
      return;
    }

    openScreen(destination);
  }

  return (
    <Screen>
      <Scroll>
        <AppHeader />
        <Content>
          <SearchBar />

          <HomeHero
            project={selectedProject}
            onOpenDetails={() => selectTab(TABS.COSTS)}
          />

          <SectionHeader>
            <SectionTitle>Ações rápidas</SectionTitle>
          </SectionHeader>
          <QuickActionsGrid>
            {HOME_QUICK_ACTIONS.map((action) => (
              <QuickAction
                key={action.id}
                icon={action.icon}
                label={action.label}
                color={action.color}
                background={action.background}
                onPress={() => navigateTo(action.destinationType, action.destination)}
              />
            ))}
          </QuickActionsGrid>

          <SectionHeader>
            <SectionTitle>Resumo da obra</SectionTitle>
            <LinkText>Ver mais</LinkText>
          </SectionHeader>

          {isLoading && (
            <LoadingArea>
              <ActivityIndicator color="#5A1B73" />
            </LoadingArea>
          )}

          {!isLoading && error && (
            <ErrorCard onPress={reload}>
              <ErrorText>{error} Toque para tentar novamente.</ErrorText>
            </ErrorCard>
          )}

          {!isLoading && !error && (
            <MetricsList>
              {metrics.map((metric) => (
                <HomeMetricCard
                  key={metric.id}
                  metric={metric}
                  onPress={() => navigateTo(metric.destinationType, metric.destination)}
                />
              ))}
            </MetricsList>
          )}

          <SectionHeader>
            <SectionTitle>Atenção hoje</SectionTitle>
            <LinkText>Ver todas</LinkText>
          </SectionHeader>
          {HOME_ALERTS.map((alert) => (
            <HomeAlertCard
              key={alert.id}
              alert={alert}
              onPress={() => openScreen(alert.destination)}
            />
          ))}

          <SyncStatusCard
            isOffline={isOffline}
            isSyncing={isSyncing}
            pendingCount={pendingRequests.length}
            onPress={syncPendingRequests}
          />
        </Content>
      </Scroll>
    </Screen>
  );
}
