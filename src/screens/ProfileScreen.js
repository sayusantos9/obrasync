import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { ROLE_LABELS, USER_ROLES } from '../data/authData';
import { SCREENS } from '../navigation/routes';

export function ProfileScreen() {
  const theme = useTheme();
  const { currentUser, logout, openScreen, pendingRequests } = useApp();

  function confirmLogout() {
    Alert.alert('Voltar para o login', 'Deseja encerrar esta sessão e voltar para a tela inicial?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  const items = [
    currentUser.role === USER_ROLES.MASTER && {
      icon: 'people-outline',
      title: 'Empresas e permissões',
      subtitle: 'Cadastrar empresas, funcionários e perfis',
      color: theme.colors.accent,
      route: SCREENS.MASTER_PANEL,
    },
    {
      icon: 'settings-outline',
      title: 'Configurações',
      subtitle: 'Demonstração, acessibilidade e preferências',
      color: theme.colors.primary,
      route: SCREENS.SETTINGS,
    },
    {
      icon: 'accessibility-outline',
      title: 'Acessibilidade',
      subtitle: 'Recursos para cegueira, baixa visão e surdez',
      color: theme.colors.success,
      route: SCREENS.ACCESSIBILITY,
    },
    {
      icon: 'book-outline',
      title: 'Cartilha de uso',
      subtitle: 'Manual das principais rotinas do app',
      color: theme.colors.info,
      route: SCREENS.GUIDE,
    },
    {
      icon: 'notifications-outline',
      title: 'Alertas',
      subtitle: `${pendingRequests.length} registro(s) local(is) pendente(s)`,
      color: theme.colors.warning,
      route: SCREENS.ALERTS,
    },
    [USER_ROLES.MASTER, USER_ROLES.PURCHASING].includes(currentUser.role) && {
      icon: 'swap-horizontal-outline',
      title: 'Transferências',
      subtitle: 'Registrar saídas e transferências de materiais',
      color: theme.colors.accent,
      route: SCREENS.TRANSFERS,
    },
    {
      icon: 'bar-chart-outline',
      title: 'Relatórios',
      subtitle: 'Resumo de estoque, compras, custos e documentos',
      color: theme.colors.primary,
      route: SCREENS.REPORTS,
    },
  ].filter(Boolean);

  return (
    <Screen>
      <Scroll>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}> 
          <View style={styles.brandRow}>
            <View style={styles.logo}><Ionicons name="business" size={23} color="#FFFFFF" /></View>
            <Text style={styles.brand}>Obra<Text style={{ color: theme.colors.accent }}>Sync</Text></Text>
          </View>
          <View style={styles.avatar}><Ionicons name="person" size={42} color={theme.colors.primary} /></View>
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.role}>{ROLE_LABELS[currentUser.role]} • {currentUser.companyName}</Text>
          <Text style={styles.email}>{currentUser.email}</Text>
        </View>

        <Content>
          {items.map((item) => (
            <MenuItem key={item.title} {...item} onPress={() => openScreen(item.route)} />
          ))}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar para a tela de login"
            onPress={confirmLogout}
            style={[styles.logout, { borderColor: theme.colors.danger }]}
          >
            <Ionicons name="log-out-outline" size={21} color={theme.colors.danger} />
            <Text style={[styles.logoutText, { color: theme.colors.danger }]}>Voltar para o login</Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}

function MenuItem({ color, icon, onPress, subtitle, title }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle || ''}`}
      onPress={onPress}
      style={[styles.item, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <View style={[styles.itemIcon, { backgroundColor: `${color}18` }]}> 
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{title}</Text>
        {!!subtitle && <Text style={[styles.itemSubtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingBottom: 28, paddingHorizontal: 20, paddingTop: 48 },
  brandRow: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row' },
  logo: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,.13)', borderRadius: 11, height: 42, justifyContent: 'center', width: 42 },
  brand: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginLeft: 10 },
  avatar: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 42, height: 84, justifyContent: 'center', marginTop: 24, width: 84 },
  name: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginTop: 12 },
  role: { color: 'rgba(255,255,255,.78)', fontSize: 12, marginTop: 5, textAlign: 'center' },
  email: { color: 'rgba(255,255,255,.6)', fontSize: 11, marginTop: 4 },
  item: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', marginTop: 11, padding: 14 },
  itemIcon: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  itemInfo: { flex: 1, marginHorizontal: 11 },
  itemTitle: { fontSize: 14, fontWeight: '900' },
  itemSubtitle: { fontSize: 10, lineHeight: 16, marginTop: 3 },
  logout: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', marginBottom: 26, marginTop: 18, minHeight: 52 },
  logoutText: { fontSize: 14, fontWeight: '900', marginLeft: 7 },
});
