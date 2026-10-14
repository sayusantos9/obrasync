import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';

function TransferField({ label, theme, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
        {...inputProps}
      />
    </View>
  );
}

export function TransfersScreen() {
  const theme = useTheme();
  const { createStockMovement, stock } = useApp();
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [destination, setDestination] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const material = useMemo(() => {
    const normalizedCode = code.trim().toLowerCase();
    return stock.find((item) => item.code?.toLowerCase() === normalizedCode);
  }, [code, stock]);

  async function handleTransfer() {
    const numericQuantity = Number(quantity.replace(',', '.'));

    if (!material) {
      Alert.alert('Material não encontrado', 'Informe um código existente no estoque.');
      return;
    }

    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      Alert.alert('Quantidade inválida', 'Informe uma quantidade maior que zero.');
      return;
    }

    if (numericQuantity > Number(material.quantity)) {
      Alert.alert('Saldo insuficiente', 'A quantidade é maior que o saldo disponível.');
      return;
    }

    if (!destination.trim()) {
      Alert.alert('Destino obrigatório', 'Informe o destino da transferência.');
      return;
    }

    setIsSaving(true);
    try {
      await createStockMovement({
        materialCode: material.code,
        materialName: material.name,
        unit: material.unit,
        quantity: numericQuantity,
        direction: 'OUT',
        reason: `Transferência para ${destination.trim()}`,
      });

      setCode('');
      setQuantity('');
      setDestination('');
      Alert.alert('Transferência registrada', 'A movimentação foi registrada localmente.');
    } catch (error) {
      Alert.alert('Não foi possível transferir', error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Transferências" />
      <Scroll>
        <Content>
          <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}> 
            <View style={[styles.heroIcon, { backgroundColor: theme.colors.accent }]}> 
              <Ionicons name="swap-horizontal" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Transferir material</Text>
              <Text style={styles.heroText}>
                Registre a saída para outro setor, depósito ou canteiro.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.form,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <TransferField
              autoCapitalize="characters"
              label="CÓDIGO DO MATERIAL"
              onChangeText={setCode}
              placeholder="Ex.: ACO-014"
              theme={theme}
              value={code}
            />

            {material && (
              <View style={[styles.materialFound, { backgroundColor: theme.colors.successSoft }]}> 
                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
                <Text style={[styles.materialFoundText, { color: theme.colors.success }]}> 
                  {material.name} • saldo {material.quantity} {material.unit}
                </Text>
              </View>
            )}

            <TransferField
              keyboardType="decimal-pad"
              label="QUANTIDADE"
              onChangeText={setQuantity}
              placeholder="0"
              theme={theme}
              value={quantity}
            />
            <TransferField
              label="DESTINO"
              onChangeText={setDestination}
              placeholder="Ex.: Almoxarifado bloco B"
              theme={theme}
              value={destination}
            />

            <TouchableOpacity
              accessibilityRole="button"
              disabled={isSaving}
              onPress={handleTransfer}
              style={[
                styles.button,
                { backgroundColor: theme.colors.accent },
                isSaving && styles.disabled,
              ]}
            >
              <Ionicons name="swap-horizontal" size={19} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {isSaving ? 'Registrando...' : 'Registrar transferência'}
              </Text>
            </TouchableOpacity>
          </View>
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    borderRadius: 22,
    flexDirection: 'row',
    marginTop: 18,
    padding: 18,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 15,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  heroCopy: { flex: 1, marginLeft: 13 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  heroText: {
    color: 'rgba(255,255,255,.76)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  form: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 110,
    marginTop: 16,
    padding: 14,
  },
  field: { marginTop: 12 },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 6 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  materialFound: {
    alignItems: 'center',
    borderRadius: 11,
    flexDirection: 'row',
    marginTop: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  materialFoundText: { flex: 1, fontSize: 11, fontWeight: '800', marginLeft: 7 },
  button: {
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 54,
  },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', marginLeft: 7 },
  disabled: { opacity: 0.6 },
});
