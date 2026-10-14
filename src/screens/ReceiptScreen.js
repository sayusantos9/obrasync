import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { SCREENS } from '../navigation/routes';

const WRITABLE_ROLES = new Set([USER_ROLES.MASTER, USER_ROLES.PURCHASING]);

export function ReceiptScreen() {
  const theme = useTheme();
  const {
    createReceipt,
    currentUser,
    openScreen,
    orders,
    receipts,
    selectedProject,
  } = useApp();
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [reference, setReference] = useState('');
  const canWrite = WRITABLE_ROLES.has(currentUser?.role);
  const openOrders = useMemo(() => orders.filter((order) => order.status !== 'Recebido'), [orders]);
  const selectedOrder = openOrders.find((order) => order.id === selectedOrderId) || null;

  async function saveReceipt() {
    if (!selectedOrder) {
      Alert.alert('Selecione um pedido', 'Escolha o pedido recebido.');
      return;
    }

    try {
      await createReceipt({
        orderId: selectedOrder.id,
        supplier: selectedOrder.supplier,
        reference: reference.trim() || selectedOrder.number,
        items: selectedOrder.items || [],
      });
      setSelectedOrderId('');
      setReference('');
      Alert.alert('Recebimento registrado', 'O estoque foi atualizado automaticamente.');
    } catch (error) {
      Alert.alert('Erro no recebimento', error.message);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Recebimento" />
      <Scroll>
        <Content>
          <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}> 
            <Text style={styles.eyebrow}>{selectedProject.name.toUpperCase()}</Text>
            <Text style={styles.big}>Receber pedido</Text>
            <Text style={styles.heroText}>Confira o pedido. Ao concluir, os itens entram no estoque.</Text>
          </View>

          <View style={styles.quickRow}>
            <QuickAction
              background={theme.colors.primarySoft}
              color={theme.colors.primary}
              icon="scan-outline"
              label="Escanear QR"
              onPress={() => openScreen(SCREENS.SCANNER)}
            />
            <QuickAction
              background={theme.colors.accentSoft}
              color={theme.colors.accent}
              icon="qr-code-outline"
              label="Gerar etiqueta"
              onPress={() => openScreen(SCREENS.LABEL)}
            />
          </View>

          {canWrite && (
            <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <Text style={[styles.formTitle, { color: theme.colors.text }]}>Pedido recebido</Text>
              {!openOrders.length && (
                <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Não há pedidos abertos para receber.</Text>
              )}
              {openOrders.map((order) => {
                const selected = selectedOrderId === order.id;
                return (
                  <TouchableOpacity
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    key={order.id}
                    onPress={() => setSelectedOrderId(order.id)}
                    style={[
                      styles.orderCard,
                      { borderColor: selected ? theme.colors.accent : theme.colors.border },
                      selected && { backgroundColor: theme.colors.accentSoft },
                    ]}
                  >
                    <View style={styles.orderInfo}>
                      <Text style={[styles.orderTitle, { color: theme.colors.text }]}>{order.number} • {order.supplier}</Text>
                      <Text style={[styles.orderMeta, { color: theme.colors.textMuted }]}>{order.items?.length || 0} item(ns) • previsão {order.expected_at || order.expectedAt || 'não informada'}</Text>
                    </View>
                    <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? theme.colors.accent : theme.colors.textMuted} />
                  </TouchableOpacity>
                );
              })}

              <Text style={[styles.label, { color: theme.colors.textMuted }]}>REFERÊNCIA / NOTA</Text>
              <TextInput
                accessibilityLabel="Referência ou nota do recebimento"
                onChangeText={setReference}
                placeholder="Ex.: NF 000145"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.background }]}
                value={reference}
              />

              <TouchableOpacity
                accessibilityRole="button"
                disabled={!selectedOrder}
                onPress={saveReceipt}
                style={[styles.primaryButton, { backgroundColor: theme.colors.accent }, !selectedOrder && styles.disabled]}
              >
                <Ionicons name="checkmark-circle-outline" size={21} color="#FFFFFF" />
                <Text style={styles.primaryText}>Confirmar recebimento</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recebimentos recentes</Text>
          {!receipts.length && <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Nenhum recebimento registrado.</Text>}
          {receipts.map((receipt) => (
            <View key={receipt.id} style={[styles.receiptCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <View style={[styles.iconBox, { backgroundColor: theme.colors.successSoft }]}> 
                <Ionicons name="archive-outline" size={22} color={theme.colors.success} />
              </View>
              <View style={styles.receiptInfo}>
                <Text style={[styles.receiptTitle, { color: theme.colors.text }]}>{receipt.reference || receipt.id}</Text>
                <Text style={[styles.receiptMeta, { color: theme.colors.textMuted }]}>{receipt.supplier || 'Fornecedor não informado'} • {receipt.items?.length || 0} item(ns)</Text>
              </View>
              <View style={[styles.status, { backgroundColor: theme.colors.successSoft }]}> 
                <Text style={[styles.statusText, { color: theme.colors.success }]}>Recebido</Text>
              </View>
            </View>
          ))}
        </Content>
      </Scroll>
    </Screen>
  );
}

function QuickAction({ background, color, icon, label, onPress }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.quickCard, { backgroundColor: background }]}> 
      <Ionicons name={icon} size={25} color={color} />
      <Text style={[styles.quickText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 22, marginTop: 18, padding: 18 },
  eyebrow: { color: 'rgba(255,255,255,.68)', fontSize: 10, fontWeight: '900' },
  big: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 7 },
  heroText: { color: 'rgba(255,255,255,.76)', fontSize: 12, lineHeight: 18, marginTop: 4 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  quickCard: { alignItems: 'center', borderRadius: 17, flex: 1, justifyContent: 'center', minHeight: 84, padding: 12 },
  quickText: { fontSize: 11, fontWeight: '900', marginTop: 7 },
  form: { borderRadius: 18, borderWidth: 1, marginTop: 16, padding: 14 },
  formTitle: { fontSize: 17, fontWeight: '900' },
  orderCard: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', marginTop: 10, padding: 12 },
  orderInfo: { flex: 1 },
  orderTitle: { fontSize: 12, fontWeight: '900' },
  orderMeta: { fontSize: 10, lineHeight: 15, marginTop: 3 },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 6, marginTop: 14 },
  input: { borderRadius: 12, borderWidth: 1, minHeight: 48, paddingHorizontal: 12 },
  primaryButton: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', justifyContent: 'center', marginTop: 16, minHeight: 52 },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', marginLeft: 7 },
  disabled: { opacity: 0.45 },
  sectionTitle: { fontSize: 19, fontWeight: '900', marginTop: 24 },
  empty: { fontSize: 12, lineHeight: 18, marginTop: 12, textAlign: 'center' },
  receiptCard: { alignItems: 'center', borderRadius: 17, borderWidth: 1, flexDirection: 'row', marginTop: 10, padding: 13 },
  iconBox: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  receiptInfo: { flex: 1, marginLeft: 11 },
  receiptTitle: { fontSize: 13, fontWeight: '900' },
  receiptMeta: { fontSize: 10, marginTop: 4 },
  status: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 9, fontWeight: '900' },
});
