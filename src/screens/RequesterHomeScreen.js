import { useRef, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useApp } from '../contexts/AppContext';
import { createHomeAlerts, createHomeMetrics, getHomeQuickActions } from '../data/homeData';
import { ROLE_LABELS } from '../data/authData';
import { SCREENS, TABS } from '../navigation/routes';

const NAVY = '#06234D';
const ORANGE = '#EA6A12';
const LOGO = require('../assets/logo cinza claro.png');
const ACTION_COLORS = [
  { color: ORANGE, background: '#FEF5EE', border: '#FFDFBF' },
  { color: '#2563EB', background: '#EFF6FF', border: '#D4E5FF' },
  { color: '#10B981', background: '#EEFbf3', border: '#C8F3DD' },
];

function IconButton({ icon, label, onPress, badge }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.iconButton}>
    <Ionicons name={icon} size={21} color="#FFF" />
    {!!badge && <View style={styles.badge} />}
  </TouchableOpacity>;
}

export function RequesterHomeScreen() {
  const { currentUser, selectedProject, dashboard, isOffline, isRefreshing, isSyncing,
    pendingRequests, refreshCurrentProject, syncPendingRequests, openScreen, selectTab,
    accessibilitySettings } = useApp();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const searchRef = useRef(null);
  const [query, setQuery] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const text = (style) => [style, { fontSize: style.fontSize * (theme.fontScale || 1) }];
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const actions = getHomeQuickActions(currentUser?.role).map((action, i) => ({ ...action, ...ACTION_COLORS[i] }))
    .filter(action => normalize(action.label).includes(normalize(query.trim())));
  const progressValue = Number(selectedProject?.progress || 0);
  const progress = Number.isFinite(progressValue) ? Math.max(0, Math.min(100, progressValue)) : 0;
  const metrics = createHomeMetrics(dashboard || {});
  const alerts = createHomeAlerts(dashboard || {});
  const pendingCount = pendingRequests.length;

  function navigate(action) {
    if (action.destinationType === 'tab') selectTab(action.destination);
    else openScreen(action.destination);
  }
  async function refresh() {
    try { await refreshCurrentProject(); setRefreshError(''); }
    catch (error) { setRefreshError(error?.message || 'Não foi possível atualizar. Tente novamente.'); }
  }
  async function synchronize() {
    try { await syncPendingRequests(); }
    catch (error) { Alert.alert('Sincronização', error?.message || 'Não foi possível sincronizar.'); }
  }
  const syncTitle = isOffline ? 'Modo offline' : isSyncing ? 'Sincronizando...' : 'Sincronizado';

  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
    <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
      onScroll={({ nativeEvent }) => setShowScrollToTop(nativeEvent.contentOffset.y > 200)}
      scrollEventThrottle={16}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#FFF" colors={[ORANGE]} />}>
      <View style={styles.header}>
        <View style={styles.row}>
          <Image source={LOGO} resizeMode="contain" accessibilityLabel="Planengen" style={styles.logo} />
          <IconButton icon="settings-sharp" label="Configurações da conta" onPress={() => openScreen(SCREENS.SETTINGS)} />
        </View>
        <View style={[styles.row, styles.brandRow]}>
          <Text style={text(styles.brand)}>Obra<Text style={{ color: ORANGE }}>Sync</Text></Text>
          <View style={styles.headerActions}>
            <IconButton icon="notifications-outline" label="Abrir alertas" badge={dashboard?.pendingRequests}
              onPress={() => openScreen(SCREENS.ALERTS)} />
            <IconButton icon="person-outline" label="Abrir perfil" onPress={() => openScreen(SCREENS.PROFILE)} />
          </View>
        </View>
        <Text style={text(styles.greeting)}>Olá, {currentUser?.name?.split(' ')[0] || 'Usuário'}</Text>
        <Text style={text(styles.subtitle)}>{ROLE_LABELS[currentUser?.role] || 'Obra/Solicitante'}{currentUser?.companyName ? ` • ${currentUser.companyName}` : ''}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Obra ativa: ${selectedProject?.name || 'nenhuma'}. Toque para selecionar.`}
          onPress={() => selectTab(TABS.PROJECTS)} style={styles.projectPicker}>
          <Ionicons name="business-outline" size={20} color="#BFD5F5" />
          <Text numberOfLines={2} style={[text(styles.projectName), { flex: 1 }]}>{selectedProject?.name || 'Selecionar obra'}</Text>
          <Ionicons name="chevron-down" size={18} color="#BFD5F5" />
        </TouchableOpacity>
      </View>

      <View style={[styles.body, { paddingBottom: 110 + Math.max(insets.bottom, 12) }]}>
        <View style={[styles.search, styles.shadow]}>
          <Ionicons name="search" size={21} color="#8DA1BB" />
          <TextInput ref={searchRef} accessibilityLabel="Buscar ações rápidas" value={query} onChangeText={setQuery}
            placeholder="O que você precisa?" placeholderTextColor="#718198" returnKeyType="search"
            style={[text(styles.searchInput), { flex: 1 }]} />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={query ? 'Limpar busca' : 'Pesquisar atalhos'}
            onPress={() => query ? setQuery('') : searchRef.current?.focus()} style={styles.filterButton}>
            <Ionicons name={query ? 'close' : 'options-outline'} size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>
        {!!refreshError && <TouchableOpacity onPress={refresh} accessibilityRole="button" style={styles.error}>
          <Text style={text(styles.errorText)}>{refreshError} Toque para atualizar.</Text>
        </TouchableOpacity>}

        <View style={[styles.heroFrame, styles.shadow]}>
          <LinearGradient colors={['#0A2245', '#193D71']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
              {[0, 1, 2, 3].map(i => <View key={i} style={[styles.heroLine, { left: 70 + i * 65 }]} />)}
            </View>
            {selectedProject && <View style={styles.status}><View style={styles.statusDot} />
              <Text style={text(styles.statusText)}>{String(selectedProject.status || 'Em andamento').toUpperCase()}</Text>
            </View>}
            <Text style={text(styles.heroTitle)}>{selectedProject ? 'Sua obra em dia' : 'Selecione uma obra'}</Text>
            <Text style={text(styles.heroSubtitle)}>{selectedProject
              ? `${selectedProject.name} • ${selectedProject.location || 'Local não informado'}`
              : 'Escolha uma obra para acompanhar seu andamento.'}</Text>
            {selectedProject && <>
              <View style={styles.progressRow}><Text style={text(styles.progressValue)}>{progress}%</Text>
                <Text style={text(styles.progressLabel)}>do cronograma{'\n'}concluído</Text></View>
              <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: progress }}
                accessibilityLabel="Progresso da obra"><View style={[styles.fill, { width: `${progress}%` }]} /></View>
            </>}
            <TouchableOpacity accessibilityRole="button" onPress={() => selectTab(TABS.PROJECTS)} style={styles.details}>
              <Text style={text(styles.detailsText)}>{selectedProject ? 'Ver detalhes' : 'Selecionar obra'}</Text>
              <Ionicons name="arrow-forward" size={17} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <Text accessibilityRole="header" style={[text(styles.sectionTitle), styles.section]}>Ações rápidas</Text>
        <View style={styles.actionsGrid}>
          {actions.map(action => <TouchableOpacity key={action.id} accessibilityRole="button" onPress={() => navigate(action)}
            style={[styles.quickAction, styles.shadow, { backgroundColor: action.background, borderColor: action.border }]}>
            <View style={[styles.actionIcon, { backgroundColor: action.color }]}><Ionicons name={action.icon} size={23} color="#FFF" /></View>
            <View style={styles.actionBottom}><Text style={[text(styles.actionLabel), { flex: 1 }]}>{action.label}</Text>
              <View style={[styles.arrow, { backgroundColor: action.border }]}><Ionicons name="chevron-forward" size={14} color={action.color} /></View>
            </View>
          </TouchableOpacity>)}
          {!actions.length && <Text style={text(styles.empty)}>Nenhum atalho encontrado. Tente “material” ou “obra”.</Text>}
        </View>

        <View style={[styles.row, styles.section]}><Text accessibilityRole="header" style={text(styles.sectionTitle)}>Resumo da obra</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => selectTab(TABS.PROJECTS)} style={styles.linkButton}><Text style={text(styles.link)}>Ver mais</Text></TouchableOpacity></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsScroll} contentContainerStyle={styles.metrics}>
          {metrics.map(metric => <TouchableOpacity key={metric.id} accessibilityRole="button" onPress={() => navigate(metric)} style={[styles.metric, styles.shadow]}>
            <View style={[styles.metricIcon, { backgroundColor: metric.backgroundColor }]}>
              <Ionicons name={metric.icon} size={20} color={metric.iconColor || metric.color} /></View>
            <Text style={text(styles.metricLabel)}>{metric.label.toUpperCase()}</Text>
            <Text style={[text(styles.metricValue), { color: metric.color }]}>{metric.value}</Text>
          </TouchableOpacity>)}
        </ScrollView>

        <View style={[styles.row, styles.section]}><Text accessibilityRole="header" style={text(styles.sectionTitle)}>Atenção hoje</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => openScreen(SCREENS.ALERTS)} style={styles.linkButton}><Text style={text(styles.link)}>Ver todas</Text></TouchableOpacity></View>
        {alerts.map(alert => <TouchableOpacity key={alert.id} accessibilityRole="button" onPress={() => openScreen(alert.destination)}
          style={[styles.alertCard, styles.shadow, { backgroundColor: '#FEF4EA', borderColor: '#FFD8AE' }]}>
          <View style={[styles.alertIcon, { backgroundColor: alert.color }]}><Ionicons name={alert.icon} size={25} color="#FFF" /></View>
          <View style={styles.alertCopy}><Text style={text(styles.alertTitle)}>{alert.title}</Text><Text style={text(styles.alertDescription)}>{alert.description}</Text></View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>)}
        <TouchableOpacity accessibilityRole="button" disabled={isSyncing} accessibilityState={{ disabled: isSyncing }} onPress={synchronize}
          style={[styles.alertCard, styles.shadow, { backgroundColor: '#F0F6FF', borderColor: '#CCE0FF' }]}>
          <View style={[styles.alertIcon, { backgroundColor: '#FFF' }]}><Ionicons name={isOffline ? 'cloud-offline' : 'cloud-done'} size={25} color="#0060DF" /></View>
          <View style={styles.alertCopy}><Text style={text(styles.alertTitle)}>{syncTitle}</Text>
            <Text style={text(styles.alertDescription)}>{pendingCount ? `${pendingCount} registro(s) pendente(s)` : 'Dados atualizados recentemente'}</Text></View>
          <Ionicons name="chevron-forward" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </ScrollView>
    {showScrollToTop && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar ao início da tela"
      onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: !accessibilitySettings.reduceMotion })}
      style={[styles.toTop, styles.shadow, { bottom: 82 + Math.max(insets.bottom, 12) }]}>
      <Ionicons name="arrow-up" size={24} color="#FFF" />
    </TouchableOpacity>}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NAVY }, scrollContent: { flexGrow: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  logo: { width: 174, height: 42, maxWidth: '65%' },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF14', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 10, right: 11, width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE, borderWidth: 1, borderColor: NAVY },
  brandRow: { marginTop: 12 }, brand: { fontSize: 30, fontWeight: '800', color: '#FFF', letterSpacing: -1.3, flexShrink: 1 },
  headerActions: { flexDirection: 'row', gap: 8 }, greeting: { fontSize: 26, fontWeight: '800', letterSpacing: -.8, color: '#FFF', marginTop: 18 },
  subtitle: { fontSize: 12, color: '#AEC5E3', marginTop: 3 },
  projectPicker: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 18, borderRadius: 16, backgroundColor: '#11356B', borderWidth: 1, borderColor: '#294875', minHeight: 48 },
  projectName: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  body: { flexGrow: 1, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: '#F8FAFC', paddingHorizontal: 20 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', borderRadius: 17, paddingHorizontal: 15, minHeight: 56, marginTop: -28, marginBottom: 18, borderWidth: 1, borderColor: '#EEF2F6' },
  searchInput: { fontSize: 14, color: NAVY, paddingVertical: 14, minWidth: 0 }, filterButton: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', borderRadius: 12 },
  shadow: { shadowColor: '#0B234B', shadowOpacity: .08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  heroFrame: { borderRadius: 24, backgroundColor: NAVY }, hero: { padding: 20, borderRadius: 24, overflow: 'hidden' },
  heroLine: { position: 'absolute', top: -180, width: 5, height: 650, transform: [{ rotate: '-48deg' }], backgroundColor: '#FFFFFF04' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5, backgroundColor: '#1B4175', borderWidth: 1, borderColor: '#28637B', alignSelf: 'flex-start', marginBottom: 12 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34D399' }, statusText: { fontSize: 10, fontWeight: '800', color: '#6EE7B7' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: -.7 }, heroSubtitle: { fontSize: 12, color: '#BCD2EF', marginTop: 3 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 }, progressValue: { fontSize: 40, fontWeight: '800', color: '#FFF', letterSpacing: -1 },
  progressLabel: { fontSize: 12, color: '#D4E4FC', fontWeight: '600', flexShrink: 1 }, track: { height: 5, borderRadius: 4, backgroundColor: '#061C36', marginVertical: 17, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: ORANGE, borderRadius: 4 }, details: { flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 16, backgroundColor: ORANGE, borderRadius: 13, marginTop: 4 }, detailsText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  section: { marginTop: 25, marginBottom: 12 }, sectionTitle: { fontSize: 19, fontWeight: '800', color: NAVY, letterSpacing: -.5, flexShrink: 1 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  quickAction: { width: '47.5%', flexGrow: 0, minHeight: 126, borderRadius: 24, padding: 15, borderWidth: 1, justifyContent: 'space-between' },
  actionIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionBottom: { flexDirection: 'row', gap: 5, alignItems: 'flex-end', marginTop: 14 }, actionLabel: { fontSize: 14, fontWeight: '700', color: NAVY },
  arrow: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  linkButton: { minHeight: 44, justifyContent: 'center', paddingLeft: 5 }, link: { fontSize: 12, fontWeight: '700', color: NAVY },
  metricsScroll: { marginHorizontal: -20 }, metrics: { gap: 14, paddingHorizontal: 20, paddingBottom: 8 },
  metric: { minWidth: 145, padding: 16, borderRadius: 24, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F1F5F9' },
  metricIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  metricLabel: { fontSize: 10, color: '#64748B', letterSpacing: .5 }, metricValue: { fontSize: 17, fontWeight: '800', marginTop: 5 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderRadius: 24, marginBottom: 12, minHeight: 82 },
  alertIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, alertCopy: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: NAVY }, alertDescription: { fontSize: 11, color: '#586A82', marginTop: 3 },
  toTop: { position: 'absolute', right: 16, width: 46, height: 46, borderRadius: 23, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 14, color: '#586A82', padding: 15 }, error: { padding: 14, backgroundColor: '#FFF2E8', borderRadius: 12, marginBottom: 16 }, errorText: { fontSize: 13, color: '#9A3412' },
});
