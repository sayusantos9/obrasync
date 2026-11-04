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
  const { isOffline, setIsOffline, openScreen, goBack, pendingRequests, syncPendingRequests, isSyncing, accessibilitySettings, currentUser, logout } = useApp();
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
    catch (error) { Alert.alert('Não foi possível concluir a simulação', error.message); }
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
      <Text accessibilityRole="header" style={text(styles.section, NAVY)}>Acessos da operação</Text>
      {currentUser?.role === USER_ROLES.MASTER && <Link icon="people-outline" title="Empresas e permissões" subtitle="Acesse a gestão da empresa e da equipe." screen={SCREENS.MASTER_PANEL}/>}
      {currentUser?.role !== USER_ROLES.CLIENT && <Link icon="notifications-outline" title="Alertas" subtitle={`${pendingRequests.length} registro(s) local(is) pendente(s).`} screen={SCREENS.ALERTS}/>}
      {[USER_ROLES.MASTER, USER_ROLES.PURCHASING].includes(currentUser?.role) && <Link icon="swap-horizontal-outline" title="Transferências" subtitle="Saídas e transferências de materiais." screen={SCREENS.TRANSFERS}/>}
      <Link icon="bar-chart-outline" title="Relatórios" subtitle="Consulte os relatórios disponíveis." screen={SCREENS.REPORTS}/>
      {currentUser?.role !== USER_ROLES.CLIENT && <><Text accessibilityRole="header" style={text(styles.section, NAVY)}>Demonstração de solicitações</Text>
      <View style={[styles.demo, { borderColor: colors.border }]}>
        <View style={styles.demoHeading}><View style={styles.icon}><Ionicons name="flask-outline" size={23} color={colors.blue}/></View><View style={styles.info}><Text style={text(styles.itemTitle, NAVY)}>Ambiente de simulação</Text><Text style={text(styles.itemDescription, colors.muted)}>Estes controles atuam somente nas solicitações locais.</Text></View></View>
        <View style={[styles.divider, { backgroundColor: colors.border }]}/>
        <Text style={text(styles.itemTitle, NAVY)}>Simular modo offline</Text>
        <Text style={text(styles.itemDescription, colors.muted)}>Novas solicitações ficam na fila local. Isso não desliga a internet nem as operações conectadas do app.</Text>
        <View style={styles.switchRow}><Text style={text(styles.status, colors.blue)}>{isOffline ? 'Simulação ativa' : 'Simulação desativada'}</Text><Switch accessibilityLabel="Simular modo offline" disabled={isSyncing} value={isOffline} onValueChange={setIsOffline} trackColor={{ false: '#9CA6B5', true: colors.blue }} thumbColor="#FFFFFF"/></View>
        <View style={[styles.divider, { backgroundColor: colors.border }]}/>
        <View style={styles.queue}><Ionicons name="layers-outline" size={21} color={colors.blue}/><Text accessibilityLiveRegion="polite" style={[text(styles.itemTitle, NAVY), { flex: 1 }]}>{pendingRequests.length} {pendingRequests.length === 1 ? 'solicitação pendente' : 'solicitações pendentes'}</Text></View>
        <Text style={text(styles.itemDescription, colors.muted)}>{isSyncing ? 'Movendo pendências para a lista local...' : isOffline ? 'Desative a simulação offline para mover as pendências.' : pendingRequests.length ? 'A simulação move a fila para a lista local, sem enviar ao servidor.' : 'Não há pendências locais para processar.'}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Simular sincronização" accessibilityState={{ disabled, busy: Boolean(isSyncing) }} disabled={disabled} onPress={synchronize} style={[styles.sync, { backgroundColor: disabled ? '#E5E9F0' : NAVY }]}>
          {isSyncing ? <ActivityIndicator color={NAVY}/> : <Ionicons name="sync-outline" size={21} color={disabled ? colors.muted : '#FFFFFF'}/>}
          <Text style={[text(styles.syncText, disabled ? colors.muted : '#FFFFFF'), { flexShrink: 1 }]}>{isSyncing ? 'Processando...' : 'Simular sincronização'}</Text>
        </TouchableOpacity>
      </View>
      </>}<View style={styles.note}><Ionicons name="information-circle-outline" size={22} color={colors.blue}/><View style={styles.info}><Text style={text(styles.itemTitle, NAVY)}>Sobre os dados</Text><Text style={text(styles.itemDescription, colors.muted)}>O app combina cadastros conectados, como usuários e obras, com fluxos locais de demonstração. As solicitações locais podem ser perdidas ao fechar ou recarregar o app.</Text></View></View>
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
