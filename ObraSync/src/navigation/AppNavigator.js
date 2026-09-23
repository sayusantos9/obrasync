import { ActivityIndicator, View } from 'react-native';
import { BottomTabs } from '../components/layout/BottomTabs';
import { useApp } from '../contexts/AppContext';
import { LoginScreen } from '../screens';
import { theme } from '../theme';
import { resolveScreenComponent, shouldShowBottomTabs } from './screenRegistry';

export function AppNavigator() {
  const { activeTab, currentScreen, currentUser, isAuthReady } = useApp();

  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  const ScreenComponent = resolveScreenComponent(currentScreen, activeTab);
  const screenContent = <ScreenComponent type={currentScreen} />;

  if (!shouldShowBottomTabs(currentScreen)) {
    return screenContent;
  }

  return (
    <View style={{ flex: 1 }}>
      {screenContent}
      <BottomTabs />
    </View>
  );
}
