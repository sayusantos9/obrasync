import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PlanengenScreen, usePlanengenStyle } from '../components/layout/PlanengenScreen';
import { useApp } from '../contexts/AppContext';

export function CompaniesScreen() {
  const { companies } = useApp();
  const { colors, text } = usePlanengenStyle();
  function Detail({ icon, label, value }) {
    return <View style={[styles.detail, { borderColor: colors.border }]}><Ionicons name={icon} size={19} color={colors.blue}/><View style={{ flex: 1 }}><Text style={text(styles.label, colors.muted)}>{label}</Text><Text selectable style={text(styles.value)}>{value || 'Não informado'}</Text></View></View>;
  }
  return <PlanengenScreen title="Empresas" bottomTabs>
    <Text style={text(styles.eyebrow, colors.blue)}>DADOS DA ORGANIZAÇÃO</Text>
    <Text style={text(styles.heading, colors.navy)}>Sua empresa, aqui.</Text>
    <Text style={text(styles.description, colors.muted)}>Consulte as informações da empresa vinculada ao seu acesso.</Text>
    {companies.map(company => <View key={company.id} style={[styles.card, { borderColor: colors.border }]}>
      <View style={styles.top}><View style={styles.icon}><Ionicons name="business-outline" size={28} color={colors.blue}/></View><View style={{ flex: 1 }}><Text style={text(styles.name, colors.navy)}>{company.name}</Text><View style={styles.status}><Ionicons name={company.active === false ? 'pause-circle-outline' : 'checkmark-circle-outline'} size={16} color={colors.blue}/><Text style={text(styles.statusText, colors.blue)}>{company.active === false ? 'Inativa' : 'Ativa'}</Text></View></View></View>
      <Detail icon="document-text-outline" label="CNPJ / documento" value={company.document}/>
      <Detail icon="mail-outline" label="E-mail" value={company.email}/>
      <Detail icon="call-outline" label="Telefone" value={company.phone}/>
    </View>)}
    {!companies.length && <View style={[styles.card, styles.empty, { borderColor: colors.border }]}><Ionicons name="business-outline" size={36} color={colors.blue}/><Text style={text(styles.name, colors.navy)}>Nenhuma empresa vinculada</Text><Text style={[text(styles.description, colors.muted), { textAlign: 'center' }]}>Não há dados de empresa disponíveis para este acesso.</Text></View>}
    <View style={styles.note}><Ionicons name="information-circle-outline" size={23} color={colors.blue}/><View style={{ flex: 1 }}><Text style={text(styles.noteTitle, colors.navy)}>Como funciona o vínculo?</Text><Text style={text(styles.description, colors.muted)}>A empresa é criada no cadastro inicial do gestor. Os demais usuários são vinculados a ela pelo cadastro da equipe.</Text></View></View>
  </PlanengenScreen>;
}
const styles = StyleSheet.create({
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }, heading: { fontSize: 25, fontWeight: '700', marginTop: 10, letterSpacing: -0.6 },
  description: { fontSize: 13, marginTop: 8 }, card: { padding: 20, borderWidth: 1, borderRadius: 18, backgroundColor: '#FFFFFF', marginTop: 24 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 }, icon: { width: 54, height: 54, borderRadius: 16, backgroundColor: '#E7F2FE', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 19, fontWeight: '700' }, status: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 }, statusText: { fontSize: 12, fontWeight: '600' },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, marginTop: 18, paddingTop: 18 }, label: { fontSize: 11 }, value: { fontSize: 14, marginTop: 5 },
  empty: { alignItems: 'center', gap: 14 }, note: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 26 }, noteTitle: { fontSize: 14, fontWeight: '600' },
});
