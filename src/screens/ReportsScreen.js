import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { generateBudgetDocumentPdf } from '../services/budgetPdfService';
import { formatCurrency } from '../utils/currency';

export function ReportsScreen() {
  const theme = useTheme();
  const {
    budgetDocuments,
    dashboard,
    extraExpenses,
    orders,
    receipts,
    requests,
    selectedProject,
    stock,
  } = useApp();

  const reportCards = [
    { title: 'Estoque', value: `${stock.length} materiais`, icon: 'cube-outline', color: theme.colors.primary },
    { title: 'Compras', value: `${orders.length} pedidos`, icon: 'cart-outline', color: theme.colors.accent },
    { title: 'Recebimentos', value: `${receipts.length} registros`, icon: 'archive-outline', color: theme.colors.success },
    { title: 'Solicitações', value: `${requests.length} solicitações`, icon: 'clipboard-outline', color: theme.colors.info },
  ];

  async function exportBudget(document) {
    try {
      await generateBudgetDocumentPdf(document, selectedProject);
    } catch (error) {
      Alert.alert('Não foi possível gerar o PDF', error.message);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Relatórios" />
      <Scroll>
        <Content>
          <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}> 
            <Text style={styles.eyebrow}>{selectedProject.name.toUpperCase()}</Text>
            <Text style={styles.big}>Visão gerencial</Text>
            <Text style={styles.heroText}>Realizado {formatCurrency(Number(dashboard?.realized || 0))} • progresso {dashboard?.progress || 0}%</Text>
          </View>

          <Text style={[styles.section, { color: theme.colors.text }]}>Relatórios disponíveis</Text>
          {reportCards.map((card) => (
            <View key={card.title} style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <View style={[styles.icon, { backgroundColor: `${card.color}18` }]}> 
                <Ionicons name={card.icon} size={22} color={card.color} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{card.title}</Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{card.value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </View>
          ))}

          <Text style={[styles.section, { color: theme.colors.text }]}>Orçamentos / documentos</Text>
          {!budgetDocuments.length && <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Nenhum orçamento liberado ainda.</Text>}
          {budgetDocuments.map((document) => (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Gerar PDF do orçamento ${document.number}`}
              key={document.id}
              onPress={() => exportBudget(document)}
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <View style={[styles.icon, { backgroundColor: theme.colors.accentSoft }]}> 
                <Ionicons name="document-text-outline" size={22} color={theme.colors.accent} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{document.number} • {document.title}</Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>PDF • {formatCurrency(document.total)}</Text>
              </View>
              <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          ))}

          <View style={[styles.footer, { backgroundColor: theme.colors.primarySoft }]}> 
            <Ionicons name="server-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.footerText, { color: theme.colors.text }]}>Dados locais da demonstração. Despesas cadastradas: {extraExpenses.length}.</Text>
          </View>
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 22, marginTop: 18, padding: 18 },
  eyebrow: { color: 'rgba(255,255,255,.68)', fontSize: 10, fontWeight: '900' },
  big: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 7 },
  heroText: { color: 'rgba(255,255,255,.76)', fontSize: 12, marginTop: 4 },
  section: { fontSize: 19, fontWeight: '900', marginTop: 24 },
  card: { alignItems: 'center', borderRadius: 17, borderWidth: 1, flexDirection: 'row', marginTop: 10, padding: 13 },
  icon: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  info: { flex: 1, marginLeft: 11 },
  title: { fontSize: 13, fontWeight: '900' },
  meta: { fontSize: 10, marginTop: 4 },
  empty: { fontSize: 13, marginTop: 12 },
  footer: { alignItems: 'flex-start', borderRadius: 16, flexDirection: 'row', marginBottom: 20, marginTop: 20, padding: 14 },
  footerText: { flex: 1, fontSize: 11, lineHeight: 17, marginLeft: 9 },
});
