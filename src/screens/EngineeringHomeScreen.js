import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SearchBar } from '../components/common/SearchBar';
import { AppHeader } from '../components/layout/AppHeader';
import { Content, LinkText, Screen, SectionHeader, SectionTitle } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { createHomeAlerts, createHomeMetrics, getHomeQuickActions } from '../data/homeData';
import { SCREENS, TABS } from '../navigation/routes';

const COLORS = {
  navy: '#0B2A5B',
  orange: '#EA6A12',
  blue: '#1E63D8',
  green: '#2E9E6B',
  text: '#0F1E3A',
  muted: '#64748B',
  border: '#E2E8F0',
  background: '#F6F9FE',
};

const ACTION_COLORS = {
  budget: { color: '#EA6A12', background: '#FFF3EB' },
  quotes: { color: '#1E63D8', background: '#EEF3FF' },
  materials: { color: '#2E9E6B', background: '#E9F8EF' },
  costs: { color: '#EA6A12', background: '#FFF3EB' },
  projects: { color: '#0B2A5B', background: '#EEF3FF' },
  reports: { color: '#6254C7', background: '#F0EEFF' },
};

function SectionHeading({ title, color = COLORS.orange, link, onLinkPress }) {
  return (
    <SectionHeader style={styles.sectionHeader}>
      <View style={styles.sectionHeading}>
        <View style={[styles.sectionMark, { backgroundColor: color }]} />
        <SectionTitle style={styles.sectionTitle}>{title}</SectionTitle>
      </View>
      {link ? <LinkText style={styles.sectionLink} onPress={onLinkPress}>{link} ›</LinkText> : null}
    </SectionHeader>
  );
}

function ProjectStatusCard({ project, onPress }) {
  const progress = Math.max(0, Math.min(100, Number(project?.progress || 0)));
  const status = project
    ? String(project.status || 'PLANNED').replaceAll('_', ' ').toUpperCase()
    : 'SEM OBRA';

  return (
    <View style={styles.projectCard}>
      <View style={styles.projectAccent} />
      <View style={styles.statusBadge}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <View style={styles.projectSummary}>
        <View style={styles.projectCopy}>
          <View style={styles.eyebrowRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.orange} />
            <Text style={styles.eyebrow}>STATUS EXECUTIVO</Text>
          </View>
          <Text style={styles.projectTitle}>Sua obra em dia</Text>
          <Text style={styles.projectLocation} numberOfLines={2}>
            {project?.name || 'Nenhuma obra selecionada'}
            {project?.location ? ` • ${project.location}` : ''}
          </Text>
        </View>
        <View style={styles.progressCircle}>
          <Svg width={78} height={78} viewBox="0 0 78 78" style={StyleSheet.absoluteFill}>
            <Circle cx="39" cy="39" r="34" fill="none" stroke={COLORS.border} strokeWidth="5" />
            <Circle
              cx="39"
              cy="39"
              r="34"
              fill="none"
              rotation="-90"
              origin="39, 39"
              stroke={COLORS.orange}
              strokeDasharray={`${2 * Math.PI * 34} ${2 * Math.PI * 34}`}
              strokeDashoffset={2 * Math.PI * 34 * (1 - progress / 100)}
              strokeLinecap="round"
              strokeWidth="5"
            />
          </Svg>
          {progress === 0 ? <View style={styles.progressDot} /> : null}
          <Text style={styles.progressValue}>{progress}%</Text>
          <Text style={styles.progressLabel}>PROGRESSO</Text>
        </View>
      </View>

      <View style={styles.progressInfo}>
        <Text style={styles.progressHint}>do cronograma concluído</Text>
        <Text style={styles.progressStage}>PROGRESSO DA OBRA</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <TouchableOpacity accessibilityRole="button" style={styles.detailsButton} onPress={onPress}>
        <Text style={styles.detailsButtonText}>Ver detalhes</Text>
        <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

function QuickActionCard({ action, onPress }) {
  const colors = ACTION_COLORS[action.id] || ACTION_COLORS.budget;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={styles.actionCard}
      onPress={onPress}
    >
      <View style={styles.actionTop}>
        <View style={[styles.actionIcon, { backgroundColor: colors.background, borderColor: `${colors.color}44` }]}>
          <Ionicons name={action.icon} size={21} color={colors.color} />
        </View>
        <View style={styles.actionArrow}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
        </View>
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle} numberOfLines={1}>{action.label}</Text>
        <Text style={styles.actionSubtitle}>{action.id === 'budget' ? 'Novo cálculo' : action.id === 'quotes' ? 'Fornecedores' : action.id === 'materials' ? 'Estoque & Insumos' : action.id === 'costs' ? 'Controle financeiro' : action.id === 'projects' ? 'Diário & Vistorias' : 'Dashboards & PDF'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function MetricCard({ metric }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: metric.backgroundColor }]}>
        <Ionicons name={metric.icon} size={17} color={metric.iconColor || metric.color} />
      </View>
      <Text style={styles.metricLabel}>{metric.label.toUpperCase()}</Text>
      <Text style={[styles.metricValue, { color: metric.color }]} numberOfLines={1}>{metric.value}</Text>
    </View>
  );
}

