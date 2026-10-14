import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { SCREENS } from '../navigation/routes';
import { theme } from '../theme';
import { formatCurrency } from '../utils/currency';

export function QuotesScreen() {
  const { openScreen, quotes, removeQuote, selectedProject } = useApp();
  const projectQuotes = quotes.filter((quote) => quote.projectId === selectedProject.id);

  function confirmRemove(quote) {
    Alert.alert('Excluir cotação', `Deseja excluir ${quote.number}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removeQuote(quote.id) },
    ]);
  }

  return (
    <Screen>
      <ScreenHeader title="Cotações" />
      <Scroll>
        <Content>
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="document-text-outline" size={25} color={theme.colors.accent} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Cotações da obra</Text>
              <Text style={styles.heroSubtitle}>{selectedProject.name}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={() => openScreen(SCREENS.CREATE_QUOTE)}>
            <Ionicons name="add-circle" size={22} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Nova cotação</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Cotações cadastradas</Text>

          {!projectQuotes.length && (
            <View style={styles.emptyCard}>
              <Ionicons name="documents-outline" size={34} color={theme.colors.primary} />
              <Text style={styles.emptyTitle}>Nenhuma cotação criada</Text>
              <Text style={styles.emptyText}>
                Cadastre cliente, fornecedor, materiais, preços e validade para começar.
              </Text>
            </View>
          )}

          {projectQuotes.map((quote) => (
            <View key={quote.id} style={styles.quoteCard}>
              <View style={styles.quoteTop}>
                <View style={styles.quoteInfo}>
                  <Text style={styles.quoteNumber}>{quote.number}</Text>
                  <Text style={styles.quoteTitle}>{quote.title}</Text>
                </View>
                <TouchableOpacity onPress={() => confirmRemove(quote)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={19} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
              <Text style={styles.meta}>Cliente: {quote.clientName}</Text>
              <Text style={styles.meta}>Fornecedor: {quote.supplierName}</Text>
              <Text style={styles.meta}>{quote.items.length} item(ns) • válida até {quote.validUntil}</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
              </View>
            </View>
          ))}
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 20,
    flexDirection: 'row',
    marginTop: 20,
    padding: 18,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,.12)',
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  heroText: { flex: 1, marginLeft: 12 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  heroSubtitle: { color: 'rgba(255,255,255,.72)', fontSize: 12, marginTop: 3 },
  createButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 54,
  },
  createButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', marginLeft: 8 },
  sectionTitle: { color: theme.colors.text, fontSize: 19, fontWeight: '900', marginBottom: 12, marginTop: 24 },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 26,
  },
  emptyTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '900', marginTop: 10 },
  emptyText: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 5, textAlign: 'center' },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  quoteTop: { alignItems: 'flex-start', flexDirection: 'row' },
  quoteInfo: { flex: 1 },
  quoteNumber: { color: theme.colors.primary, fontSize: 11, fontWeight: '900' },
  quoteTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '900', marginTop: 3 },
  deleteButton: { padding: 6 },
  meta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 6 },
  totalRow: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
  },
  totalLabel: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '800' },
  totalValue: { color: theme.colors.primaryDark, fontSize: 18, fontWeight: '900' },
});
