import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';

export function CompaniesScreen() {
  const theme = useTheme();
  const { companies } = useApp();

  return (
    <Screen>
      <ScreenHeader title="Minha empresa" />
      <Scroll>
        <Content>
          <View style={[styles.infoBox, { backgroundColor: theme.colors.primarySoft }]}>
            <Ionicons name="information-circle-outline" size={21} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>A empresa é criada no primeiro cadastro do Gestor/Master. Os demais usuários são vinculados a ela pelo Painel Master.</Text>
          </View>

          <Text style={[styles.section, { color: theme.colors.text }]}>Empresa vinculada</Text>
          {!companies.length && <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Nenhuma empresa vinculada a este acesso.</Text>}
          {companies.map((company) => (
            <View key={company.id} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name="business" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.colors.text }]}>{company.name}</Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{company.document || 'CNPJ não informado'}</Text>
                {!!company.email && <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{company.email}</Text>}
              </View>
              <View style={[styles.status, { backgroundColor: theme.colors.successSoft }]}>
                <Text style={[styles.statusText, { color: theme.colors.success }]}>Ativa</Text>
              </View>
            </View>
          ))}
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoBox: { alignItems: 'flex-start', borderRadius: 16, flexDirection: 'row', marginTop: 18, padding: 14 },
  infoText: { flex: 1, fontSize: 11, lineHeight: 17, marginLeft: 8 },
  section: { fontSize: 20, fontWeight: '900', marginTop: 24 },
  empty: { fontSize: 13, marginTop: 18, textAlign: 'center' },
  card: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', marginTop: 10, padding: 14 },
  icon: { alignItems: 'center', borderRadius: 13, height: 46, justifyContent: 'center', width: 46 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '900' },
  meta: { fontSize: 10, marginTop: 3 },
  status: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 9, fontWeight: '900' },
});
