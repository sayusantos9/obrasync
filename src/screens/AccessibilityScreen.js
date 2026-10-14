import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';

const OPTIONS = [
  { key: 'highContrast', icon: 'contrast-outline', title: 'Alto contraste', description: 'Aumenta o contraste de textos, bordas e ações.' },
  { key: 'largeText', icon: 'text-outline', title: 'Texto ampliado', description: 'Aumenta a escala de textos nas telas compatíveis.' },
  { key: 'screenReaderOptimized', icon: 'ear-outline', title: 'Otimização para leitor de tela', description: 'Usa anúncios acessíveis e rótulos descritivos quando VoiceOver ou TalkBack estiverem ativos no aparelho.' },
  { key: 'visualAlerts', icon: 'eye-outline', title: 'Alertas visuais', description: 'Mostra confirmações e avisos em tela, útil para pessoas surdas.' },
  { key: 'vibrationAlerts', icon: 'phone-portrait-outline', title: 'Alertas por vibração', description: 'Usa vibração junto das confirmações importantes.' },
  { key: 'reduceMotion', icon: 'remove-circle-outline', title: 'Reduzir movimento', description: 'Evita animações não essenciais e transições intensas.' },
];

export function AccessibilityScreen() {
  const theme = useTheme();
  const { accessibilitySettings, updateAccessibility } = useApp();

  return (
    <Screen>
      <ScreenHeader title="Acessibilidade" />
      <Scroll>
        <Content>
          <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}> 
            <Ionicons name="accessibility" size={30} color="#FFFFFF" />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>ObraSync para mais pessoas</Text>
              <Text style={styles.heroDescription}>Recursos para baixa visão, cegueira, surdez e sensibilidade a movimento.</Text>
            </View>
          </View>

          {OPTIONS.map((option) => (
            <View key={option.key} accessible accessibilityLabel={`${option.title}. ${option.description}`} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}> 
                <Ionicons name={option.icon} size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.colors.text, fontSize: 15 * theme.fontScale }]}>{option.title}</Text>
                <Text style={[styles.description, { color: theme.colors.textMuted, fontSize: 12 * theme.fontScale }]}>{option.description}</Text>
              </View>
              <Switch
                accessibilityLabel={`Ativar ${option.title}`}
                value={Boolean(accessibilitySettings[option.key])}
                onValueChange={(value) => updateAccessibility({ [option.key]: value })}
                trackColor={{ false: '#D8DEE8', true: theme.colors.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}

          <View style={[styles.note, { backgroundColor: theme.colors.accentSoft }]}> 
            <Ionicons name="information-circle-outline" size={21} color={theme.colors.accent} />
            <Text style={[styles.noteText, { color: theme.colors.text }]}>O app usa componentes nativos compatíveis com VoiceOver no iPhone e TalkBack no Android. Mantenha o leitor de tela do sistema ativado para navegação por gestos e áudio.</Text>
          </View>
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', borderRadius: 22, flexDirection: 'row', marginTop: 18, padding: 18 },
  heroText: { flex: 1, marginLeft: 13 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  heroDescription: { color: 'rgba(255,255,255,.78)', fontSize: 12, lineHeight: 18, marginTop: 4 },
  card: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', marginTop: 12, padding: 14 },
  icon: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  info: { flex: 1, marginHorizontal: 12 },
  title: { fontWeight: '900' },
  description: { lineHeight: 18, marginTop: 3 },
  note: { alignItems: 'flex-start', borderRadius: 16, flexDirection: 'row', marginTop: 20, padding: 14 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18, marginLeft: 9 },
});
