import { ActivityIndicator, KeyboardAvoidingView, Text, TouchableOpacity, View } from 'react-native';
import { canAccessRoute, requiresProject } from '../utils/permissions';
import { useTheme } from 'styled-components/native';
import { BottomTabs } from '../components/layout/BottomTabs';
import { PlanengenHeader } from '../components/layout/PlanengenHeader';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { EngineeringHomeScreen, LoginScreen, MasterPanelScreen } from '../screens';
import { ClientHomeScreen } from '../screens/ClientHomeScreen';
import { RequesterHomeScreen } from '../screens/RequesterHomeScreen';
import { SCREENS, TABS } from './routes';
import { resolveScreenComponent, shouldShowBottomTabs } from './screenRegistry';

export function AppNavigator() {
  const { currentUser, currentScreen, activeTab, isAuthReady } = useApp();
  const requesterHome = isAuthReady && currentUser?.role === USER_ROLES.REQUESTER
    && currentScreen === SCREENS.TABS && activeTab === TABS.HOME;
  const masterHome = isAuthReady && currentUser?.role === USER_ROLES.MASTER
    && (currentScreen === SCREENS.MASTER_PANEL || (currentScreen === SCREENS.TABS && activeTab === TABS.HOME));
  const clientHome = isAuthReady && currentUser?.role === USER_ROLES.CLIENT && currentScreen === SCREENS.TABS && activeTab === TABS.HOME;
  const engineeringHome = isAuthReady && currentUser?.role === USER_ROLES.ENGINEERING && currentScreen === SCREENS.TABS && activeTab === TABS.HOME;
  const projectsScreen = currentScreen === SCREENS.TABS && activeTab === TABS.PROJECTS;
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: '#010028' }}>
      {!clientHome && !requesterHome && !masterHome && !engineeringHome && !projectsScreen && !(currentScreen === SCREENS.TABS && (activeTab === TABS.MATERIALS || activeTab === TABS.BUDGET || activeTab === TABS.COSTS)) && ![SCREENS.ADD_EXPENSE, SCREENS.CREATE_BUDGET, SCREENS.CREATE_MEMBER, SCREENS.SETTINGS, SCREENS.COMPANIES, SCREENS.ACCESSIBILITY, SCREENS.COMPARISON, SCREENS.AUDIT, SCREENS.MARKET_PRICES, SCREENS.STOCK, SCREENS.RECEIPT, SCREENS.TRANSFERS, SCREENS.LABEL, SCREENS.SCANNER, SCREENS.REPORTS].includes(currentScreen) && !(isAuthReady && !currentUser) && <PlanengenHeader />}
      <NavigatorContent />
    </KeyboardAvoidingView>
  );
}

function NavigatorContent() {
  const theme = useTheme();
  const { activeTab, currentScreen, currentUser, isAuthReady, selectedProject, selectTab } = useApp();

  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 12 }}>Abrindo ObraSync...</Text>
      </View>
    );
  }

  if (!currentUser) return <LoginScreen />;
  const allowed = canAccessRoute(currentUser.role, currentScreen, activeTab);
  const missingProject = requiresProject(currentScreen, activeTab) && !selectedProject?.id;
  if (!allowed || missingProject) return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <Text accessibilityRole="header" style={{ color: theme.colors.text, fontSize: 22 }}>{!allowed ? 'Acesso restrito' : 'Selecione uma obra'}</Text>
      <Text style={{ color: theme.colors.textMuted, marginVertical: 16 }}>{!allowed ? 'Esta operação não está disponível para seu perfil.' : 'Escolha uma obra antes de abrir este módulo.'}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => selectTab(!allowed ? TABS.HOME : TABS.PROJECTS)} style={{ padding: 16, backgroundColor: theme.colors.primary, borderRadius: 12 }}><Text style={{ color: '#FFFFFF' }}>{!allowed ? 'Ir para o início' : 'Escolher obra'}</Text></TouchableOpacity>
    </View>
  );

  const isMasterHome = currentUser.role === USER_ROLES.MASTER
    && currentScreen === SCREENS.TABS
    && activeTab === TABS.HOME;
  const isEngineeringHome = currentUser.role === USER_ROLES.ENGINEERING
    && currentScreen === SCREENS.TABS
    && activeTab === TABS.HOME;

  const ScreenComponent = isMasterHome
    ? MasterPanelScreen
    : isEngineeringHome
      ? EngineeringHomeScreen
      : currentUser.role === USER_ROLES.REQUESTER && currentScreen === SCREENS.TABS && activeTab === TABS.HOME
        ? RequesterHomeScreen
        : currentUser.role === USER_ROLES.CLIENT && currentScreen === SCREENS.TABS && activeTab === TABS.HOME
          ? ClientHomeScreen
          : resolveScreenComponent(currentScreen, activeTab);

  const screenContent = <ScreenComponent type={currentScreen} />;

return (
    <View style={{ flex: 1, backgroundColor: '#010028' }}>
      {screenContent}
      {shouldShowBottomTabs(currentScreen, currentUser.role) && <BottomTabs />}
    </View>
  );
}
