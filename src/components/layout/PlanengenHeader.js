import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { SCREENS } from '../../navigation/routes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

const LOGO = require('../../assets/logo cinza claro.png');

// A separate row keeps the brand clear of each screen's navigation controls.
export function PlanengenHeader() {
  const theme = useTheme();
  const { logout, openScreen } = useApp();

  function confirmLogout() {
    Alert.alert('Sair da conta', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={[styles.content, theme.purchasing && styles.purchasingContent]}>
        <Image
          accessible
          accessibilityLabel="Logo da Planengen"
          resizeMode="contain"
          source={LOGO}
          style={[styles.logo, theme.purchasing && styles.purchasingLogo]}
        />
        {theme.purchasing && <View style={styles.actions}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={confirmLogout} style={styles.logout}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Configurações" onPress={() => openScreen(SCREENS.SETTINGS)} style={[styles.settings, { backgroundColor: theme.colors.accent }]}>
            <Ionicons name="settings" size={27} color="#FFFFFF" />
          </TouchableOpacity>
        </View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexShrink: 0 },
  content: { height: 56, justifyContent: 'center', paddingHorizontal: 20 },
  logo: { alignSelf: 'flex-start', width: 120, height: 34.5, maxWidth: '100%' },
  purchasingContent: { height: 84, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  purchasingLogo: { alignSelf: 'center', width: 164, height: 48, flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 10 },
  logout: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  settings: { width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: '#10447C', alignItems: 'center', justifyContent: 'center' },
});
