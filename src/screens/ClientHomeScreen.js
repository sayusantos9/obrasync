import {AccessibleSafeAreaView as SafeAreaView,AccessibleIonicons as Ionicons} from '../components/accessibility/AccessibleNative';
import {AccessibleImage as Image,AccessibleScrollView as ScrollView,AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';

import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { RefreshControl, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useApp } from '../contexts/AppContext';
import { SCREENS, TABS } from '../navigation/routes';

const NAVY = '#010028';
const BLUE = '#0075E8';
const BANNER = require('../assets/brand/client-construction.png');
const SLIDES = [
  { title: 'Acompanhe', accent: 'suas obras', description: 'Veja o andamento, documentos e orçamentos em tempo real.', icon: 'construct-outline', tab: TABS.PROJECTS },
  { title: 'Consulte seus', accent: 'orçamentos', description: 'Valores e documentos disponíveis para sua consulta.', icon: 'calculator-outline', tab: TABS.BUDGET },
  { title: 'Tudo sobre', accent: 'sua obra', description: 'Acesse os documentos e relatórios compartilhados com você.', icon: 'documents-outline', screen: SCREENS.REPORTS },
];
function progressOf(project) {
  const value = Number(project?.progress);
  return project?.progress != null && Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
}
function statusOf(project) {
  const status = String(project.status || '').toUpperCase();
  if (['COMPLETED', 'COMPLETE'].includes(status)) return 'Concluída';
  if (['CANCELLED', 'CANCELED'].includes(status)) return 'Cancelada';
  if (status === 'ARCHIVED') return 'Arquivada';
  if (['IN_PROGRESS', 'ACTIVE', 'ONGOING'].includes(status)) return 'Em andamento';
  if (['PLANNED', 'PLANNING'].includes(status)) return 'Planejada';
  if (['PAUSED', 'ON_HOLD'].includes(status)) return 'Pausada';
  return 'Status não informado';
}

export function ClientHomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const carousel = useRef(null);
  const [slide, setSlide] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const { currentUser, projects, selectedProject, budgetDocuments, selectTab, selectProject, openScreen, logout,
    accessibilitySettings, isRefreshing, refreshCurrentProject, isOffline } = useApp();
  const scale = theme.fontScale || 1;
  const largeText = fontScale * (theme.layoutFontScale||scale) > 1.3;
  const narrow = width < 350;
  const contrast = accessibilitySettings?.highContrast;
  const muted = contrast ? '#222B3C' : '#52596C';
  const text = (style, color = NAVY) => [style, { color, fontSize: style.fontSize * scale }];
  const progress = progressOf(selectedProject);
  const documents = budgetDocuments.filter(doc => selectedProject?.id && doc.projectId === selectedProject.id);
  const metrics = [
    { value: projects.length, label: 'Obras', detail: 'vinculadas', icon: 'business-outline' },
    { value: progress === null ? '—' : progress + '%', label: 'Andamento', detail: 'da obra atual', icon: 'bar-chart-outline' },
    { value: selectedProject ? documents.length : '—', label: 'Orçamentos', detail: 'da obra atual', icon: 'document-text-outline' },
  ];
  const actions = [
    { title: 'Orçamentos', subtitle: 'Valores e documentos para consulta', icon: 'calculator-outline', onPress: () => selectTab(TABS.BUDGET) },
    { title: 'Documentos e relatórios', subtitle: 'Informações da sua obra', icon: 'documents-outline', onPress: () => openScreen(SCREENS.REPORTS) },
    { title: 'Minhas obras', subtitle: 'Consulte as obras vinculadas ao seu acesso', icon: 'business-outline', onPress: () => selectTab(TABS.PROJECTS) },
    { title: 'Configurações', subtitle: 'Acessibilidade, ajuda e preferências', icon: 'settings-outline', onPress: () => openScreen(SCREENS.SETTINGS) },
  ];
  const featured = selectedProject || projects[0];
  function navigate(item) { item.tab ? selectTab(item.tab) : openScreen(item.screen); }
  function moveTo(index) {
    const next = (index + SLIDES.length) % SLIDES.length;
    carousel.current?.scrollTo({ x: next * carouselWidth, animated: !accessibilitySettings?.reduceMotion });
    setSlide(next);
  }
  async function openProject() {
    if (featured && featured.id !== selectedProject?.id) await selectProject(featured);
    selectTab(TABS.PROJECTS);
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshCurrentProject} tintColor="#FFFFFF"/>}>
        <View style={styles.hero}>
          <View pointerEvents="none" accessible={false} style={styles.architecture}><View style={styles.building}/><View style={styles.buildingSmall}/></View>
          <View style={styles.brandHeader}>
            <Image source={require('../assets/brand/planengen-light.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Planengen"/>
            <View style={styles.headerActions}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={logout} style={styles.headerButton}><Ionicons name="log-out-outline" size={25} color="#FFFFFF"/></TouchableOpacity>
            </View>
          </View>
          <Text style={text(styles.eyebrow, '#8FE5FF')}>OBRASYNC / CONSULTA CLIENTE</Text>
          <Text accessibilityRole="header" style={text(styles.greeting, '#FFFFFF')}>Olá, {currentUser?.name?.trim().split(/\s+/)[0] || 'Consulta'}.</Text>
          <Text style={text(styles.subtitle, '#DCE4F0')}>Sua obra mais perto de você.</Text>
          <View style={styles.company}><Ionicons name="business-outline" size={16} color="#8DCBFF"/><Text style={[text(styles.companyText, '#FFFFFF'), { flex: 1 }]}>{currentUser?.companyName || 'Planengen'}</Text></View>
        </View>
        <LinearGradient colors={['#DCE9F7', '#F2F6FC', '#EAF0F8']} style={styles.body}>
          <View style={[styles.metrics, largeText && styles.stack]}>
            {metrics.map((metric, index) => <View key={metric.label} style={[styles.metric, index > 0 && (largeText ? styles.topBorder : styles.leftBorder), largeText && styles.metricWide]}>
              <View style={styles.metricTop}><View style={[styles.metricIcon, narrow && !largeText && styles.smallIcon]}><Ionicons name={metric.icon} size={narrow ? 23 : 28} color={BLUE}/></View><Text style={text(styles.metricValue)}>{metric.value}</Text></View>
              <View style={styles.metricCopy}><Text style={text(styles.metricLabel)}>{metric.label}</Text><Text style={text(styles.metricDetail, muted)}>{metric.detail}</Text></View>
            </View>)}
          </View>
          <View style={styles.carouselArea} onLayout={({ nativeEvent }) => {
            const nextWidth = Math.max(1, nativeEvent.layout.width - 4);
            if (nextWidth !== carouselWidth) { setCarouselWidth(nextWidth); carousel.current?.scrollTo({ x: slide * nextWidth, animated: false }); }
          }}>
            <View style={styles.carouselFrame}>
              <ScrollView ref={carousel} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={({ nativeEvent }) => carouselWidth && setSlide(Math.round(nativeEvent.contentOffset.x / carouselWidth))}>
                {SLIDES.map((item, index) => <TouchableOpacity key={item.accent} accessibilityRole="button"
                  accessibilityLabel={item.title + ' ' + item.accent + '. ' + item.description}
                  onPress={() => navigate(item)} activeOpacity={0.9} style={[styles.banner, { width: carouselWidth || Math.max(1, width - 48), minHeight: largeText ? 240 : 148 }]}>
                  {index === 0 && <Image source={BANNER} style={styles.bannerPhoto} resizeMode="cover" accessible={false}/>}
                  <LinearGradient colors={index === 0 ? ['#00204A', '#00204AF5', '#00367400'] : ['#00204A', '#003566', '#04538A']} locations={[0, 0.57, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill}/>
                  <View style={[styles.bannerCopy, index > 0 && styles.bannerCopyFull]}>
                    <View style={styles.bannerTitleRow}><View style={styles.bannerIcon}><Ionicons name={item.icon} size={29} color="#9AEAFF"/></View><View style={{ flex: 1 }}><Text style={text(styles.bannerTitle, '#FFFFFF')}>{item.title}</Text><Text style={text(styles.bannerTitle, '#42D5FF')}>{item.accent}</Text></View></View>
                    <Text style={text(styles.bannerDescription, '#FFFFFF')}>{item.description}</Text>
                  </View>
                </TouchableOpacity>)}
              </ScrollView>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Banner anterior" onPress={() => moveTo(slide - 1)} style={[styles.carouselArrow, { left: -13 }]}><Ionicons name="chevron-back" size={25} color={BLUE}/></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Próximo banner" onPress={() => moveTo(slide + 1)} style={[styles.carouselArrow, { right: -13 }]}><Ionicons name="chevron-forward" size={25} color={BLUE}/></TouchableOpacity>
          </View>
          <View style={styles.dots}>{SLIDES.map((item, index) => <TouchableOpacity key={item.accent} accessibilityRole="button" accessibilityLabel={'Ir ao banner ' + (index + 1)} accessibilityState={{ selected: slide === index }} onPress={() => moveTo(index)} style={styles.dotTouch}><View style={[styles.dot, slide === index && styles.activeDot]}/></TouchableOpacity>)}</View>
          <View style={styles.sectionHeading}><View style={styles.sectionMark}/><Text accessibilityRole="header" style={[text(styles.sectionTitle), { flex: 1 }]}>Minhas obras</Text><TouchableOpacity accessibilityRole="button" onPress={() => selectTab(TABS.PROJECTS)} style={styles.seeAll}><Text style={text(styles.link, BLUE)}>Ver todas</Text><Ionicons name="chevron-forward" size={20} color={BLUE}/></TouchableOpacity></View>
          <TouchableOpacity accessibilityRole="button" onPress={openProject} style={styles.projectCard}>
            <View style={styles.projectIcon}><Ionicons name="construct-outline" size={32} color="#FFFFFF"/></View>
            <View style={{ flex: 1 }}>
              <View style={[styles.projectTop, (largeText || narrow) && styles.stack]}><Text style={[text(styles.projectName), { flexShrink: 1 }]}>{featured?.name || 'Nenhuma obra vinculada'}</Text>{featured && <View style={styles.badge}><View style={styles.statusDot}/><Text style={text(styles.badgeText, '#0066BE')}>{statusOf(featured)}</Text></View>}</View>
              {featured ? <><View style={styles.location}><Ionicons name="location-outline" size={16} color={muted}/><Text style={text(styles.detail, muted)}>{featured.location || 'Local não informado'}</Text></View><Text style={text(styles.progressLabel, BLUE)}>{progressOf(featured) === null ? 'Andamento não informado' : progressOf(featured) + '% concluído'}</Text>
                {progressOf(featured) !== null && <View accessibilityRole="progressbar" accessibilityLabel="Andamento da obra" accessibilityValue={{ min: 0, max: 100, now: progressOf(featured) }} style={styles.progressTrack}><View style={[styles.progressFill, { width: progressOf(featured) + '%' }]}/></View>}</> : <Text style={text(styles.detail, muted)}>As obras liberadas para você aparecerão aqui.</Text>}
            </View>
            <Ionicons name="chevron-forward" size={22} color={muted}/>
          </TouchableOpacity>
          <View style={styles.sectionHeading}><View style={styles.sectionMark}/><Text accessibilityRole="header" style={text(styles.sectionTitle)}>Acesso rápido</Text></View>
          <View style={styles.actions}>{actions.map(action => <TouchableOpacity key={action.title} accessibilityRole="button" onPress={action.onPress} style={[styles.actionCard, (largeText || narrow) && { width: '100%' }]}>
            <View style={styles.actionIcon}><Ionicons name={action.icon} size={28} color="#0066BE"/></View>
            <View style={{ flex: 1 }}><Text style={text(styles.actionTitle)}>{action.title}</Text><Text style={text(styles.actionDescription, muted)}>{action.subtitle}</Text></View>
            <Ionicons name="chevron-forward" size={20} color={muted}/>
          </TouchableOpacity>)}</View>
          {isOffline && <Text accessibilityRole="alert" style={[text(styles.detail, muted), { marginTop: 16 }]}>Sem conexão. Exibindo os dados carregados.</Text>}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NAVY },
  hero: { paddingHorizontal: 24, paddingBottom: 28, overflow: 'hidden', backgroundColor: NAVY },
  architecture: { position: 'absolute', right: -30, top: 100, width: 150, height: 220, opacity: 0.18, transform: [{ rotate: '18deg' }] },
  building: { position: 'absolute', right: 12, width: 85, height: 220, borderWidth: 1, borderColor: '#0084F4' },
  buildingSmall: { position: 'absolute', right: 80, top: 60, width: 60, height: 170, borderWidth: 1, borderColor: '#8DCBFF' },
  company: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  companyText: { fontSize: 12, fontWeight: '500' },
  brandHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, gap: 12 },
  logo: { width: 158, height: 47, flexShrink: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '700', marginTop: 22 },
  greeting: { fontSize: 29, fontWeight: '700', letterSpacing: -0.7, marginTop: 5 },
  subtitle: { fontSize: 14, marginTop: 4 },
  body: { paddingHorizontal: 15, paddingTop: 20, borderTopLeftRadius: 26, borderTopRightRadius: 26, minHeight: 550, paddingBottom: 22 },
  metrics: { marginTop: 0, marginBottom: 16, backgroundColor: '#F9FBFF', borderColor: '#D7E3F5', borderWidth: 1, borderRadius: 17, paddingVertical: 12, flexDirection: 'row', shadowColor: '#174A83', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
  metric: { flex: 1, minWidth: 0, paddingHorizontal: 8, gap: 5 },
  metricWide: { paddingVertical: 10, flex: 0 },
  stack: { flexDirection: 'column', alignItems: 'stretch' },
  leftBorder: { borderLeftWidth: 1, borderColor: '#D4E1F4' },
  topBorder: { borderTopWidth: 1, borderColor: '#D4E1F4' },
  metricIcon: { width: 37, height: 42, borderRadius: 12, backgroundColor: '#E1F1FF', alignItems: 'center', justifyContent: 'center' },
  smallIcon: { width: 26, height: 36 },
  metricTop: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metricCopy: { alignSelf: 'stretch' },
  metricValue: { fontSize: 23, fontWeight: '800' },
  metricLabel: { fontSize: 10, fontWeight: '700', marginTop: 1 },
  metricDetail: { fontSize: 10, marginTop: 1 },
  carouselArea: { marginHorizontal: 7 },
  carouselFrame: { overflow: 'hidden', borderRadius: 18, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#00204A', shadowColor: '#15467B', shadowOpacity: 0.2, shadowRadius: 12 },
  banner: { aspectRatio: 2.45, overflow: 'hidden', justifyContent: 'center' },
  bannerPhoto: { position: 'absolute', right: 0, top: 0, width: '70%', height: '100%' },
  bannerCopy: { paddingVertical: 12, paddingLeft: 22, width: '77%' },
  bannerCopyFull: { width: '100%', paddingRight: 22 },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerIcon: { width: 45, height: 45, borderRadius: 12, borderColor: '#00BAFA', borderWidth: 1.5, backgroundColor: '#075180', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 21, fontWeight: '800', letterSpacing: -0.5 },
  bannerDescription: { fontSize: 11, marginTop: 9 },
  carouselArrow: { position: 'absolute', top: '50%', marginTop: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#164578', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 2 },
  dotTouch: { minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#80ADD9' },
  activeDot: { width: 14, backgroundColor: '#0085FB' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 6, marginBottom: 10 },
  sectionMark: { width: 6, height: 24, borderRadius: 4, backgroundColor: '#0085FF' },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  seeAll: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 4 },
  link: { fontSize: 12, fontWeight: '700' },
  projectCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13, borderRadius: 16, borderWidth: 1, borderColor: '#D5E1F2', backgroundColor: '#FAFCFF', marginBottom: 11, shadowColor: '#2B568C', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  projectIcon: { width: 49, height: 53, borderRadius: 13, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' },
  projectTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  projectName: { fontSize: 16, fontWeight: '800' },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', gap: 5, alignItems: 'center', borderRadius: 15, backgroundColor: '#E3F2FF', paddingHorizontal: 8, paddingVertical: 5 },
  statusDot: { height: 6, width: 6, borderRadius: 3, backgroundColor: '#00AEF0' },
  badgeText: { fontSize: 9, fontWeight: '700' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  detail: { fontSize: 11 },
  progressLabel: { fontSize: 12, fontWeight: '700', marginTop: 5 },
  progressTrack: { height: 6, backgroundColor: '#D0E7FF', borderRadius: 4, marginTop: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0085FF', borderRadius: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 7 },
  actionCard: { width: '48.8%', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, minHeight: 70, borderRadius: 14, borderWidth: 1, borderColor: '#D6E2F4', backgroundColor: '#FAFCFF', shadowColor: '#2B568C', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  actionIcon: { width: 37, height: 40, borderRadius: 11, backgroundColor: '#E2F1FF', alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 12, fontWeight: '800' },
  actionDescription: { fontSize: 10, marginTop: 3 },
});
