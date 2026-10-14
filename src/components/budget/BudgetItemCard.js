import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';
import { formatCurrency } from '../../utils/currency';

export function BudgetItemCard({ budgetItem, onRemove }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="calculator-outline" size={20} color={theme.colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{budgetItem.description}</Text>
        <Text style={styles.meta}>
          {budgetItem.category} • {budgetItem.quantity} {budgetItem.unit} ×{' '}
          {formatCurrency(budgetItem.unitPrice)}
        </Text>
        <Text style={styles.total}>{formatCurrency(budgetItem.total)}</Text>
      </View>

      {!!onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(budgetItem.id)}
        >
          <Ionicons name="trash-outline" size={19} color={theme.colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 10,
    padding: 14,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  info: { flex: 1, marginLeft: 11 },
  name: { color: theme.colors.text, fontSize: 14, fontWeight: '900' },
  meta: { color: theme.colors.textMuted, fontSize: 11, marginTop: 4 },
  total: { color: theme.colors.primary, fontSize: 14, fontWeight: '900', marginTop: 7 },
  removeButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
