import {OrderApprovalPanel} from '../components/procurement/OrderApprovalPanel';
import {OriginCard} from '../components/procurement/OriginCard';
import {SupplierPicker} from '../components/forms/SupplierPicker';
import {OperationAttachments} from '../components/documents/OperationAttachments';
import {AccessibleIonicons as Ionicons} from '../components/accessibility/AccessibleNative';
import {AccessibleScrollView as ScrollView,AccessibleTextInput as TextInput,AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';

import { useEffect,useState } from 'react';
import { Alert} from 'react-native';
import {InventoryScreen,useInventoryTheme} from '../components/layout/InventoryScreen';
import {ProjectSelector} from '../components/budget/ProjectSelector';
import {SCREENS} from '../navigation/routes';
import {parseDecimal} from '../utils/bdi';
import {dateForDisplay} from '../utils/dates';
import {orderStage,filterOrders,prepareOrder} from '../utils/purchasePresentation';
import {operationsStyles as styles} from './Operations.styles';
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
  const theme = useInventoryTheme();
  const { createOrder, decideOrder, confirmPurchase, currentUser, orders, selectedProject, costInputs,currentScreen,openScreen } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving,setSaving]=useState(false);
  const [query,setQuery]=useState('');
  const [items,setItems]=useState([]);
  const [orderQuery,setOrderQuery]=useState(''),[filter,setFilter]=useState('Todos'),[busy,setBusy]=useState('');
  const title=currentScreen===SCREENS.ORDERS?'Pedidos':currentScreen===SCREENS.APPROVALS?'Aprovações':'Compras';
  useEffect(()=>{setFilter(currentScreen===SCREENS.APPROVALS?'Aguardando aprovação':'Todos');},[currentScreen]);
  useEffect(()=>{setShowForm(false);setForm(INITIAL_FORM);setItems([]);setQuery('');},[selectedProject?.id]);
  const visibleOrders=filterOrders(orders,filter,orderQuery);
  async function act(id,operation){if(busy)return;setBusy(id);try{await operation();}catch(e){Alert.alert('Não foi possível concluir',e.message);}finally{setBusy('');}}
  const canWrite = WRITABLE_ROLES.has(currentUser?.role);

  const setValue = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  function addItem() {
    const quantity = parseDecimal(form.quantity);
    const unitPrice = parseDecimal(form.unitPrice);

    if (!form.code.trim() || !Number.isFinite(quantity) || !Number.isFinite(unitPrice) || unitPrice<0 || quantity <= 0) {
      Alert.alert('Dados incompletos', 'Selecione um insumo e informe quantidade e preço.');
      return;
    }
    setItems(previous=>[...previous,{code:form.code,source:form.source,name:form.name,unit:form.unit,quantity,unitPrice}]);
    setForm(previous=>({...previous,code:'',name:'',quantity:'',unitPrice:''}));
    setQuery('');
  }
  async function saveOrder() {
    if(!form.supplierId || !form.supplier.trim() || !items.length) return Alert.alert('Dados incompletos','Informe o fornecedor e adicione os insumos ao pedido.');
    if (saving) return;
    setSaving(true);
    try {
      await createOrder(prepareOrder(form,items));
      setForm(INITIAL_FORM);
      setItems([]);
      setShowForm(false);
      Alert.alert('Pedido criado', 'Pedido salvo no Supabase e aguardando aprovação do gestor.');
    } catch (error) {
      Alert.alert('Erro ao criar pedido', error.message);
    } finally { setSaving(false); }
  }

  return (
    <InventoryScreen title={title}><ProjectSelector label="OBRA DOS PEDIDOS"/>
          {[USER_ROLES.MASTER,USER_ROLES.ENGINEERING,USER_ROLES.PURCHASING].includes(currentUser?.role)&&<TouchableOpacity accessibilityRole="button" accessibilityLabel="Mapa de cotações" style={styles.secondary} onPress={()=>openScreen(SCREENS.QUOTES)}><Ionicons name="documents-outline" size={22} color={theme.colors.accent}/><Text style={styles.secondaryText}>Mapa de cotações</Text></TouchableOpacity>}
          <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.eyebrow}>{selectedProject?.name?.toUpperCase()||'SELECIONE UMA OBRA'}</Text>
            <Text style={styles.big}>{orders.length} pedidos</Text>
            <Text style={styles.heroText}>Pedidos de compra e entregas previstas</Text>
          </View>

          <View style={styles.metrics}>{[['A aprovar',orders.filter(o=>orderStage(o)==='Aguardando aprovação').length],['Comprados',orders.filter(o=>o.purchased_at&&o.status!=='CANCELLED').length]].map(([label,value])=><View key={label} style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>)}</View>
          {!selectedProject&&<View style={styles.empty}><Text style={styles.name}>Escolha uma obra</Text><Text style={styles.meta}>Selecione a obra acima para acompanhar as aquisições.</Text></View>}
          {canWrite && selectedProject && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={showForm ? 'Cancelar novo pedido' : 'Criar novo pedido'}
              disabled={saving} onPress={() => setShowForm((value) => !value)}
              style={[styles.button, { backgroundColor: theme.colors.accent }]}
            >
              <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>{showForm ? 'Cancelar' : 'Novo pedido'}</Text>
            </TouchableOpacity>
          )}

          {showForm && (
            <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <SupplierPicker value={form.supplierId?{id:form.supplierId,name:form.supplier}:null} disabled={saving} onChange={s=>setForm(f=>({...f,supplier:s.name,supplierId:s.id}))}/>
              <Input label="PREVISÃO DE ENTREGA (DD/MM/AAAA)" value={form.expectedAt} onChangeText={setValue('expectedAt')} theme={theme} />
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
                <Text style={styles.buttonText}>{saving?'Salvando…':'Enviar para aprovação'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text accessibilityRole="header" style={styles.section}>Acompanhe os pedidos</Text>
          <TextInput accessibilityLabel="Buscar pedidos por fornecedor, número ou insumo" placeholder="Fornecedor, número ou insumo" value={orderQuery} onChangeText={setOrderQuery} style={styles.search}/>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>{['Todos','Aguardando aprovação','Aprovados','Comprados','Recebidos parcialmente','Recebidos','Rejeitados'].map(label=><TouchableOpacity key={label} accessibilityRole="button" accessibilityState={{selected:filter===label}} onPress={()=>setFilter(label)} style={[styles.chip,filter===label&&{backgroundColor:'#010028'}]}><Text style={[styles.chipText,filter===label&&{color:'white'}]}>{label}</Text></TouchableOpacity>)}</ScrollView>
          {!visibleOrders.length&&<View style={styles.empty}><Ionicons name="cart-outline" size={30} color="#0066BE"/><Text style={styles.name}>Nenhum pedido encontrado</Text><Text style={styles.meta}>Os pedidos desta obra aparecerão aqui. Confira os filtros ou crie um novo pedido.</Text></View>}
          {visibleOrders.map(order=><View key={order.id} style={styles.card}>
            <View style={styles.row}><View style={styles.icon}><Ionicons name="bag-handle-outline" size={24} color="#0066BE"/></View><View style={styles.info}><Text style={styles.name}>{order.supplier||'Fornecedor não informado'}</Text><Text selectable style={styles.meta}>{order.number}</Text></View></View>
            <View style={[styles.badge,{marginTop:14}]}><Text style={styles.badgeText}>{orderStage(order)}</Text></View>
            <Text style={styles.meta}>Entrega prevista: {dateForDisplay((order.expected_at||order.expectedAt||'').slice(0,10))||'Não informada'}</Text>
            <Text style={styles.total}>{formatCurrency(Number(order.total||0))}</Text>
            <OriginCard origin={order.origin_snapshot} traceVersion={order.trace_version} items={order.items}/>
            {!!order.quotation_id&&<Text style={styles.meta}>Pedido vinculado à cotação aprovada. Condições e justificativa preservadas no histórico.</Text>}
            <OperationAttachments kind="order" entityId={order.id} projectId={selectedProject.id}/>
            {(order.items||[]).map((item,index)=><Text key={item.id||index} style={styles.meta}>{item.quantity} {item.unit} · {item.name||item.description} · {formatCurrency(item.unitPrice)}</Text>)}
            <View style={styles.actions}>
             {['MASTER','ENGINEERING','PURCHASING'].includes(currentUser?.role)&&order.approval_status==='PENDING'&&<OrderApprovalPanel orderId={order.id} busy={!!busy} onDecide={(decision,reason)=>act(order.id,()=>decideOrder(order.id,decision,reason))}/>}
             {canWrite&&order.approval_status==='APPROVED'&&!order.purchased_at&&order.status!=='CANCELLED'&&<TouchableOpacity accessibilityRole="button" disabled={!!busy} onPress={()=>Alert.alert('Confirmar compra','Confirma que esta compra foi realizada? Ela passará a compor os custos reais.',[{text:'Cancelar',style:'cancel'},{text:'Confirmar',onPress:()=>act(order.id,()=>confirmPurchase(order.id))}])} style={styles.secondary}><Text style={styles.secondaryText}>{busy===order.id?'Confirmando…':'Confirmar compra realizada'}</Text></TouchableOpacity>}
             {canWrite&&order.purchased_at&&['SENT','PARTIALLY_RECEIVED'].includes(order.status)&&<TouchableOpacity accessibilityRole="button" onPress={()=>openScreen(SCREENS.RECEIPT)} style={styles.secondary}><Text style={styles.secondaryText}>Registrar recebimento</Text></TouchableOpacity>}
            </View>
          </View>)}
    </InventoryScreen>
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
