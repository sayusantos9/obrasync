import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { SCREENS, TABS } from '../navigation/routes';

const WRITABLE_ROLES = new Set([USER_ROLES.MASTER, USER_ROLES.PURCHASING]);
const INITIAL_FORM = {
  materialCode: '',
  materialName: '',
  unit: 'un',
  quantity: '',
  direction: 'IN',
  reason: '',
  location: '',
};

export function StockScreen() {
  const theme = useTheme();
  const { createStockMovement, currentUser, openScreen, selectTab, selectedProject, stock } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const canWrite = WRITABLE_ROLES.has(currentUser?.role);
  const totalUnits = useMemo(
    () => stock.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [stock],
  );
  const setValue = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  async function saveMovement() {
    const quantity = Number(String(form.quantity).replace(',', '.'));
    if (!form.materialCode.trim() || !form.materialName.trim() || quantity <= 0) {
      Alert.alert('Dados incompletos', 'Informe código, material e quantidade.');
      return;
    }

    try {
      await createStockMovement({
        ...form,
        materialCode: form.materialCode.trim(),
        materialName: form.materialName.trim(),
        quantity,
      });
      setForm(INITIAL_FORM);
      setShowForm(false);
      Alert.alert('Estoque atualizado', 'A movimentação foi aplicada localmente na demonstração.');
    } catch (error) {
      Alert.alert('Não foi possível movimentar', error.message);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Estoque" />
      <Scroll>
        <Content>
          <View style={[styles.summary, { backgroundColor: theme.colors.primary }]}> 
            <Text style={styles.eyebrow}>{selectedProject.name.toUpperCase()}</Text>
            <Text style={styles.big}>{stock.length} materiais</Text>
            <Text style={styles.summaryText}>{totalUnits.toLocaleString('pt-BR')} unidades registradas</Text>
          </View>

          <View style={styles.actionRow}>
            <ActionCard
              background={theme.colors.primarySoft}
              color={theme.colors.primary}
              icon="list-outline"
              label="Catálogo de insumos"
              onPress={() => selectTab(TABS.MATERIALS)}
            />
            <ActionCard
              background={theme.colors.accentSoft}
              color={theme.colors.accent}
              icon="qr-code-outline"
              label="Gerar etiqueta"
              onPress={() => openScreen(SCREENS.LABEL)}
            />
            <ActionCard
              background={theme.colors.successSoft}
              color={theme.colors.success}
              icon="scan-outline"
              label="Ler QR Code"
              onPress={() => openScreen(SCREENS.SCANNER)}
            />
          </View>

          {canWrite && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={showForm ? 'Cancelar movimentação' : 'Nova movimentação de estoque'}
              onPress={() => setShowForm((value) => !value)}
              style={[styles.primary, { backgroundColor: theme.colors.accent }]}
            >
              <Ionicons name={showForm ? 'close' : 'swap-horizontal'} size={20} color="#FFFFFF" />
              <Text style={styles.primaryText}>{showForm ? 'Cancelar' : 'Nova movimentação'}</Text>
            </TouchableOpacity>
          )}

          {showForm && (
            <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <View style={styles.choiceRow}>
                <DirectionButton active={form.direction === 'IN'} color={theme.colors.success} background={theme.colors.successSoft} label="Entrada" onPress={() => setValue('direction')('IN')} theme={theme} />
                <DirectionButton active={form.direction === 'OUT'} color={theme.colors.danger} background={theme.colors.dangerSoft} label="Saída" onPress={() => setValue('direction')('OUT')} theme={theme} />
              </View>
              <Input label="CÓDIGO" value={form.materialCode} onChangeText={setValue('materialCode')} theme={theme} />
              <Input label="MATERIAL" value={form.materialName} onChangeText={setValue('materialName')} theme={theme} />
              <View style={styles.row}>
                <View style={styles.half}><Input label="UNIDADE" value={form.unit} onChangeText={setValue('unit')} theme={theme} /></View>
                <View style={styles.half}><Input label="QUANTIDADE" value={form.quantity} onChangeText={setValue('quantity')} keyboardType="decimal-pad" theme={theme} /></View>
              </View>
              <Input label="LOCAL" value={form.location} onChangeText={setValue('location')} theme={theme} />
              <Input label="MOTIVO" value={form.reason} onChangeText={setValue('reason')} theme={theme} />
              <TouchableOpacity accessibilityRole="button" onPress={saveMovement} style={[styles.save, { backgroundColor: theme.colors.primary }]}> 
                <Text style={styles.primaryText}>Salvar movimentação</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.section, { color: theme.colors.text }]}>Materiais cadastrados</Text>
          {!stock.length && <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Nenhum item no estoque. Registre um recebimento ou uma entrada.</Text>}
          {stock.map((item) => (
            <View
              accessible
              accessibilityLabel={`${item.name}, ${item.quantity} ${item.unit}`}
              key={item.id}
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <View style={[styles.icon, { backgroundColor: theme.colors.primarySoft }]}> 
                <Ionicons name="cube-outline" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.code, { color: theme.colors.primary }]}>{item.code}</Text>
                <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{item.location || 'Local não informado'}</Text>
              </View>
              <Text style={[styles.qty, { color: theme.colors.text }]}>{Number(item.quantity).toLocaleString('pt-BR')} {item.unit}</Text>
            </View>
          ))}
        </Content>
      </Scroll>
    </Screen>
  );
}

function ActionCard({ background, color, icon, label, onPress }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.action, { backgroundColor: background }]}> 
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DirectionButton({ active, background, color, label, onPress, theme }) {
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={[styles.choice, { borderColor: active ? color : theme.colors.border, backgroundColor: active ? background : theme.colors.background }]}
    >
      <Text style={{ color: theme.colors.text, fontWeight: '800' }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Input({ label, theme, ...props }) {
  return (
    <View style={styles.inputBlock}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { borderRadius: 22, marginTop: 18, padding: 18 },
  eyebrow: { color: 'rgba(255,255,255,.7)', fontSize: 10, fontWeight: '900' },
  big: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 8 },
  summaryText: { color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 3 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  action: { alignItems: 'center', borderRadius: 17, flex: 1, padding: 14 },
  actionText: { fontSize: 12, fontWeight: '900', marginTop: 7 },
  primary: { alignItems: 'center', borderRadius: 15, flexDirection: 'row', justifyContent: 'center', marginTop: 14, minHeight: 52 },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', marginLeft: 7 },
  form: { borderRadius: 18, borderWidth: 1, marginTop: 12, padding: 14 },
  choiceRow: { flexDirection: 'row', gap: 8 },
  choice: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, padding: 11 },
  inputBlock: { marginTop: 12 },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, minHeight: 48, paddingHorizontal: 12 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  save: { alignItems: 'center', borderRadius: 13, justifyContent: 'center', marginTop: 16, minHeight: 50 },
  section: { fontSize: 19, fontWeight: '900', marginBottom: 4, marginTop: 24 },
  empty: { fontSize: 13, lineHeight: 20, marginTop: 12, textAlign: 'center' },
  card: { alignItems: 'center', borderRadius: 17, borderWidth: 1, flexDirection: 'row', marginTop: 10, padding: 13 },
  icon: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  info: { flex: 1, marginLeft: 11 },
  code: { fontSize: 10, fontWeight: '900' },
  name: { fontSize: 14, fontWeight: '900', marginTop: 2 },
  meta: { fontSize: 10, marginTop: 3 },
  qty: { fontSize: 13, fontWeight: '900' },
});
