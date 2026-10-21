import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { BottomTabs } from '../components/layout/BottomTabs';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { EngineeringHomeScreen, LoginScreen, MasterPanelScreen } from '../screens';
import { SCREENS, TABS } from './routes';
import { resolveScreenComponent, shouldShowBottomTabs } from './screenRegistry';

export function AppNavigator() {
  const theme = useTheme();
  const { activeTab, currentScreen, currentUser, isAuthReady } = useApp();

  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 12 }}>Abrindo ObraSync...</Text>
      </View>
    );
  }

  if (!currentUser) return <LoginScreen />;

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
      : resolveScreenComponent(currentScreen, activeTab);

  const screenContent = <ScreenComponent type={currentScreen} />;

  if (!shouldShowBottomTabs(currentScreen, currentUser.role)) return screenContent;

  return (
    <View style={{ flex: 1 }}>
      {screenContent}
      <BottomTabs />
    </View>
  );
}
