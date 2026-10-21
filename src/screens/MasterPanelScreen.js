import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { SCREENS, TABS } from '../navigation/routes';

const ACTIONS = [
  {
    id: 'materials',
    title: 'Insumos',
    subtitle: 'Catálogo e preços de referência',
    icon: 'cube-outline',
    tab: TABS.MATERIALS,
    color: 'blue',
  },
  {
    id: 'companies',
    title: 'Empresas',
    subtitle: 'Cadastros e dados empresariais',
    icon: 'business-outline',
    route: SCREENS.COMPANIES,
    color: 'orange',
  },
  {
    id: 'members',
    title: 'Funcionários',
    subtitle: 'Usuários e perfis de acesso',
    icon: 'people-outline',
    route: SCREENS.CREATE_MEMBER,
    color: 'blue',
  },
  {
    id: 'projects',
    title: 'Obras',
    subtitle: 'Projetos vinculados à empresa',
    icon: 'construct-outline',
    tab: TABS.PROJECTS,
    color: 'orange',
  },
  {
    id: 'permissions',
    title: 'Permissões',
    subtitle: 'Entenda o acesso de cada perfil',
    icon: 'shield-checkmark-outline',
    route: SCREENS.COMPANY_PERMISSIONS,
    badge: 'Perfis',
    color: 'blue',
  },
  {
    id: 'reports',
    title: 'Relatórios',
    subtitle: 'Visão consolidada da operação',
    icon: 'bar-chart-outline',
    route: SCREENS.REPORTS,
    badge: 'BI',
    color: 'orange',
  },
  {
    id: 'settings',
    title: 'Configurações',
    subtitle: 'Acessibilidade, ajuda e conexão',
    icon: 'settings-outline',
    route: SCREENS.SETTINGS,
    badge: 'Ajustes',
    color: 'slate',
  },
];

const TERMINAL_PROJECT_STATUSES = new Set(['COMPLETED', 'COMPLETE', 'CANCELLED', 'CANCELED', 'ARCHIVED']);

