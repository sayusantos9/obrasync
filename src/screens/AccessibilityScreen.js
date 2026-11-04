import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { PlanengenScreen, usePlanengenStyle } from '../components/layout/PlanengenScreen';
import { useApp } from '../contexts/AppContext';

const GROUPS = [
  { title: 'Leitura e aparência', options: [
    { key: 'highContrast', icon: 'contrast-outline', title: 'Alto contraste', description: 'Reforça o contraste de textos e bordas nas telas compatíveis.' },
    { key: 'largeText', icon: 'text-outline', title: 'Texto ampliado', description: 'Aumenta o tamanho dos textos nas telas compatíveis.' },
  ] },
  { title: 'Interação e avisos', options: [
    { key: 'screenReaderOptimized', icon: 'ear-outline', title: 'Anúncios para leitor de tela', description: 'Habilita anúncios nas ações que usam os avisos acessíveis do app.' },
    { key: 'visualAlerts', icon: 'eye-outline', title: 'Alertas visuais', description: 'Mostra confirmações nas ações compatíveis. Avisos essenciais continuam sendo exibidos.' },
    { key: 'vibrationAlerts', icon: 'phone-portrait-outline', title: 'Alertas por vibração', description: 'Acrescenta vibração aos avisos acessíveis, quando disponível no aparelho.' },
    { key: 'reduceMotion', icon: 'remove-circle-outline', title: 'Reduzir movimento', description: 'Reduz animações e rolagem animada nas telas compatíveis.' },
  ] },
];
export function AccessibilityScreen() {
  const { accessibilitySettings, updateAccessibility } = useApp();
  const { colors, text } = usePlanengenStyle();
  return <PlanengenScreen title="Acessibilidade">
    <Text style={text(styles.heading, colors.navy)}>Mais conforto para você.</Text>
    <Text style={text(styles.intro, colors.muted)}>Personalize a leitura e a interação. Os ajustes são salvos neste aparelho.</Text>
    {GROUPS.map(group => <View key={group.title}>
      <Text accessibilityRole="header" style={text(styles.section, colors.navy)}>{group.title}</Text>
      {group.options.map(option => {
        const enabled = Boolean(accessibilitySettings[option.key]);
        return <View key={option.key} style={[styles.card, { borderColor: colors.border }]}>
          <View style={styles.top}><View style={styles.icon}><Ionicons name={option.icon} size={23} color={colors.blue}/></View><Text style={text(styles.optionTitle, colors.navy)}>{option.title}</Text></View>
          <Text style={text(styles.description, colors.muted)}>{option.description}</Text>
          <View style={styles.control}><Text importantForAccessibility="no" style={text(styles.state, colors.blue)}>{enabled ? 'Ativado' : 'Desativado'}</Text><Switch accessibilityLabel={option.title} accessibilityHint={option.description} value={enabled} onValueChange={value => updateAccessibility({ [option.key]: value })} trackColor={{ false: '#9CA6B5', true: colors.blue }} thumbColor="#FFFFFF"/></View>
        </View>;
      })}
    </View>)}
    <View style={styles.note}><Ionicons name="information-circle-outline" size={22} color={colors.blue}/><View style={{ flex: 1 }}><Text style={text(styles.noteTitle, colors.navy)}>VoiceOver e TalkBack</Text><Text style={text(styles.description, colors.muted)}>Ative o leitor de tela nos ajustes do iPhone ou Android. Esta opção do app complementa o recurso do sistema; ela não o ativa.</Text></View></View>
  </PlanengenScreen>;
}
const styles = StyleSheet.create({
  heading: { fontSize: 25, fontWeight: '700', letterSpacing: -0.6 }, intro: { fontSize: 14, marginTop: 9 },
  section: { fontSize: 16, fontWeight: '700', marginTop: 28, marginBottom: 12 }, card: { borderWidth: 1, borderRadius: 18, backgroundColor: '#FFFFFF', padding: 18, marginBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#E7F2FE' },
  optionTitle: { fontSize: 16, fontWeight: '600', flex: 1 }, description: { fontSize: 13, marginTop: 10 },
  control: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16 }, state: { fontSize: 12, fontWeight: '600', flex: 1 },
  note: { flexDirection: 'row', gap: 10, marginTop: 12 }, noteTitle: { fontSize: 14, fontWeight: '600' },
});
