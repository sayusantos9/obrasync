import {HomeIndicators} from '../components/home/HomeIndicators';
import {HomeHighlights} from '../components/home/HomeHighlights';
import {KeyboardScrollView} from '../components/layout/KeyboardScrollView';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, TextInput, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import { useApp } from '../contexts/AppContext';
import { SCREENS, TABS } from '../navigation/routes';

const ACTIONS = [
 {id:'stock',title:'Estoque da obra',subtitle:'Consulte os saldos dos insumos',icon:'cube-outline',route:SCREENS.STOCK},
 {id:'consume',title:'Registrar consumo',subtitle:'Informe os insumos utilizados na obra',icon:'swap-horizontal-outline',route:SCREENS.TRANSFERS},
 {id:'projects',title:'Minhas obras',subtitle:'Dados e andamento das obras',icon:'construct-outline',tab:TABS.PROJECTS},
 {id:'alerts',title:'Alertas',subtitle:'Acompanhe as solicitações e os avisos',icon:'notifications-outline',route:SCREENS.ALERTS},
 {id:'settings',title:'Configurações',subtitle:'Acessibilidade, ajuda e envios pendentes',icon:'settings-outline',route:SCREENS.SETTINGS},
];
const STATUS_LABELS={PLANNED:'Planejada',ACTIVE:'Em andamento',IN_PROGRESS:'Em andamento',PAUSED:'Pausada',COMPLETED:'Concluída',CANCELLED:'Cancelada',CANCELED:'Cancelada',ARCHIVED:'Arquivada'};
const LOGO = require('../assets/brand/planengen-light.png');
const NAVY = '#010028';

