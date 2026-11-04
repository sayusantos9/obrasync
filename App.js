import { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components/native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { createTheme } from './src/theme';
import { USER_ROLES } from './src/data/authData';

function AppShell() {
  const { accessibilitySettings, currentUser } = useApp();
  const purchasing = currentUser?.role === USER_ROLES.PURCHASING;
  const theme = useMemo(() => createTheme(accessibilitySettings, purchasing), [accessibilitySettings, purchasing]);

  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="light" />
      <AppNavigator />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
// Participação: Jennyfer Karolyne — ObraSync
