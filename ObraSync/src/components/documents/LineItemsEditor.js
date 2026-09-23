import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';
import { formatCurrency, parseCurrencyInput } from '../../utils/currency';

const EMPTY_ITEM = { description: '', quantity: '1', unit: 'un', unitPrice: '' };

export function LineItemsEditor({ items, onChange, title = 'Itens' }) {
  const [draft, setDraft] = useState(EMPTY_ITEM);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function addItem() {
    const quantity = parseCurrencyInput(draft.quantity);
    const unitPrice = parseCurrencyInput(draft.unitPrice);

    if (!draft.description.trim()) {
      Alert.alert('Item incompleto', 'Informe o material ou serviço.');
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      Alert.alert('Valores inválidos', 'Informe quantidade e preço unitário válidos.');
      return;
    }

    const newItem = {
      id: `ITEM-${Date.now()}`,
      description: draft.description.trim(),
      quantity,
      unit: draft.unit.trim() || 'un',
      unitPrice,
      total: quantity * unitPrice,
    };

    onChange([...items, newItem]);
    setDraft(EMPTY_ITEM);
  }

  function removeItem(itemId) {
    onChange(items.filter((item) => item.id !== itemId));
  }

  const total = items.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionHint}>Inclua materiais, serviços ou outros itens do documento.</Text>

      <Text style={styles.label}>MATERIAL / SERVIÇO</Text>
      <TextInput
        value={draft.description}
        onChangeText={(value) => updateDraft('description', value)}
        placeholder="Ex.: Cimento CP II 50 kg"
        placeholderTextColor="#968E99"
        style={styles.input}
      />

      <View style={styles.row}>
        <View style={styles.flexField}>
          <Text style={styles.label}>QUANTIDADE</Text>
          <TextInput
            value={draft.quantity}
            onChangeText={(value) => updateDraft('quantity', value)}
            keyboardType="decimal-pad"
            placeholder="1"
            placeholderTextColor="#968E99"
            style={styles.input}
          />
        </View>
        <View style={styles.smallField}>
          <Text style={styles.label}>UNIDADE</Text>
          <TextInput
            value={draft.unit}
            onChangeText={(value) => updateDraft('unit', value)}
            placeholder="un"
            placeholderTextColor="#968E99"
            style={styles.input}
          />
        </View>
      </View>

      <Text style={styles.label}>PREÇO UNITÁRIO (R$)</Text>
      <TextInput
        value={draft.unitPrice}
        onChangeText={(value) => updateDraft('unitPrice', value)}
        keyboardType="decimal-pad"
        placeholder="0,00"
        placeholderTextColor="#968E99"
        style={styles.input}
      />

      <TouchableOpacity style={styles.addButton} onPress={addItem}>
        <Ionicons name="add-circle-outline" size={21} color={theme.colors.primaryDark} />
        <Text style={styles.addButtonText}>Adicionar item</Text>
      </TouchableOpacity>

      {items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.description}</Text>
            <Text style={styles.itemMeta}>
              {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
            </Text>
          </View>
          <View style={styles.itemRight}>
            <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>TOTAL DOS ITENS</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  sectionTitle: { color: theme.colors.text, fontSize: 19, fontWeight: '900' },
  sectionHint: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 15,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 15,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: { flexDirection: 'row', gap: 10 },
  flexField: { flex: 1 },
  smallField: { width: 110 },
  addButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accentSoft,
    borderColor: '#EFD58C',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 52,
  },
  addButtonText: { color: theme.colors.primaryDark, fontSize: 14, fontWeight: '900', marginLeft: 8 },
  itemCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 10,
    padding: 14,
  },
  itemInfo: { flex: 1, paddingRight: 8 },
  itemName: { color: theme.colors.text, fontSize: 14, fontWeight: '800' },
  itemMeta: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  itemRight: { alignItems: 'flex-end' },
  itemTotal: { color: theme.colors.primaryDark, fontSize: 14, fontWeight: '900' },
  removeButton: { marginTop: 8, padding: 4 },
  totalCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    padding: 16,
  },
  totalLabel: { color: theme.colors.primary, fontSize: 12, fontWeight: '900' },
  totalValue: { color: theme.colors.primaryDark, fontSize: 18, fontWeight: '900' },
});