export function RequesterHomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, fontScale: deviceFontScale } = useWindowDimensions();
  const scrollRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { dashboard, selectedProject, logout, openScreen, selectTab, currentUser, accessibilitySettings, isRefreshing, refreshCurrentProject, isOffline, isSyncing, pendingRequests = [], syncPendingRequests } = useApp();
  const contrast = accessibilitySettings?.highContrast;
  const scale = theme.fontScale || 1;
  const compact = width < 360 || deviceFontScale * scale > 1.2;
  const colors = { text: contrast ? '#000000' : '#202020', muted: contrast ? '#343434' : '#575D6B', border: contrast ? '#707070' : '#DFE3EA', blue: contrast ? '#003F85' : '#0066BE' };
  const text = (style, color = colors.text) => [style, { color, fontSize: style.fontSize * scale }];
  const [query,setQuery]=useState('');
  const normalize=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const actions=ACTIONS.filter(a=>normalize(a.title+' '+a.subtitle).includes(normalize(query.trim())));
  const counts = {};
  const progress = Math.max(0,Math.min(100,Number(selectedProject?.progress)||0));
  async function refresh(){try{await refreshCurrentProject();}catch(e){Alert.alert('Atualizar obra',e?.message||'Não foi possível atualizar.');}}
  async function synchronize(){try{await syncPendingRequests();}catch(e){Alert.alert('Sincronização',e?.message||'Não foi possível enviar.');}}
  const metrics = selectedProject ? [
    {value:progress+'%',icon:'bar-chart-outline',label:'Andamento',detail:'da obra selecionada'},
    {value:Number(dashboard?.pendingRequests||0),icon:'document-text-outline',label:'Solicitações',detail:'pendentes na obra'},
  ] : [];
  function navigate(action) { if (action.tab) selectTab(action.tab); else openScreen(action.route); }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.brandHeader}>
        <Image source={LOGO} resizeMode="contain" accessibilityLabel="Planengen" style={styles.logo} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={logout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={21} color="#FFFFFF" /><Text style={text(styles.logoutText, '#FFFFFF')}>Sair</Text>
        </TouchableOpacity>
      </View>
      <KeyboardScrollView refreshControl={<RefreshControl refreshing={Boolean(isRefreshing)} onRefresh={refresh} tintColor="#FFFFFF" colors={[colors.blue]}/>} ref={scrollRef} showsVerticalScrollIndicator={false} scrollEventThrottle={16}
        onScroll={({ nativeEvent }) => setShowScrollTop(nativeEvent.contentOffset.y > 200)}
        contentContainerStyle={{ paddingBottom: 104 + insets.bottom }}>
        <View style={styles.intro}>
          <View pointerEvents="none" accessible={false} style={styles.architecture}><View style={styles.building}/><View style={styles.buildingSmall}/></View>
          <Text style={text(styles.eyebrow, '#8DCBFF')}>OBRASYNC / OBRA E SOLICITANTE</Text>
          <Text accessibilityRole="header" style={text(styles.greeting, '#FFFFFF')}>Olá, {currentUser?.name?.trim().split(/\s+/)[0] || 'solicitante'}.</Text>
          <Text style={text(styles.introText, '#DCE4F0')}>Sua obra conectada. Cada insumo no lugar certo.</Text>
          <View style={styles.company}><Ionicons name="business-outline" color="#8DCBFF" size={16} /><Text style={[text(styles.companyText, '#FFFFFF'), { flex: 1 }]}>{currentUser?.companyName || 'Sua empresa'}</Text></View>
        </View>
        <View style={[styles.body, { backgroundColor: contrast ? '#FFFFFF' : '#EAF0F8' }]}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Selecionar obra" onPress={()=>selectTab(TABS.PROJECTS)} style={[styles.catalog,{borderColor:colors.border}]}>
            <View style={styles.catalogTop}><Ionicons name="construct-outline" size={23} color={colors.blue}/><Text style={[text(styles.catalogTag,colors.blue),{flex:1}]}>OBRA SELECIONADA</Text><Ionicons name="chevron-forward" size={20} color={colors.blue}/></View>
            <Text style={text(styles.catalogTitle,NAVY)}>{selectedProject?.name || 'Escolha sua obra'}</Text>{selectedProject&&<Text style={text(styles.catalogDescription,colors.blue)}>{STATUS_LABELS[selectedProject.status] || 'Status não informado'}</Text>}
            <Text style={text(styles.catalogDescription,colors.muted)}>{selectedProject?.location || (selectedProject ? 'Toque para consultar ou trocar de obra.' : 'Selecione uma obra para solicitar insumos e consultar o estoque.')}</Text>
          </TouchableOpacity>
          <HomeIndicators metrics={metrics}/>
          <HomeHighlights/>
          <View style={styles.section}><Text accessibilityRole="header" style={text(styles.sectionTitle, NAVY)}>Sua área de trabalho</Text><Text style={text(styles.sectionDescription, colors.muted)}>Solicitações, estoque e consumo em um só lugar.</Text></View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Explorar catálogo de insumos" onPress={()=>selectTab(TABS.MATERIALS)} style={[styles.catalog,{borderColor:colors.border}]}><View style={styles.catalogTop}><Ionicons name="layers-outline" size={23} color={colors.blue}/><Text style={[text(styles.actionTitle,NAVY),{flex:1}]}>Catálogo de insumos</Text><Ionicons name="chevron-forward" size={18} color={colors.blue}/></View><Text style={text(styles.actionSubtitle,colors.muted)}>Consulte descrições, unidades e referências.</Text></TouchableOpacity>
          <View style={[styles.catalog,{borderColor:colors.border,padding:12}]}><View style={{flexDirection:'row',alignItems:'center',gap:10}}><Ionicons name="search-outline" size={21} color={colors.blue}/><TextInput accessibilityLabel="Buscar ações" placeholder="Buscar estoque, consumo ou obra" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={[text(styles.actionSubtitle),{flex:1,minWidth:0,minHeight:44}]}/>{!!query&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={()=>setQuery('')} style={{padding:10}}><Ionicons name="close" size={21} color={colors.blue}/></TouchableOpacity>}</View></View>
          {!actions.length&&<Text style={text(styles.sectionDescription,colors.muted)}>Nenhum atalho encontrado. Tente estoque, consumo ou obra.</Text>}
          <View style={[styles.modules, { borderColor: colors.border }]}>
            {actions.map((action, index) => (
              <TouchableOpacity key={action.id} accessibilityRole="button" accessibilityLabel={`${action.title}. ${action.subtitle}${counts[action.id] ? '. ' + counts[action.id] : ''}`}
                onPress={() => navigate(action)} style={[styles.action, index > 0 && styles.actionBorder, { borderColor: colors.border }]}>
                <View style={styles.actionIcon}><Ionicons name={action.icon} size={22} color={colors.blue}/></View>
                <View style={styles.actionContent}><Text style={text(styles.actionTitle, NAVY)}>{action.title}</Text><Text style={text(styles.actionSubtitle, colors.muted)}>{action.subtitle}</Text>{!!counts[action.id] && <Text style={text(styles.actionCount, colors.blue)}>{counts[action.id]}</Text>}</View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted}/>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.section}><Text accessibilityRole="header" style={text(styles.sectionTitle,NAVY)}>Atenção hoje</Text></View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ver todos os alertas" onPress={()=>openScreen(SCREENS.ALERTS)} style={[styles.catalog,{borderColor:colors.border}]}>
            <View style={styles.catalogTop}><Ionicons name="notifications-outline" size={22} color={colors.blue}/><Text style={[text(styles.actionTitle,NAVY),{flex:1}]}>Solicitações pendentes</Text><Ionicons name="chevron-forward" size={18} color={colors.blue}/></View>
            <Text style={text(styles.actionSubtitle,colors.muted)}>{Number(dashboard?.pendingRequests || 0)} registro(s) aguardando análise. Ver alertas.</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" disabled={isSyncing} accessibilityState={{disabled:Boolean(isSyncing)}} onPress={synchronize} style={[styles.catalog,{borderColor:colors.border}]}>
            <View style={styles.catalogTop}>{isSyncing ? <ActivityIndicator color={colors.blue}/> : <Ionicons name={isOffline?'cloud-offline-outline':'cloud-done-outline'} size={22} color={colors.blue}/> }<Text style={[text(styles.actionTitle,NAVY),{flex:1}]}>{isOffline?'Sem conexão':isSyncing?'Sincronizando...':'Conexão disponível'}</Text></View>
            <Text style={text(styles.actionSubtitle,colors.muted)}>{pendingRequests.length ? pendingRequests.length+' registro(s) aguardando envio.' : 'Nenhum envio pendente neste dispositivo.'}</Text>
          </TouchableOpacity>
          <View style={styles.footer}><View style={styles.footerLine}/><Text style={text(styles.footerText, colors.muted)}>PLANENGEN · OBRASYNC</Text><View style={styles.footerLine}/></View>
        </View>
      </KeyboardScrollView>
      {showScrollTop && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar ao topo"
        onPress={() => { setShowScrollTop(false); scrollRef.current?.scrollTo({ y: 0, animated: !accessibilitySettings?.reduceMotion }); }} style={[styles.scrollTop, { bottom: 92 + insets.bottom }]}>
        <Ionicons name="arrow-up" size={23} color="#FFFFFF"/>
      </TouchableOpacity>}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NAVY },
  brandHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12, gap: 16 },
  logo: { width: 132, height: 38, flexShrink: 1 },
  logout: { minHeight: 44, minWidth: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  logoutText: { fontSize: 13, fontWeight: '600' },
  intro: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 26, overflow: 'hidden' },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  greeting: { fontSize: 30, fontWeight: '700', letterSpacing: -0.9, marginTop: 12 },
  introText: { fontSize: 14, marginTop: 6 },
  company: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  companyText: { fontSize: 12, fontWeight: '500' },
  architecture: { position: 'absolute', right: -30, top: 14, width: 150, height: 220, opacity: 0.18, transform: [{ rotate: '18deg' }] },
  building: { position: 'absolute', right: 12, width: 85, height: 220, borderWidth: 1, borderColor: '#0084F4' },
  buildingSmall: { position: 'absolute', right: 80, top: 60, width: 60, height: 170, borderWidth: 1, borderColor: '#8DCBFF' },
  body: { paddingHorizontal: 20, paddingTop: 20, borderTopLeftRadius: 26, borderTopRightRadius: 26, minHeight: 500 },
  metrics: { backgroundColor: '#FFFFFF', borderWidth: 1, borderRadius: 18, flexDirection: 'row', paddingVertical: 18 },
  metricsStack: { flexDirection: 'column', paddingVertical: 0 },
  metric: { flex: 1, paddingHorizontal: 12, paddingVertical: 3, gap: 4 },
  metricCompact: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12 },
  metricLeftBorder: { borderLeftWidth: 1 }, metricTopBorder: { borderTopWidth: 1 },
  metricValue: { fontSize: 23, fontWeight: '700', letterSpacing: -1 },
  metricLabel: { fontSize: 12, fontWeight: '600' }, metricDetail: { fontSize: 11, marginTop: 3 },
  section: { marginTop: 26, marginBottom: 16 },
  sectionTitle: { fontSize: 21, fontWeight: '700', letterSpacing: -0.5 }, sectionDescription: { fontSize: 13, marginTop: 5 },
  catalog: { backgroundColor: '#FFFFFF', padding: 20, borderWidth: 1, borderRadius: 18, marginBottom: 16 },
  catalogTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  catalogIcon: { backgroundColor: NAVY, width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  catalogTag: { fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
  catalogTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  catalogDescription: { fontSize: 13, marginTop: 7 }, catalogLink: { fontSize: 13, fontWeight: '700', marginTop: 18 },
  modules: { backgroundColor: '#FFFFFF', borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  action: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18, gap: 12 },
  actionBorder: { borderTopWidth: 1 },
  actionIcon: { width: 42, height: 42, backgroundColor: '#EFF6FD', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionContent: { flex: 1, gap: 4 }, actionTitle: { fontSize: 15, fontWeight: '600' }, actionSubtitle: { fontSize: 12 }, actionCount: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 28 },
  footerLine: { height: 1, flex: 1, backgroundColor: '#CCD2DC' }, footerText: { fontSize: 9, letterSpacing: 1.5, fontWeight: '600', flexShrink: 1 },
  scrollTop: { position: 'absolute', right: 20, width: 48, height: 48, borderRadius: 24, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: NAVY, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});
