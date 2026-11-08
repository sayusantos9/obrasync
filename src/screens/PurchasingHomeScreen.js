import {AccessibleIonicons as Ionicons} from '../components/accessibility/AccessibleNative';
import {AccessibleScrollView as ScrollView,AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';

import { useRef, useState } from 'react';
import { RefreshControl, StyleSheet} from 'react-native';
import { useTheme } from 'styled-components/native';
import { useApp } from '../contexts/AppContext';
import { SyncStatusCard } from '../components/home';
import { SCREENS, TABS } from '../navigation/routes';

const ACTIONS = [
  { title: 'Solicitações', subtitle: 'Registre as necessidades da obra', icon: 'clipboard-outline', route: SCREENS.REQUEST },
  { title: 'Mapa de cotações', subtitle: 'Compare propostas e fornecedores', icon: 'document-text-outline', route: SCREENS.QUOTES },
  { title: 'Pedidos de compra', subtitle: 'Organize compras e entregas previstas', icon: 'cart-outline', route: SCREENS.PURCHASES },
  { title: 'Recebimentos', subtitle: 'Confira os materiais que chegaram', icon: 'file-tray-outline', route: SCREENS.RECEIPT },
  { title: 'Almoxarifado', subtitle: 'Consulte saldos e movimente materiais', icon: 'cube-outline', route: SCREENS.STOCK },
  { title: 'Transferências', subtitle: 'Registre saídas e transferências', icon: 'swap-horizontal-outline', route: SCREENS.TRANSFERS },
  { title: 'Etiquetas e QR Code', subtitle: 'Identifique e localize seus materiais', icon: 'qr-code-outline', route: SCREENS.LABEL },
  { title: 'Relatórios', subtitle: 'Acompanhe compras e estoque', icon: 'bar-chart-outline', route: SCREENS.REPORTS },
];

export function PurchasingHomeScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const scroll = useRef(null);
  const [showTop, setShowTop] = useState(false);
  const { currentUser, selectedProject, orders, stock, requests, pendingRequests, openScreen,
    selectTab, isOffline, isSyncing, isRefreshing, refreshCurrentProject, syncPendingRequests } = useApp();
  const pendingCount = requests.filter((request) => request.status === 'Pendente').length;
  const textSize = (size) => ({ fontSize: size * theme.fontScale });

  return (
    <View style={[styles.screen, { backgroundColor: c.primary }]}>
      <ScrollView
        ref={scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={({ nativeEvent }) => setShowTop(nativeEvent.contentOffset.y > 280)}
        scrollEventThrottle={100}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshCurrentProject} tintColor="#FFFFFF" />}
      >
        <View style={styles.hero}>
          <View pointerEvents="none" accessible={false} style={styles.buildingOne} />
          <View pointerEvents="none" accessible={false} style={styles.buildingTwo} />
          <Text style={[styles.eyebrow, textSize(10)]}>OBRASYNC / COMPRAS E ALMOXARIFADO</Text>
          <Text accessibilityRole="header" style={[styles.greeting, textSize(30)]}>Olá, {currentUser?.name?.trim().split(/\s+/)[0] || 'Compras'}.</Text>
          <Text style={[styles.intro, textSize(15)]}>Tudo pronto para abastecer sua obra.</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Selecionar obra" onPress={() => selectTab(TABS.PROJECTS)} style={styles.project}>
            <Ionicons name="business-outline" size={19} color="#9DCDF0" />
            <Text style={[styles.projectName, textSize(14)]}>{selectedProject?.name || 'Selecione uma obra'}</Text>
            <Ionicons name="chevron-down" size={16} color="#9DCDF0" />
          </TouchableOpacity>
        </View>

        <View style={[styles.body, { backgroundColor: c.background }]}>
          <View style={styles.container}>
            <View style={[styles.stats, { backgroundColor: c.surface, borderColor: c.border }]}>
              {[
                { value: pendingCount, label: 'Solicitações', hint: 'pendentes', route: SCREENS.REQUEST },
                { value: orders.length, label: 'Pedidos', hint: 'cadastrados', route: SCREENS.PURCHASES },
                { value: stock.length, label: 'Materiais', hint: 'no estoque', route: SCREENS.STOCK },
              ].map((stat, index) => (
                <TouchableOpacity key={stat.label} accessibilityRole="button" accessibilityLabel={`${stat.value} ${stat.label} ${stat.hint}`} onPress={() => openScreen(stat.route)} style={[styles.stat, index > 0 && { borderLeftWidth: 1, borderLeftColor: c.border }]}>
                  <Text style={[styles.statValue, { color: c.text }, textSize(29)]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: c.text }, textSize(12)]}>{stat.label}</Text>
                  <Text style={[styles.statHint, { color: c.textMuted }, textSize(11)]}>{stat.hint}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }, textSize(23)]}>Central de suprimentos</Text>
            <Text style={[styles.sectionSubtitle, { color: c.textMuted }, textSize(14)]}>Compras, entregas e materiais em um só lugar.</Text>

            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Explorar catálogo de materiais" onPress={() => selectTab(TABS.MATERIALS)} style={[styles.catalog, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.catalogTop}>
                <View style={[styles.catalogIcon, { backgroundColor: c.primary }]}><Ionicons name="cube-outline" size={27} color="#FFFFFF" /></View>
                <Text style={[styles.catalogEyebrow, { color: c.accent }, textSize(10)]}>CATÁLOGO DE MATERIAIS</Text>
                <Ionicons name="arrow-forward" size={25} color={c.accent} />
              </View>
              <Text style={[styles.catalogTitle, { color: c.text }, textSize(22)]}>Insumos para sua obra</Text>
              <Text style={[styles.catalogText, { color: c.textMuted }, textSize(14)]}>Consulte materiais, unidades e preços de referência.</Text>
              <Text style={[styles.catalogLink, { color: c.accent }, textSize(14)]}>Explorar catálogo</Text>
            </TouchableOpacity>

            <View style={[styles.menu, { backgroundColor: c.surface, borderColor: c.border }]}>
              {ACTIONS.map((action, index) => (
                <TouchableOpacity key={action.route} accessibilityRole="button" accessibilityLabel={`${action.title}. ${action.subtitle}`} onPress={() => openScreen(action.route)} style={[styles.menuItem, index > 0 && { borderTopWidth: 1, borderTopColor: c.border }]}>
                  <View style={[styles.menuIcon, { backgroundColor: c.primarySoft }]}><Ionicons name={action.icon} size={24} color={c.accent} /></View>
                  <View style={styles.menuCopy}>
                    <Text style={[styles.menuTitle, { color: c.text }, textSize(16)]}>{action.title}</Text>
                    <Text style={[styles.menuSubtitle, { color: c.textMuted }, textSize(12)]}>{action.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={21} color={c.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
            <SyncStatusCard isOffline={isOffline} isSyncing={isSyncing} pendingCount={pendingRequests.length} onPress={syncPendingRequests} />
          </View>
        </View>
      </ScrollView>
      {showTop && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar ao topo" onPress={() => scroll.current?.scrollTo({ y: 0, animated: true })} style={[styles.topButton, { backgroundColor: c.primary }]}><Ionicons name="arrow-up" size={25} color="#FFFFFF" /></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 30, overflow: 'hidden' },
  eyebrow: { color: '#9DCDF0', letterSpacing: 1.8, fontWeight: '700', marginBottom: 14 },
  greeting: { color: '#FFFFFF', fontWeight: '800', letterSpacing: -1 },
  intro: { color: '#E1E0EB', lineHeight: 23, marginTop: 7 },
  project: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 22, minHeight: 44 },
  projectName: { color: '#FFFFFF', flexShrink: 1 },
  buildingOne: { position: 'absolute', right: 12, top: 92, height: 260, width: 65, borderWidth: 1, borderColor: '#16264B', transform: [{ rotate: '18deg' }] },
  buildingTwo: { position: 'absolute', right: 65, top: 145, height: 240, width: 65, borderWidth: 1, borderColor: '#262640', transform: [{ rotate: '18deg' }] },
  body: { flexGrow: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 20, paddingBottom: 118 },
  container: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20 },
  stats: { flexDirection: 'row', borderWidth: 1, borderRadius: 20, paddingVertical: 18 },
  stat: { flex: 1, paddingHorizontal: 11, minHeight: 78, justifyContent: 'center' },
  statValue: { fontWeight: '800', marginBottom: 5 },
  statLabel: { fontWeight: '600' },
  statHint: { marginTop: 3 },
  sectionTitle: { fontWeight: '800', letterSpacing: -0.7, marginTop: 28 },
  sectionSubtitle: { marginTop: 6, lineHeight: 21, marginBottom: 18 },
  catalog: { padding: 21, borderWidth: 1, borderRadius: 22, marginBottom: 18 },
  catalogTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catalogIcon: { height: 48, width: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  catalogEyebrow: { flex: 1, fontWeight: '800', letterSpacing: 1.4 },
  catalogTitle: { fontWeight: '800', marginTop: 22, letterSpacing: -0.6 },
  catalogText: { lineHeight: 21, marginTop: 8 },
  catalogLink: { fontWeight: '700', marginTop: 21 },
  menu: { borderWidth: 1, borderRadius: 22, overflow: 'hidden', marginBottom: 18 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 17, minHeight: 96, gap: 13 },
  menuIcon: { width: 45, height: 45, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1 },
  menuTitle: { fontWeight: '600' },
  menuSubtitle: { lineHeight: 18, marginTop: 4 },
  topButton: { position: 'absolute', right: 20, bottom: 100, width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
