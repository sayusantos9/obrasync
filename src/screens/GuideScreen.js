import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';

const SECTIONS = [
  ['1', 'Entrar e cadastrar', 'No primeiro acesso, use “Cadastrar” para criar o Gestor/Master, a empresa e a primeira obra. Depois, funcionários entram com e-mail e senha próprios.'],
  ['2', 'Cadastrar funcionários', 'Gestor/Master → Mais/Perfil → Empresas e permissões → Adicionar funcionário. Escolha o perfil de acesso correto.'],
  ['3', 'Solicitar e comprar materiais', 'Solicitações registram a necessidade da obra. Compras/Almoxarifado acompanha cotações, pedidos, recebimentos e estoque.'],
  ['4', 'Orçamento e custos', 'Orçamentista/Engenharia cria orçamentos com itens e cliente. Os registros ficam disponíveis durante a demonstração e podem gerar PDF. Despesas atualizam o realizado da obra.'],
  ['5', 'QR Code e etiquetas', 'No estoque/recebimento, gere uma etiqueta QR. Ela é gerada localmente e o PDF pode ser impresso ou compartilhado pelo celular.'],
  ['6', 'Receber pedidos', 'Abra Recebimento, selecione o pedido e confirme os itens. O recebimento atualiza automaticamente o estoque e o status do pedido.'],
  ['7', 'Acessibilidade', 'Em Configurações → Acessibilidade, ative alto contraste, texto ampliado, leitor de tela, alertas visuais ou vibração.'],
];

export function GuideScreen() {
  const theme = useTheme();
  return (
    <Screen>
      <ScreenHeader title="Cartilha de uso" />
      <Scroll>
        <Content>
          <Text style={[styles.intro, { color: theme.colors.textMuted }]}>Guia rápido para as principais rotinas do ObraSync.</Text>
          {SECTIONS.map(([number, title, description]) => (
            <View key={number} accessible accessibilityLabel={`${title}. ${description}`} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <View style={[styles.number, { backgroundColor: theme.colors.accent }]}><Text style={styles.numberText}>{number}</Text></View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                <Text style={[styles.description, { color: theme.colors.textMuted }]}>{description}</Text>
              </View>
            </View>
          ))}
          <View style={[styles.tip, { backgroundColor: theme.colors.primarySoft }]}> 
            <Ionicons name="shield-checkmark-outline" size={21} color={theme.colors.primary} />
            <Text style={[styles.tipText, { color: theme.colors.text }]}>Cada perfil vê apenas as funções compatíveis com sua responsabilidade. Use Gestor/Master somente para administração.</Text>
          </View>
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 20, marginTop: 20 },
  card: { alignItems: 'flex-start', borderRadius: 18, borderWidth: 1, flexDirection: 'row', marginTop: 12, padding: 15 },
  number: { alignItems: 'center', borderRadius: 12, height: 38, justifyContent: 'center', width: 38 },
  numberText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '900' },
  description: { fontSize: 12, lineHeight: 19, marginTop: 5 },
  tip: { alignItems: 'flex-start', borderRadius: 16, flexDirection: 'row', marginBottom: 12, marginTop: 20, padding: 14 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18, marginLeft: 9 },
});