export function MasterPanelScreen() {
  const theme = useTheme();
  const scrollRef = useRef(null);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const { companies, members, logout, openScreen, projects, selectTab } = useApp();

  const activeCompanies = companies.filter((company) => company.active !== false).length;
  const activeMembers = members.filter((member) => member.active !== false).length;
  const activeProjects = projects.filter((project) => !TERMINAL_PROJECT_STATUSES.has(String(project.status || '').toUpperCase())).length;
  const actions = ACTIONS.map((action) => ({
    ...action,
    badge: action.id === 'companies'
      ? `${activeCompanies} ${activeCompanies === 1 ? 'ativa' : 'ativas'}`
      : action.id === 'members'
        ? `${activeMembers} ${activeMembers === 1 ? 'ativo' : 'ativos'}`
        : action.id === 'projects'
          ? `${activeProjects} ${activeProjects === 1 ? 'ativa' : 'ativas'}`
          : action.badge,
  }));

  function navigate(action) {
    if (action.tab) selectTab(action.tab);
    else openScreen(action.route);
  }

  function handleScroll({ nativeEvent }) {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 8;
    setShowScrollTopButton(isAtBottom);
  }

  function scrollToTop() {
    setShowScrollTopButton(false);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  return (
    <Screen>
      <ScreenHeader
        title="Painel Master"
        backLabel="Sair da conta"
        onBack={logout}
      />
      <Scroll ref={scrollRef} onScroll={handleScroll} scrollEventThrottle={16}>
        <Content>
          <View style={styles.hero}>
            <View style={styles.blueprintCircleLarge} />
            <View style={styles.blueprintCircleMedium} />
            <View style={styles.blueprintCircleSmall} />
            <View style={styles.heroGlow} />
            <View style={styles.heroContent}>
              <View style={styles.eyebrow}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrowText}>ADMINISTRAÇÃO</Text>
              </View>
              <Text style={styles.heroTitle}>Gestão central do ObraSync</Text>
              <Text style={styles.heroText}>Cadastre empresas, funcionários, obras e controle os perfis de acesso.</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat
              value={activeCompanies}
              label="Empresas"
              statusLabel="Ativas"
              accent="#2563EB"
              theme={theme}
            />
            <Stat
              value={activeMembers}
              label="Usuários"
              statusLabel="Ativos"
              accent={theme.colors.accent}
              theme={theme}
            />
            <Stat
              value={projects.length}
              label="Obras"
              statusLabel="Totais"
              accent="#94A3B8"
              theme={theme}
            />
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Administração</Text>
              <View style={styles.sectionUnderline} />
            </View>
            <Text style={styles.moduleCount}>6 MÓDULOS</Text>
          </View>

          <View style={styles.grid}>
            {actions.map((action) => (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`${action.title}. ${action.subtitle}`}
                key={action.id}
                onPress={() => navigate(action)}
                style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              >
                <View>
                  <View style={styles.cardTop}>
                    <View style={[styles.iconBox, iconBoxStyle(action.color)]}>
                      <Ionicons name={action.icon} size={24} color={iconColor(action.color, theme)} />
                    </View>
                    <Text style={styles.badge}>{action.badge}</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>{action.title}</Text>
                  <Text style={[styles.cardText, { color: theme.colors.textMuted }]}>{action.subtitle}</Text>
                </View>
                <View style={[styles.cardFooter, { borderTopColor: theme.colors.border }]}>
                  <Text style={styles.accessText}>Acessar</Text>
                  <View style={styles.arrowCircle}>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Content>
      </Scroll>
      {showScrollTopButton && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Voltar ao topo"
          onPress={scrollToTop}
          style={[styles.scrollTopButton, { backgroundColor: theme.colors.accent }]}
        >
          <Ionicons name="chevron-up" size={25} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Screen>
  );
}

function Stat({ value, label, statusLabel, accent, theme }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <View style={styles.statStatus}>
        <View style={[styles.statDot, { backgroundColor: accent }]} />
        <Text style={styles.statStatusText}>{statusLabel}</Text>
      </View>
      <Text style={[styles.statValue, { color: theme.colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function iconBoxStyle(color) {
  if (color === 'blue') return styles.blueIconBox;
  if (color === 'slate') return styles.slateIconBox;
  return styles.orangeIconBox;
}

function iconColor(color, theme) {
  if (color === 'blue') return '#2563EB';
  if (color === 'slate') return '#334155';
  return theme.colors.accent;
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#0B2A5B',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    minHeight: 155,
    overflow: 'hidden',
    padding: 20,
  },
  blueprintCircleLarge: {
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 100,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 180,
    position: 'absolute',
    right: -34,
    top: -46,
    width: 180,
  },
  blueprintCircleMedium: {
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 100,
    borderWidth: 1,
    height: 130,
    position: 'absolute',
    right: -9,
    top: -21,
    width: 130,
  },
  blueprintCircleSmall: {
    borderColor: 'rgba(234,106,18,0.44)',
    borderRadius: 100,
    borderWidth: 1,
    height: 80,
    position: 'absolute',
    right: 16,
    top: 4,
    width: 80,
  },
  heroGlow: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderRadius: 80,
    height: 140,
    left: -75,
    position: 'absolute',
    top: 55,
    width: 140,
  },
  heroContent: { position: 'relative', zIndex: 1 },
  eyebrow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  eyebrowDot: { backgroundColor: '#EA6A12', borderRadius: 4, height: 6, marginRight: 6, width: 6 },
  eyebrowText: { color: '#DCE8FA', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', letterSpacing: -0.4, lineHeight: 26 },
  heroText: { color: 'rgba(219,234,254,0.88)', fontSize: 11, lineHeight: 17, marginTop: 6, maxWidth: '88%' },
  statsRow: { flexDirection: 'row', gap: 9, marginTop: 14 },
  stat: {
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    minHeight: 91,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 11,
  },
  statAccent: { height: 3, left: 0, position: 'absolute', right: 0, top: 0 },
  statStatus: { alignItems: 'center', flexDirection: 'row', marginBottom: 5 },
  statDot: { borderRadius: 4, height: 6, marginRight: 4, width: 6 },
  statStatusText: { color: '#94A3B8', fontSize: 8, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  statValue: { fontSize: 22, fontWeight: '900', lineHeight: 27 },
  statLabel: { fontSize: 10, fontWeight: '700', marginTop: 1 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginTop: 23 },
  sectionTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  sectionUnderline: { backgroundColor: '#EA6A12', borderRadius: 4, height: 3, marginTop: 5, width: 32 },
  moduleCount: { color: '#94A3B8', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    height: 178,
    justifyContent: 'space-between',
    marginBottom: 12,
    overflow: 'hidden',
    padding: 13,
    width: '48.5%',
  },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },
  iconBox: { alignItems: 'center', borderRadius: 13, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  orangeIconBox: { backgroundColor: '#FFF5ED', borderColor: '#FFEDD5' },
  blueIconBox: { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' },
  slateIconBox: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  badge: { backgroundColor: '#F1F5F9', borderRadius: 9, color: '#64748B', fontSize: 8, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 4 },
  cardTitle: { fontSize: 13, fontWeight: '900', lineHeight: 17 },
  cardText: { fontSize: 10, fontWeight: '500', lineHeight: 14, marginTop: 4 },
  cardFooter: { alignItems: 'center', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 },
  accessText: { color: '#94A3B8', fontSize: 9, fontWeight: '800' },
  arrowCircle: { alignItems: 'center', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderRadius: 14, borderWidth: 1, height: 28, justifyContent: 'center', width: 28 },
  scrollTopButton: {
    alignItems: 'center',
    borderRadius: 24,
    bottom: 94,
    elevation: 5,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: 17,
    shadowColor: '#EA6A12',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    width: 48,
  },
});
