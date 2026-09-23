import { Ionicons } from '@expo/vector-icons';
import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { ProfileMenuItem } from '../components/profile/ProfileMenuItem';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { ROLE_LABELS } from '../data/authData';
import { SCREENS } from '../navigation/routes';
import { theme } from '../theme';
import { profileStyles as styles } from './ProfileScreen.styles';

const STATIC_MENU_ITEMS = [
  {
    icon: 'shield-checkmark-outline',
    iconColor: '#B5473E',
    label: 'Privacidade e segurança',
  },
  {
    icon: 'help-circle-outline',
    iconColor: '#7B3F91',
    label: 'Ajuda e manual',
  },
];

export function ProfileScreen() {
  const {
    currentUser,
    isOffline,
    isSyncing,
    logout,
    openScreen,
    pendingRequests,
    setIsOffline,
    syncPendingRequests,
  } = useApp();

  const syncLabel = isSyncing
    ? 'Sincronizando...'
    : `Sincronizar (${pendingRequests.length})`;

  const offlineSwitch = (
    <View style={styles.toggleShell}>
      <Switch
        value={isOffline}
        onValueChange={setIsOffline}
        thumbColor="#FFFFFF"
        trackColor={{ false: '#D7DFEA', true: theme.colors.primary }}
      />
    </View>
  );

  function confirmLogout() {
    Alert.alert('Sair do ObraSync', 'Deseja encerrar esta sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <Screen>
      <Scroll>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={38} color={theme.colors.primary} />
          </View>
          <Text style={styles.name}>{currentUser?.name}</Text>
          <Text style={styles.role}>
            {ROLE_LABELS[currentUser?.role] || currentUser?.role} • {currentUser?.companyName}
          </Text>
          <Text style={styles.email}>{currentUser?.email}</Text>
        </View>

        <Content>
          <ProfileMenuItem
            icon="business-outline"
            iconColor={theme.colors.primary}
            label="Empresas e permissões"
            onPress={() => openScreen(SCREENS.COMPANY_PERMISSIONS)}
          />

          <ProfileMenuItem
            icon="cloud-offline-outline"
            iconColor={theme.colors.warning}
            label="Modo offline"
            right={offlineSwitch}
          />

          <ProfileMenuItem
            disabled={isSyncing}
            icon="sync"
            iconColor={theme.colors.success}
            label={syncLabel}
            onPress={syncPendingRequests}
          />

          {STATIC_MENU_ITEMS.map((menuItem) => (
            <ProfileMenuItem key={menuItem.label} {...menuItem} />
          ))}

          <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={21} color={theme.colors.danger} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            O modo offline salva solicitações no aparelho. Ao recuperar a conexão,
            use “Sincronizar” para enviar os registros.
          </Text>
        </Content>
      </Scroll>
    </Screen>
  );
}
