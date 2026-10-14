import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { SCREENS, TABS } from '../navigation/routes';

const ACTIONS = [
  { id: 'companies', title: 'Empresas', subtitle: 'Cadastros e dados empresariais', icon: 'business-outline', route: SCREENS.COMPANIES },
  { id: 'members', title: 'Funcionários', subtitle: 'Usuários e perfis de acesso', icon: 'people-outline', route: SCREENS.CREATE_MEMBER },
  { id: 'projects', title: 'Obras', subtitle: 'Projetos vinculados à empresa', icon: 'construct-outline', tab: TABS.PROJECTS },
  { id: 'permissions', title: 'Permissões', subtitle: 'Entenda o acesso de cada perfil', icon: 'shield-checkmark-outline', route: SCREENS.COMPANY_PERMISSIONS },
  { id: 'reports', title: 'Relatórios', subtitle: 'Visão consolidada da operação', icon: 'bar-chart-outline', route: SCREENS.REPORTS },
  { id: 'settings', title: 'Configurações', subtitle: 'Acessibilidade, ajuda e conexão', icon: 'settings-outline', route: SCREENS.SETTINGS },
];

export function MasterPanelScreen() {
  const theme = useTheme();
  const { companies, members, logout, openScreen, projects, selectTab } = useApp();

  function navigate(action) {
    if (action.tab) selectTab(action.tab);
    else openScreen(action.route);
  }

  return (
    <Screen>
      <ScreenHeader title="Painel Master" backLabel="Voltar ao login" onBack={logout} />
      <Scroll>
        <Content>
          <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}> 
            <Text style={styles.heroEyebrow}>ADMINISTRAÇÃO</Text>
            <Text style={styles.heroTitle}>Gestão central do ObraSync</Text>
            <Text style={styles.heroText}>Cadastre empresas, funcionários, obras e controle os perfis de acesso.</Text>
          </View>

          <View style={styles.statsRow}>
            <Stat value={companies.length} label="Empresas" theme={theme} />
            <Stat value={members.length} label="Usuários" theme={theme} />
            <Stat value={projects.length} label="Obras" theme={theme} />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Administração</Text>
          <View style={styles.grid}>
            {ACTIONS.map((action) => (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`${action.title}. ${action.subtitle}`}
                key={action.id}
                onPress={() => navigate(action)}
                style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              >
                <View style={[styles.iconBox, { backgroundColor: theme.colors.accentSoft }]}> 
                  <Ionicons name={action.icon} size={24} color={theme.colors.accent} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{action.title}</Text>
                <Text style={[styles.cardText, { color: theme.colors.textMuted }]}>{action.subtitle}</Text>
                <Ionicons name="arrow-forward" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </Content>
      </Scroll>
    </Screen>
  );
}

function Stat({ value, label, theme }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
      <Text style={[styles.statValue, { color: theme.colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 22, marginTop: 18, padding: 20 },
  heroEyebrow: { color: 'rgba(255,255,255,.66)', fontSize: 10, fontWeight: '900' },
  heroTitle: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', marginTop: 8 },
  heroText: { color: 'rgba(255,255,255,.76)', fontSize: 12, lineHeight: 18, marginTop: 7 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  stat: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flex: 1, padding: 12 },
  statValue: { fontSize: 21, fontWeight: '900' },
  statLabel: { fontSize: 10, marginTop: 3 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 10, marginTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { borderRadius: 18, borderWidth: 1, marginBottom: 10, minHeight: 168, padding: 14, width: '48.5%' },
  iconBox: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  cardTitle: { fontSize: 14, fontWeight: '900', marginTop: 12 },
  cardText: { flex: 1, fontSize: 10, lineHeight: 15, marginBottom: 8, marginTop: 4 },
});
