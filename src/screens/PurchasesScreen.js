import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { formatCurrency } from '../utils/currency';

const WRITABLE_ROLES = new Set([USER_ROLES.MASTER, USER_ROLES.PURCHASING]);
const INITIAL_FORM = {
  supplier: '',
  expectedAt: '',
  code: '',
  name: '',
  unit: 'un',
  quantity: '',
  unitPrice: '', freight: '', taxes: '', discount: '',
};

export function PurchasesScreen() {
  const theme = useTheme();
  const { createOrder, decideOrder, confirmPurchase, currentUser, orders, selectedProject, costInputs } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving,setSaving]=useState(false);
  const [query,setQuery]=useState('');
  const [items,setItems]=useState([]);
  const canWrite = WRITABLE_ROLES.has(currentUser?.role);

  const setValue = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  function addItem() {
    const quantity = Number(String(form.quantity).replace(',', '.'));
    const unitPrice = Number(String(form.unitPrice).replace(',', '.'));

    if (!form.code.trim() || !Number.isFinite(quantity) || !Number.isFinite(unitPrice) || unitPrice<0 || quantity <= 0) {
      Alert.alert('Dados incompletos', 'Selecione um insumo e informe quantidade e preço.');
      return;
    }
    setItems(previous=>[...previous,{code:form.code,source:form.source,name:form.name,unit:form.unit,quantity,unitPrice}]);
    setForm(previous=>({...previous,code:'',name:'',quantity:'',unitPrice:''}));
    setQuery('');
  }
  async function saveOrder() {
    if(!form.supplier.trim() || !items.length) return Alert.alert('Dados incompletos','Informe o fornecedor e adicione os insumos ao pedido.');
    if (saving) return;
    setSaving(true);
    try {
      await createOrder({
        supplier: form.supplier.trim(),
        expectedAt: form.expectedAt || null,
        freight: Number(form.freight.replace(',', '.') || 0), taxes: Number(form.taxes.replace(',', '.') || 0), discount: Number(form.discount.replace(',', '.') || 0),
        items,
      });
      setForm(INITIAL_FORM);
      setItems([]);
      setShowForm(false);
      Alert.alert('Pedido criado', 'Pedido salvo no Supabase e aguardando aprovação do gestor.');
    } catch (error) {
      Alert.alert('Erro ao criar pedido', error.message);
    } finally { setSaving(false); }
  }

  return (
    <Screen>
      <ScreenHeader title="Compras" />
      <Scroll>
        <Content>
          <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}> 
            <Text style={styles.eyebrow}>{selectedProject.name.toUpperCase()}</Text>
            <Text style={styles.big}>{orders.length} pedidos</Text>
            <Text style={styles.heroText}>Pedidos de compra e entregas previstas</Text>
          </View>

          {canWrite && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={showForm ? 'Cancelar novo pedido' : 'Criar novo pedido'}
              onPress={() => setShowForm((value) => !value)}
              style={[styles.button, { backgroundColor: theme.colors.accent }]}
            >
              <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>{showForm ? 'Cancelar' : 'Novo pedido'}</Text>
            </TouchableOpacity>
          )}

          {showForm && (
            <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <Input label="FORNECEDOR" value={form.supplier} onChangeText={setValue('supplier')} theme={theme} />
              <Input label="PREVISÃO (AAAA-MM-DD)" value={form.expectedAt} onChangeText={setValue('expectedAt')} theme={theme} />
              <Input label="BUSCAR INSUMO POR NOME OU CÓDIGO" value={query} onChangeText={setQuery} theme={theme}/>
              {(query.trim()?costInputs.filter(i=>`${i.code} ${i.description}`.toLowerCase().includes(query.toLowerCase())).slice(0,12):[]).map(i=><TouchableOpacity key={i.source+i.id} accessibilityRole="button" onPress={()=>{setForm(f=>({...f,code:i.code,source:i.source,name:i.description,unit:i.unit,unitPrice:String(i.unitPrice)}));setQuery('');}} style={{padding:12,borderBottomWidth:1,borderColor:theme.colors.border}}><Text style={{color:theme.colors.text}}>{i.code} · {i.description} ({i.unit})</Text></TouchableOpacity>)}
              {!!form.code && <Text style={{color:theme.colors.text,marginTop:12}}>Selecionado: {form.code} · {form.name}</Text>}
              <View style={styles.row}>
                <View style={styles.half}><Input label="QTD." value={form.quantity} onChangeText={setValue('quantity')} keyboardType="decimal-pad" theme={theme} /></View>
                <View style={styles.half}><Input label="UNIDADE DO INSUMO" editable={false} value={form.unit} theme={theme} /></View>
              </View>
              <Input label="VALOR UNITÁRIO" value={form.unitPrice} onChangeText={setValue('unitPrice')} keyboardType="decimal-pad" theme={theme} />
              <TouchableOpacity accessibilityRole="button" onPress={addItem} style={[styles.save,{backgroundColor:theme.colors.primary}]}><Text style={styles.buttonText}>Adicionar item ao pedido</Text></TouchableOpacity>
              {items.map((i,index)=><View key={index} style={{marginTop:12}}><Text style={{color:theme.colors.text}}>{i.code} · {i.quantity} {i.unit} × {formatCurrency(i.unitPrice)}</Text><TouchableOpacity accessibilityRole="button" onPress={()=>setItems(list=>list.filter((_,n)=>n!==index))}><Text style={{color:theme.colors.danger,paddingVertical:8}}>Remover item</Text></TouchableOpacity></View>)}
              <Input label="FRETE (R$)" value={form.freight} onChangeText={setValue('freight')} keyboardType="decimal-pad" theme={theme}/>
              <Input label="TRIBUTOS NÃO RECUPERÁVEIS (R$)" value={form.taxes} onChangeText={setValue('taxes')} keyboardType="decimal-pad" theme={theme}/>
              <Input label="DESCONTO (R$)" value={form.discount} onChangeText={setValue('discount')} keyboardType="decimal-pad" theme={theme}/>
              <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={saveOrder} style={[styles.save, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.buttonText}>Salvar pedido</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.section, { color: theme.colors.text }]}>Pedidos cadastrados</Text>
          {!orders.length && <Text style={[styles.empty, { color: theme.colors.textMuted }]}>Nenhum pedido criado para esta obra.</Text>}
          {orders.map((order) => (
            <View
              accessible
              accessibilityLabel={`${order.number}, fornecedor ${order.supplier}, status ${order.status}`}
              key={order.id}
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <View style={[styles.icon, { backgroundColor: theme.colors.accentSoft }]}> 
                <Ionicons name="cart-outline" size={22} color={theme.colors.accent} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.colors.text }]}>{order.number} • {order.supplier}</Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{order.expected_at || order.expectedAt || 'Sem previsão'} • {order.status}</Text>
              </View>
              {currentUser?.role === USER_ROLES.MASTER && order.approval_status === 'PENDING' && <View>
                <TouchableOpacity accessibilityRole="button" onPress={() => decideOrder(order.id,true).catch(e=>Alert.alert('Erro',e.message))}><Text style={{padding:12,color:theme.colors.primary}}>Aprovar</Text></TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" onPress={() => decideOrder(order.id,false).catch(e=>Alert.alert('Erro',e.message))}><Text style={{padding:12,color:theme.colors.danger}}>Rejeitar</Text></TouchableOpacity>
              </View>}
              {canWrite && order.approval_status==='APPROVED' && !order.purchased_at && <TouchableOpacity accessibilityRole="button" onPress={()=>confirmPurchase(order.id).catch(e=>Alert.alert('Erro',e.message))}><Text style={{padding:12,color:theme.colors.primary}}>Confirmar compra realizada</Text></TouchableOpacity>}
              <Text style={[styles.total, { color: theme.colors.primary }]}>{formatCurrency(Number(order.total || 0))}</Text>
            </View>
          ))}
        </Content>
      </Scroll>
    </Screen>
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
  hero: { borderRadius: 22, marginTop: 18, padding: 18 },
  eyebrow: { color: 'rgba(255,255,255,.68)', fontSize: 10, fontWeight: '900' },
  big: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 7 },
  heroText: { color: 'rgba(255,255,255,.76)', fontSize: 12, marginTop: 4 },
  button: { alignItems: 'center', borderRadius: 15, flexDirection: 'row', justifyContent: 'center', marginTop: 14, minHeight: 52 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', marginLeft: 6 },
  form: { borderRadius: 18, borderWidth: 1, marginTop: 12, padding: 14 },
  inputBlock: { marginTop: 11 },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 5 },
  input: { borderRadius: 12, borderWidth: 1, minHeight: 47, paddingHorizontal: 12 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  save: { alignItems: 'center', borderRadius: 13, justifyContent: 'center', marginTop: 15, minHeight: 50 },
  section: { fontSize: 19, fontWeight: '900', marginTop: 24 },
  empty: { fontSize: 13, marginTop: 14, textAlign: 'center' },
  card: { alignItems: 'center', borderRadius: 17, borderWidth: 1, flexDirection: 'row', flexWrap:'wrap', gap:8, marginTop: 10, padding: 13 },
  icon: { alignItems: 'center', borderRadius: 13, height: 44, justifyContent: 'center', width: 44 },
  info: { flex: 1, marginLeft: 11 },
  name: { fontSize: 13, fontWeight: '900' },
  meta: { fontSize: 10, marginTop: 4 },
  total: { fontSize: 12, fontWeight: '900' },
});
