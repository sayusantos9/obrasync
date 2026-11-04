import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { InventoryScreen, useInventoryTheme, useInventoryStyles } from '../components/layout/InventoryScreen';
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
  const styles=useInventoryStyles(baseStyles);
  const theme = useInventoryTheme();
  const { createStockMovement, currentUser, openScreen, selectTab, selectedProject, stock, refreshOperations } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving,setSaving]=useState(false);
  const [query,setQuery]=useState('');
  const [onlyAvailable,setOnlyAvailable]=useState(false);
  const [refreshing,setRefreshing]=useState(false);
  const selectedItem=stock.find(i=>i.code===form.materialCode.trim());
  const filtered=useMemo(()=>stock.filter(i=>(!onlyAvailable||Number(i.quantity)>0)&&`${i.code} ${i.name}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase())),[stock,query,onlyAvailable]);
  const canWrite = WRITABLE_ROLES.has(currentUser?.role);
  const setValue = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  async function saveMovement() {
    const quantity = Number(String(form.quantity).replace(',', '.'));
    if (!stock.some(i=>i.code===form.materialCode.trim()) || !Number.isFinite(quantity) || quantity <= 0 || !form.reason.trim()) {
      Alert.alert('Dados incompletos', 'Informe um código já presente no estoque, quantidade e motivo. Insumos novos entram pelo recebimento de pedidos.');
      return;
    }

    if(saving) return;
    setSaving(true);
    try {
      await createStockMovement({
        ...form,
        materialCode: form.materialCode.trim(),
        materialName: selectedItem.name,
        unit: selectedItem.unit,
        quantity,
      });
      setForm(INITIAL_FORM);
      setShowForm(false);
      Alert.alert('Estoque atualizado', 'A movimentação foi registrada no Supabase.');
    } catch (error) {
      Alert.alert('Não foi possível movimentar', error.message);
    } finally { setSaving(false); }
  }

  return (
    <InventoryScreen title="Estoque da obra">
          <View style={[styles.summary, { backgroundColor: theme.colors.primary }]}> 
            <Text style={styles.eyebrow}>{selectedProject.name.toUpperCase()}</Text>
            <Text style={styles.big}>{stock.length} insumos no estoque</Text>
            <Text style={styles.summaryText}>Saldos por insumo e unidade, registrados no Supabase</Text>
          </View>

          <View style={styles.actionRow}>
            <ActionCard
              background={theme.colors.primarySoft}
              color={theme.colors.primary}
              icon="list-outline"
              label="Catálogo de insumos"
              onPress={() => selectTab(TABS.MATERIALS)}
            />
            {canWrite && <ActionCard
              background={theme.colors.accentSoft}
              color={theme.colors.accent}
              icon="qr-code-outline"
              label="Gerar etiqueta"
              onPress={() => openScreen(SCREENS.LABEL)}
            />}
            <ActionCard
              background={theme.colors.primarySoft}
              color={theme.colors.accent}
              icon="scan-outline"
              label="Ler QR Code"
              onPress={() => openScreen(SCREENS.SCANNER)}
            />
          </View>
          <View style={styles.actionRow}>
            {['MASTER','PURCHASING','REQUESTER'].includes(currentUser?.role)&&<ActionCard background={theme.colors.primarySoft} color={theme.colors.accent} icon="archive-outline" label="Receber pedido" onPress={()=>openScreen(SCREENS.RECEIPT)}/>}
            {['MASTER','PURCHASING','REQUESTER'].includes(currentUser?.role)&&<ActionCard background={theme.colors.primarySoft} color={theme.colors.accent} icon="swap-horizontal-outline" label="Consumo e transferências" onPress={()=>openScreen(SCREENS.TRANSFERS)}/>}
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
              <Input label="INSUMO IDENTIFICADO" value={selectedItem?.name||''} editable={false} placeholder="Informe um código do estoque" theme={theme} />
              <View style={styles.row}>
                <View style={styles.half}><Input label="UNIDADE" value={selectedItem?.unit||''} editable={false} theme={theme} /></View>
                <View style={styles.half}><Input label="QUANTIDADE" value={form.quantity} onChangeText={setValue('quantity')} keyboardType="decimal-pad" theme={theme} /></View>
              </View>
              <Input label="MOTIVO" value={form.reason} onChangeText={setValue('reason')} theme={theme} />
              <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={saveMovement} style={[styles.save, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.primaryText}>Salvar movimentação</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.section, { color: theme.colors.text }]}>Saldos da obra</Text>
          <Input label="BUSCAR NO ESTOQUE" value={query} onChangeText={setQuery} placeholder="Código ou nome do insumo" theme={theme}/>
          <View style={[styles.choiceRow,{marginTop:12}]}>{[false,true].map(value=><DirectionButton key={String(value)} active={onlyAvailable===value} background={theme.colors.primarySoft} color={theme.colors.accent} label={value?'Com saldo':'Todos'} onPress={()=>setOnlyAvailable(value)} theme={theme}/>)}</View>
          <TouchableOpacity accessibilityRole="button" disabled={refreshing} onPress={async()=>{setRefreshing(true);try{await refreshOperations();}catch(e){Alert.alert('Não foi possível atualizar',e.message);}finally{setRefreshing(false);}}} style={{paddingVertical:16,minHeight:44}}><Text style={{color:theme.colors.accent}}>{refreshing?'Atualizando...':`${filtered.length} insumo(s) · Atualizar saldos`}</Text></TouchableOpacity>
          {!filtered.length && <Text style={[styles.empty, { color: theme.colors.textMuted }]}>{stock.length?'Nenhum insumo corresponde aos filtros.':'O estoque está vazio. Registre o recebimento de um pedido para adicionar insumos.'}</Text>}
          {filtered.map((item) => (
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
              <View style={[styles.balance,{backgroundColor:theme.colors.primarySoft}]}><Text style={[styles.meta,{color:theme.colors.textMuted}]}>SALDO DISPONÍVEL</Text><Text style={[styles.qty, { color: theme.colors.accent }]}>{Number(item.quantity).toLocaleString('pt-BR')} {item.unit}</Text></View>
            </View>
          ))}
    </InventoryScreen>
  );
}

function ActionCard({ background, color, icon, label, onPress }) {
  const styles=useInventoryStyles(baseStyles);
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.action, { backgroundColor: background }]}> 
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DirectionButton({ active, background, color, label, onPress, theme }) {
  const styles=useInventoryStyles(baseStyles);
  return (
    <TouchableOpacity
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={[styles.choice, { borderColor: active ? color : theme.colors.border, backgroundColor: active ? background : theme.colors.background }]}
    >
      <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Input({ label, theme, ...props }) {
  const styles=useInventoryStyles(baseStyles);
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

const baseStyles = StyleSheet.create({
  summary: { borderRadius: 22, marginTop: 18, padding: 18 },
  eyebrow: { color: 'rgba(255,255,255,.7)', fontSize: 12, fontWeight: '700' },
  big: { color: '#FFFFFF', fontSize: 27, fontWeight: '700', marginTop: 8 },
  summaryText: { color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 3 },
  actionRow: { flexDirection: 'row', flexWrap:'wrap', gap: 10, marginTop: 14 },
  action: { alignItems: 'center', borderRadius: 17, flex: 1, minWidth:90, padding: 14 },
  actionText: { fontSize: 12, fontWeight: '700', marginTop: 7 },
  primary: { alignItems: 'center', borderRadius: 15, flexDirection: 'row', justifyContent: 'center', marginTop: 14, minHeight: 52 },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 7 },
  form: { borderRadius: 18, borderWidth: 1, marginTop: 12, padding: 14 },
  choiceRow: { flexDirection: 'row', gap: 8 },
  choice: { alignItems: 'center', borderRadius: 12, borderWidth: 1, flex: 1, padding: 11 },
  inputBlock: { marginTop: 12 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, minHeight: 48, paddingHorizontal: 12 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  save: { alignItems: 'center', borderRadius: 13, justifyContent: 'center', marginTop: 16, minHeight: 50 },
  section: { fontSize: 19, fontWeight: '700', marginBottom: 4, marginTop: 24 },
  empty: { fontSize: 13, lineHeight: 20, marginTop: 12, textAlign: 'center' },
  card: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', flexWrap:'wrap', marginTop: 12, padding: 16 },
  balance: {width:'100%',borderRadius:12,padding:12,marginTop:14},
  icon: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  info: { flex: 1, marginLeft: 11 },
  code: { fontSize: 12, fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  meta: { fontSize: 12, marginTop: 3 },
  qty: { fontSize: 13, fontWeight: '700' },
});
