import {AccessibleIonicons as Ionicons} from '../components/accessibility/AccessibleNative';
import {AccessibleTextInput as TextInput,AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';

import { useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
} from 'react-native';
import { InventoryScreen, useInventoryTheme, useInventoryStyles } from '../components/layout/InventoryScreen';
import { useApp } from '../contexts/AppContext';

function TransferField({ label, theme, ...inputProps }) {
  const styles=useInventoryStyles(baseStyles);
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
  const styles=useInventoryStyles(baseStyles);
  const theme = useInventoryTheme();
  const { createStockMovement, stock, projects, selectedProject, currentUser } = useApp();
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationProjectId,setDestinationProjectId]=useState('');
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
        destinationProjectId: destinationProjectId || null,
        direction: 'OUT',
        reason: destination.trim(),
      });

      setCode('');
      setQuantity('');
      setDestination('');
      setDestinationProjectId('');
      Alert.alert('Movimentação registrada', 'Movimentação e saldo atualizados no Supabase.');
    } catch (error) {
      Alert.alert('Não foi possível transferir', error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <InventoryScreen title="Consumo e transferências">
          <Text style={{color:theme.colors.text,marginTop:12}}>Para consumo, descreva o local/motivo no destino. Para transferir, selecione outra obra abaixo.</Text>
          <TouchableOpacity accessibilityRole="radio" accessibilityState={{checked:!destinationProjectId}} onPress={()=>setDestinationProjectId('')} style={{padding:12}}><Text style={{color:theme.colors.primary}}>{!destinationProjectId?'✓ ':''}Consumo nesta obra</Text></TouchableOpacity>
          {currentUser?.role!=='REQUESTER' && projects.filter(p=>p.id!==selectedProject?.id).map(p=><TouchableOpacity key={p.id} accessibilityRole="radio" accessibilityState={{checked:destinationProjectId===p.id}} onPress={()=>setDestinationProjectId(p.id)} style={{padding:12}}><Text style={{color:theme.colors.primary}}>{destinationProjectId===p.id?'✓ ':''}Transferir para {p.name}</Text></TouchableOpacity>)}
          <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
          <View style={[styles.heroIcon, { backgroundColor: theme.colors.accent }]}>
              <Ionicons name="swap-horizontal" size={26} color="#FFFFFF" />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{destinationProjectId?'Transferir insumo':'Registrar consumo'}</Text>
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
              label="MOTIVO / LOCAL DE UTILIZAÇÃO"
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
                {isSaving ? 'Registrando...' : 'Registrar movimentação'}
              </Text>
            </TouchableOpacity>
          </View>
    </InventoryScreen>
  );
}

const baseStyles = StyleSheet.create({
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
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  heroText: {
    color: 'rgba(255,255,255,.76)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  form: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    marginTop: 16,
    padding: 14,
  },
  field: { marginTop: 12 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
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
  materialFoundText: { flex: 1, fontSize: 11, fontWeight: '600', marginLeft: 7 },
  button: {
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 54,
  },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 7 },
  disabled: { opacity: 0.6 },
});