function AttentionCard({ icon, title, description, color, backgroundColor, onPress, statusColor }) {
  return (
    <TouchableOpacity accessibilityRole="button" style={styles.attentionCard} onPress={onPress}>
      <View style={[styles.attentionIcon, { backgroundColor }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>
      <View style={styles.attentionCopy}>
        <View style={styles.attentionTitleRow}>
          <Text style={styles.attentionTitle}>{title}</Text>
          <View style={[styles.attentionDot, { backgroundColor: statusColor }]} />
        </View>
        <Text style={styles.attentionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
    </TouchableOpacity>
  );
}

export function EngineeringHomeScreen() {
  const {
    dashboard,
    isOffline,
    isSyncing,
    isRefreshing,
    openScreen,
    pendingRequests,
    selectedProject,
    selectProject,
    selectTab,
    syncPendingRequests,
  } = useApp();
  const scrollRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const actions = getHomeQuickActions(USER_ROLES.ENGINEERING);
  const metrics = createHomeMetrics(dashboard || {});
  const alerts = createHomeAlerts(dashboard || {});
  const pendingAlert = alerts[0];
  const pendingCount = Number(dashboard?.pendingRequests || 0);

  function navigate(action) {
    if (action.destinationType === 'tab') selectTab(action.destination);
    else openScreen(action.destination);
  }

  function openProjectDetails() {
    if (selectedProject) selectProject(selectedProject);
    selectTab(TABS.PROJECTS);
  }

  function handleScroll(event) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const nearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 24;
    setShowScrollTop(nearBottom);
  }

  function scrollToTop() {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setShowScrollTop(false);
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <AppHeader showOperationalLabel />
        <Content style={styles.content}>
          <SearchBar placeholder="O que você precisa?" />

          <ProjectStatusCard project={selectedProject} onPress={openProjectDetails} />

          <SectionHeading title="Ações rápidas" />
          <View style={styles.actionsGrid}>
            {actions.map((action) => (
              <QuickActionCard key={action.id} action={action} onPress={() => navigate(action)} />
            ))}
          </View>

          <SectionHeading title="Resumo da obra" color={COLORS.blue} link="Ver mais" onLinkPress={() => selectTab(TABS.PROJECTS)} />
          {isRefreshing ? <ActivityIndicator style={styles.loading} color={COLORS.blue} /> : null}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsContent}
          >
            {metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
          </ScrollView>

          <SectionHeading title="Atenção hoje" link="Ver todas" onLinkPress={() => openScreen(SCREENS.ALERTS)} />
          {pendingAlert ? (
            <AttentionCard
              icon="time-outline"
              title={pendingAlert.title}
              description={`${pendingCount} registro(s) aguardando análise.`}
              color={COLORS.orange}
              backgroundColor="#FFF3EB"
              statusColor={pendingCount ? COLORS.orange : '#CBD5E1'}
              onPress={() => openScreen(SCREENS.ALERTS)}
            />
          ) : null}
          <AttentionCard
            icon={isOffline ? 'cloud-offline-outline' : 'cloud-done-outline'}
            title={isOffline ? 'Modo offline' : isSyncing ? 'Sincronizando...' : 'Sincronizado'}
            description={pendingRequests.length ? `${pendingRequests.length} registro(s) pendente(s)` : 'Dados atualizados recentemente'}
            color={isOffline ? '#B5473E' : COLORS.blue}
            backgroundColor={isOffline ? '#FBE9E7' : '#EEF3FF'}
            statusColor={isOffline ? COLORS.orange : COLORS.green}
            onPress={syncPendingRequests}
          />
        </Content>
      </ScrollView>

      {showScrollTop ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Voltar ao início da página"
          style={styles.scrollTopButton}
          onPress={scrollToTop}
        >
          <Ionicons name="chevron-up" size={25} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 118 },
  content: { paddingBottom: 18 },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    marginTop: 20,
    overflow: 'hidden',
    padding: 18,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  projectAccent: { backgroundColor: COLORS.orange, height: 5, left: 0, position: 'absolute', right: 0, top: 0 },
  statusBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: { backgroundColor: '#16A34A', borderRadius: 4, height: 7, marginRight: 7, width: 7 },
  statusText: { color: '#15803D', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  projectSummary: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  projectCopy: { flex: 1, paddingRight: 8 },
  eyebrowRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 3 },
  eyebrow: { color: COLORS.orange, fontSize: 10, fontWeight: '900', letterSpacing: 0.7, marginLeft: 4 },
  projectTitle: { color: COLORS.navy, fontSize: 21, fontWeight: '900' },
  projectLocation: { color: COLORS.muted, fontSize: 11, fontWeight: '600', marginTop: 3 },
  progressCircle: {
    alignItems: 'center',
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  progressDot: { backgroundColor: COLORS.orange, borderRadius: 4, height: 8, left: 0, position: 'absolute', top: 35, width: 8 },
  progressValue: { color: COLORS.navy, fontSize: 19, fontWeight: '900' },
  progressLabel: { color: COLORS.orange, fontSize: 7, fontWeight: '900', marginTop: 2 },
  progressInfo: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, marginTop: 14 },
  progressHint: { color: COLORS.muted, fontSize: 9 },
  progressStage: { color: COLORS.navy, fontSize: 8, fontWeight: '800', letterSpacing: 0.4 },
  progressTrack: { backgroundColor: COLORS.border, borderRadius: 6, height: 6, overflow: 'hidden' },
  progressFill: { backgroundColor: COLORS.orange, borderRadius: 6, height: '100%' },
  detailsButton: {
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    borderRadius: 12,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
    marginTop: 15,
  },
  detailsButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', marginRight: 8 },
  sectionHeader: { marginBottom: 12, marginTop: 24 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row' },
  sectionMark: { borderRadius: 3, height: 17, marginRight: 8, width: 5 },
  sectionTitle: { color: COLORS.navy, fontSize: 18, fontWeight: '900' },
  sectionLink: { color: COLORS.orange, fontSize: 11, fontWeight: '800' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 122,
    justifyContent: 'space-between',
    marginBottom: 11,
    padding: 13,
    width: '48.5%',
  },
  actionTop: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  actionIcon: { alignItems: 'center', borderRadius: 11, borderWidth: 1, height: 37, justifyContent: 'center', width: 37 },
  actionArrow: { alignItems: 'center', backgroundColor: '#F8FAFC', borderColor: COLORS.border, borderRadius: 8, borderWidth: 1, height: 24, justifyContent: 'center', width: 24 },
  actionCopy: { marginTop: 8 },
  actionTitle: { color: COLORS.navy, fontSize: 12, fontWeight: '900' },
  actionSubtitle: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  metricsContent: { paddingBottom: 2, paddingRight: 20, paddingTop: 1 },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 17,
    borderWidth: 1,
    height: 116,
    justifyContent: 'space-between',
    marginRight: 10,
    overflow: 'hidden',
    padding: 13,
    width: 145,
  },
  metricIcon: { alignItems: 'center', borderRadius: 9, height: 32, justifyContent: 'center', width: 32 },
  metricLabel: { color: COLORS.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.6, marginTop: 7 },
  metricValue: { fontSize: 15, fontWeight: '900', marginTop: 2 },
  loading: { marginBottom: 8, marginTop: -4 },
  attentionCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 9,
    minHeight: 73,
    padding: 12,
  },
  attentionIcon: { alignItems: 'center', borderRadius: 12, height: 43, justifyContent: 'center', width: 43 },
  attentionCopy: { flex: 1, marginLeft: 11 },
  attentionTitleRow: { alignItems: 'center', flexDirection: 'row' },
  attentionTitle: { color: COLORS.navy, flexShrink: 1, fontSize: 13, fontWeight: '900' },
  attentionDot: { borderRadius: 4, height: 7, marginLeft: 6, width: 7 },
  attentionDescription: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  scrollTopButton: {
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    borderColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    bottom: 98,
    elevation: 5,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 48,
  },
});
