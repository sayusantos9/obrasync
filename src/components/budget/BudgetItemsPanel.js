import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';
import { formatCurrency } from '../../utils/currency';
import { BudgetItemCard } from './BudgetItemCard';

export function BudgetItemsPanel({ items, itemsTotal, onAddItem, onRemoveItem }) {
  return (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Itens adicionados</Text>
          <Text style={styles.subtitle}>{items.length} item(ns) na obra ativa</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
          <Ionicons name="add" size={19} color={theme.colors.primaryDark} />
          <Text style={styles.addButtonText}>Adicionar item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>TOTAL DOS ITENS ADICIONADOS</Text>
        <Text style={styles.totalValue}>{formatCurrency(itemsTotal)}</Text>
      </View>

      {!items.length ? (
        <View style={styles.emptyCard}>
          <Ionicons name="reader-outline" size={34} color={theme.colors.primary} />
          <Text style={styles.emptyTitle}>Nenhum item adicionado</Text>
          <Text style={styles.emptyText}>
            Adicione materiais, serviços, equipamentos ou mão de obra para compor o
            orçamento.
          </Text>
        </View>
      ) : (
        items.map((budgetItem) => (
          <BudgetItemCard
            key={budgetItem.id}
            budgetItem={budgetItem}
            onRemove={onRemoveItem}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  title: { color: theme.colors.text, fontSize: 19, fontWeight: '900' },
  subtitle: { color: theme.colors.textMuted, fontSize: 11, marginTop: 3 },
  addButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: 13,
    flexDirection: 'row',
    minHeight: 42,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 5,
  },
  totalCard: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 16,
    marginTop: 16,
    padding: 15,
  },
  totalLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '800' },
  totalValue: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 5,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    padding: 26,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 10,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    textAlign: 'center',
  },
});
