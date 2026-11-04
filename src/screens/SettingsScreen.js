import { Ionicons } from '@expo/vector-icons';
import { Alert, ActivityIndicator, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useApp } from '../contexts/AppContext';
import { SCREENS } from '../navigation/routes';
import { ROLE_LABELS, USER_ROLES } from '../data/authData';

const NAVY = '#010028';
const LOGO = require('../assets/brand/planengen-light.png');

export function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isOffline, setIsOffline, openScreen, goBack, pendingRequests, syncPendingRequests, discardPendingRequest, isSyncing, accessibilitySettings, currentUser, logout } = useApp();
  function confirmLogout() {
    Alert.alert('Sair da conta', 'Deseja encerrar esta sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }
  const contrast = accessibilitySettings?.highContrast;
  const colors = { text: contrast ? '#000000' : '#202020', muted: contrast ? '#343434' : '#575D6B', border: contrast ? '#707070' : '#DFE3EA', blue: contrast ? '#003F85' : '#0066BE' };
  const text = (style, color = colors.text) => [style, { color, fontSize: style.fontSize * (theme.fontScale || 1) }];
  const disabled = isOffline || isSyncing || !pendingRequests.length;
  async function synchronize() {
    try { await syncPendingRequests(); }
    catch (error) { Alert.alert('Não foi possível enviar a fila', error.message); }
  }
  function Link({ icon, title, subtitle, screen }) {
    return <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} onPress={() => openScreen(screen)} style={[styles.link, { borderColor: colors.border }]}>
      <View style={styles.icon}><Ionicons name={icon} size={23} color={colors.blue}/></View>
      <View style={styles.info}><Text style={text(styles.itemTitle, NAVY)}>{title}</Text><Text style={text(styles.itemDescription, colors.muted)}>{subtitle}</Text></View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted}/>
    </TouchableOpacity>;
  }
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
    <View style={styles.brand}><Image source={LOGO} resizeMode="contain" accessibilityLabel="Planengen" style={styles.logo}/><Text style={text(styles.eyebrow, '#B8C9E4')}>OBRASYNC</Text></View>
    <View style={styles.header}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={styles.back}><Ionicons name="arrow-back" size={23} color="#FFFFFF"/></TouchableOpacity><Text accessibilityRole="header" style={text(styles.title, '#FFFFFF')}>Configurações</Text></View>
    <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 110 + insets.bottom }}>
      <Text style={text(styles.introTitle, NAVY)}>Do seu jeito.</Text><Text style={text(styles.description, colors.muted)}>Ajuste sua experiência e encontre ajuda para usar o ObraSync.</Text>
      <View style={[styles.demo, { borderColor: colors.border, marginTop: 20 }]}>
        <Text style={text(styles.itemTitle, NAVY)}>{currentUser?.name || 'Minha conta'}</Text>
        <Text style={text(styles.itemDescription, colors.muted)}>{[ROLE_LABELS[currentUser?.role], currentUser?.companyName].filter(Boolean).join(' · ')}</Text>
        {!!currentUser?.email && <Text style={text(styles.itemDescription, colors.muted)}>{currentUser.email}</Text>}
      </View>
      <Text accessibilityRole="header" style={text(styles.section, NAVY)}>Preferências e ajuda</Text>
      <Link icon="accessibility-outline" title="Acessibilidade" subtitle="Contraste, tamanho do texto e recursos de interação." screen={SCREENS.ACCESSIBILITY}/>
      <Link icon="book-outline" title="Cartilha de uso" subtitle="Orientações sobre os perfis e os fluxos do aplicativo." screen={SCREENS.GUIDE}/>
      <Text accessibilityRole="header" style={text(styles.section, NAVY)}>Acessos da operação</Text>{[USER_ROLES.MASTER,USER_ROLES.ENGINEERING].includes(currentUser?.role) && <Link icon="analytics-outline" title="Previsto × compra real" subtitle="Preço médio, desvio e impacto por insumo." screen={SCREENS.COMPARISON}/>}
      {currentUser?.role === USER_ROLES.MASTER && <Link icon="people-outline" title="Empresas e permissões" subtitle="Acesse a gestão da empresa e da equipe." screen={SCREENS.MASTER_PANEL}/>}
      {currentUser?.role !== USER_ROLES.CLIENT && <Link icon="notifications-outline" title="Alertas" subtitle={`${pendingRequests.length} registro(s) local(is) pendente(s).`} screen={SCREENS.ALERTS}/>}
      {[USER_ROLES.MASTER, USER_ROLES.PURCHASING, USER_ROLES.REQUESTER].includes(currentUser?.role) && <Link icon="swap-horizontal-outline" title="Consumo e transferências" subtitle="Saídas e transferências de materiais." screen={SCREENS.TRANSFERS}/>}
      {[USER_ROLES.MASTER,USER_ROLES.PURCHASING].includes(currentUser?.role) && <Link icon="cart-outline" title="Pedidos e compras" subtitle="Criar, aprovar e confirmar compras." screen={SCREENS.PURCHASES}/>}
      {[USER_ROLES.MASTER,USER_ROLES.PURCHASING,USER_ROLES.REQUESTER].includes(currentUser?.role) && <Link icon="archive-outline" title="Recebimento" subtitle="Conferência parcial e entrada no estoque." screen={SCREENS.RECEIPT}/>}
      {currentUser?.role===USER_ROLES.MASTER && <Link icon="time-outline" title="Histórico de operações" subtitle="Auditoria das novas operações e arquivamentos." screen={SCREENS.AUDIT}/>}
      {[USER_ROLES.MASTER,USER_ROLES.ENGINEERING,USER_ROLES.PURCHASING].includes(currentUser?.role) && <Link icon="pricetags-outline" title="Preços de mercado" subtitle="Pesquisas nas lojas e comparação com o orçamento." screen={SCREENS.MARKET_PRICES}/>}
      <Link icon="bar-chart-outline" title="Relatórios" subtitle="Consulte os relatórios disponíveis." screen={SCREENS.REPORTS}/>
      {[USER_ROLES.MASTER,USER_ROLES.PURCHASING,USER_ROLES.REQUESTER].includes(currentUser?.role) && <View style={styles.demo}>
        <Text style={text(styles.section)}>Solicitações pendentes</Text>
        <Text style={text(styles.itemDescription)}>A fila fica salva neste aparelho, separada por usuário e empresa. O envio repetido da mesma solicitação não duplica o registro.</Text>
        <View style={styles.switchRow}><Text style={text(styles.itemTitle)}>Preencher solicitações offline</Text><Switch accessibilityLabel="Preencher solicitações offline" value={isOffline} onValueChange={setIsOffline}/></View>
        {pendingRequests.map(r=><View key={r.id} style={{marginTop:16}}><Text style={text(styles.itemTitle)}>{r.data?.material} · {r.data?.quantity} {r.data?.unit}</Text><TouchableOpacity accessibilityRole="button" onPress={()=>Alert.alert('Descartar pendência','Isso remove somente a cópia local. Se ela já tiver sido recebida pelo servidor, o registro remoto será preservado.',[{text:'Manter'},{text:'Descartar',style:'destructive',onPress:()=>discardPendingRequest(r.id).catch(e=>Alert.alert('Erro',e.message))}])}><Text style={text(styles.itemDescription,'#B42318')}>Descartar cópia local</Text></TouchableOpacity></View>)}
        <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={synchronize} style={[styles.sync,{backgroundColor:disabled?'#777':NAVY}]}><Text style={text(styles.syncText,'white')}>{isSyncing?'Enviando...':`Enviar ${pendingRequests.length} pendência(s)`}</Text></TouchableOpacity>
      </View>}
      <View style={styles.note}><Text style={text(styles.itemDescription,colors.muted)}>Pedidos, compras, recebimentos e estoque exigem conexão. O modo offline acima atende somente solicitações.</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={confirmLogout} style={[styles.sync, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#B42318', marginTop: 24 }]}>
        <Ionicons name="log-out-outline" size={21} color="#B42318"/><Text style={text(styles.syncText, '#B42318')}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NAVY }, brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 12, gap: 16 },
  logo: { width: 126, height: 36, flexShrink: 1 }, eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8, paddingBottom: 18 }, back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 26, fontWeight: '700', flex: 1, letterSpacing: -0.5 },
  body: { flex: 1, backgroundColor: '#EEF0F2', borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  introTitle: { fontSize: 25, fontWeight: '700', letterSpacing: -0.6 }, description: { fontSize: 14, marginTop: 8 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 28, marginBottom: 12 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  icon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#E7F2FE' }, info: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600' }, itemDescription: { fontSize: 12, marginTop: 7 },
  demo: { padding: 18, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1 }, demoHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { height: 1, marginVertical: 20 }, switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14 }, status: { fontSize: 12, fontWeight: '600', flex: 1 },
  queue: { flexDirection: 'row', alignItems: 'center', gap: 10 }, sync: { minHeight: 52, padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 18 }, syncText: { fontSize: 14, fontWeight: '600' },
  note: { flexDirection: 'row', gap: 10, paddingHorizontal: 4, marginTop: 24 },
});
