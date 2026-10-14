import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components/native';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { createTheme } from './src/theme';

function AppShell() {
  const { accessibilitySettings } = useApp();
  const theme = createTheme(accessibilitySettings);

  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="dark" />
      <AppNavigator />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
// Participação: Jennyfer Karolyne — ObraSync