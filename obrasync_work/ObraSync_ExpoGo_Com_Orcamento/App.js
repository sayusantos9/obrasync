import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components/native';
import { AppProvider } from './src/contexts/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AppProvider>
    </ThemeProvider>
  );
}
