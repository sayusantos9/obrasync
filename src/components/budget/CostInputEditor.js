import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/currency';
import { parseDecimal,roundMoney } from '../../utils/bdi';
import { theme } from '../../theme';

const EMPTY={description:'',unit:'un',unitPrice:'',inputType:'MATERIAL'};
export function CostInputEditor({items,onChange,disabled}) {
  const {costInputs=[],createCostInput,refreshCostInputs}=useApp();
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState(null);
  const [quantity,setQuantity]=useState('1');
  const [creating,setCreating]=useState(false);
  const [draft,setDraft]=useState(EMPTY);
  const [loading,setLoading]=useState(false);
  const filtered=useMemo(()=>costInputs.filter(i=>[i.code,i.description,i.unit,i.inputType].some(x=>String(x||'').toLowerCase().includes(query.trim().toLowerCase()))).slice(0,40),[costInputs,query]);

  function addItem() {
    if (!selected) return Alert.alert('Selecione o insumo','Toque em um insumo da lista para continuar.');
    const q=parseDecimal(quantity);
    const p=Number(selected.unitPrice);
    if(!Number.isFinite(q)||q<=0)return Alert.alert('Quantidade inválida','Informe um coeficiente ou quantidade maior que zero.');
    const item={id:`TEMP-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,inputId:selected.id,code:selected.code,inputType:selected.inputType,
      description:selected.description,unit:selected.unit,quantity:q,unitPrice:p,total:roundMoney(q*p)};
    onChange([...items,item]);setSelected(null);setQuantity('1');setQuery('');
  }
  async function saveInput() {
    const price=parseDecimal(draft.unitPrice);
    if(!draft.description.trim()||!draft.unit.trim()||!Number.isFinite(price)||price<0) return Alert.alert('Dados incompletos','Informe nome, unidade e preço unitário válido.');
    setLoading(true);
    try{
      const created=await createCostInput({...draft,unitPrice:price});
      setDraft(EMPTY);setCreating(false);setSelected(created);
      Alert.alert('Insumo cadastrado',`Código gerado pelo banco: ${created.code}`);
    }catch(e){Alert.alert('Erro ao cadastrar insumo',e?.message||'Não foi possível salvar.');}
    finally{setLoading(false);}
  }
  return <View style={styles.root}>
    <Text style={styles.title}>Insumos do orçamento</Text>
    <Text style={styles.description}>Selecione um insumo por código, nome ou unidade. Quantidade/coeficiente × preço unitário = custo do item sem BDI.</Text>
    <View style={styles.searchRow}><TextInput placeholder="Pesquisar código ou nome do insumo" placeholderTextColor="#8692A4" style={[styles.input,{flex:1}]} value={query} onChangeText={setQuery} />
      <TouchableOpacity style={styles.refresh} onPress={()=>refreshCostInputs().catch(e=>Alert.alert('Erro',e.message))}><Ionicons name="refresh" size={21} color={theme.colors.primary}/></TouchableOpacity></View>
    <ScrollView nestedScrollEnabled style={styles.options}>
      {!filtered.length&&<Text style={styles.empty}>Nenhum insumo encontrado no catálogo da sua empresa. Cadastre um insumo abaixo ou importe a planilha no Supabase.</Text>}
      {filtered.map(item=><TouchableOpacity key={item.id} accessibilityRole="button" style={[styles.option,selected?.id===item.id&&styles.chosen]} onPress={()=>setSelected(item)}>
        <View style={{flex:1}}><Text style={styles.itemCode}>{item.code} • {item.inputType||'INSUMO'}</Text><Text style={styles.itemName}>{item.description}</Text><Text style={styles.itemSub}>{item.unit} • {formatCurrency(item.unitPrice)} / {item.unit}</Text></View>
        <Ionicons name={selected?.id===item.id?'checkmark-circle':'ellipse-outline'} size={22} color={theme.colors.primary}/>
      </TouchableOpacity>)}
    </ScrollView>
    {selected&&<View style={styles.selectedCard}>
      <Text style={styles.itemCode}>SELECIONADO: {selected.code}</Text><Text style={styles.itemName}>{selected.description}</Text>
      <Text style={styles.label}>QUANTIDADE / COEFICIENTE ({selected.unit})</Text>
      <TextInput keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} style={styles.input}/>
      <Text style={styles.estimate}>Custo do item: {formatCurrency(roundMoney((parseDecimal(quantity)||0)*Number(selected.unitPrice)))}</Text>
      <TouchableOpacity style={styles.save} onPress={addItem}><Ionicons name="add-circle-outline" color="#FFF" size={18}/><Text style={styles.white}>Adicionar ao orçamento</Text></TouchableOpacity>
    </View>}
    <TouchableOpacity style={styles.newInput} onPress={()=>setCreating(v=>!v)}><Ionicons name={creating?'close':'add'} size={18} color={theme.colors.primary}/><Text style={styles.newText}>{creating?'Fechar cadastro':'Cadastrar novo insumo (código automático)'}</Text></TouchableOpacity>
    {creating&&<View style={styles.form}>
      <Text style={styles.label}>NOME / DESCRIÇÃO</Text><TextInput value={draft.description} onChangeText={v=>setDraft(d=>({...d,description:v}))} placeholder="Ex.: Cabo de cobre 10 mm²" style={styles.input}/>
      <Text style={styles.label}>TIPO DE INSUMO</Text><View style={styles.types}>{['MATERIAL','MAO_DE_OBRA','EQUIPAMENTO','OUTROS'].map(t=><TouchableOpacity key={t} onPress={()=>setDraft(d=>({...d,inputType:t}))} style={[styles.type,draft.inputType===t&&styles.typeSelected]}><Text style={styles.typeName}>{t.replaceAll('_',' ')}</Text></TouchableOpacity>)}</View>
      <Text style={styles.label}>UNIDADE (UN, M, KG, H, M², M³...)</Text><TextInput value={draft.unit} onChangeText={v=>setDraft(d=>({...d,unit:v}))} style={styles.input}/>
      <Text style={styles.label}>PREÇO UNITÁRIO (R$)</Text><TextInput keyboardType="decimal-pad" value={draft.unitPrice} onChangeText={v=>setDraft(d=>({...d,unitPrice:v}))} placeholder="0,00" style={styles.input}/>
      <TouchableOpacity disabled={loading} style={styles.save} onPress={saveInput}><Text style={styles.white}>{loading?'Cadastrando...':'Salvar insumo no Supabase'}</Text></TouchableOpacity>
    </View>}
    <Text style={styles.title}>Itens selecionados ({items.length})</Text>
    {items.map((item,index)=><View key={item.id} style={styles.budgetItem}>
      <View style={{flex:1}}><Text style={styles.itemCode}>{index+1}. {item.code}</Text><Text style={styles.itemName}>{item.description}</Text><Text style={styles.itemSub}>{item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}</Text></View>
      <TouchableOpacity accessibilityLabel={`Excluir ${item.code}`} onPress={()=>onChange(items.filter(i=>i.id!==item.id))}><Ionicons name="trash-outline" color={theme.colors.danger} size={21}/></TouchableOpacity>
    </View>)}
  </View>;
}
const styles=StyleSheet.create({root:{marginTop:25},title:{color:theme.colors.text,fontSize:18,fontWeight:'900',marginTop:8},description:{color:theme.colors.textMuted,fontSize:12,lineHeight:19,marginTop:6},searchRow:{flexDirection:'row',marginTop:14,gap:7},input:{borderColor:theme.colors.border,borderWidth:1,borderRadius:12,backgroundColor:'#FFF',paddingHorizontal:12,minHeight:46,color:theme.colors.text,fontSize:14},refresh:{justifyContent:'center',paddingHorizontal:10},options:{maxHeight:220,backgroundColor:'#FFF',borderRadius:13,borderWidth:1,borderColor:theme.colors.border,marginTop:8},option:{flexDirection:'row',alignItems:'center',padding:12,gap:9,borderBottomWidth:.6,borderColor:theme.colors.border},chosen:{backgroundColor:theme.colors.primarySoft},itemCode:{fontSize:10,fontWeight:'900',color:theme.colors.primary},itemName:{fontSize:13,fontWeight:'800',color:theme.colors.text,marginTop:3},itemSub:{fontSize:11,color:theme.colors.textMuted,marginTop:3},empty:{padding:14,fontSize:12,color:theme.colors.textMuted,lineHeight:19},selectedCard:{backgroundColor:theme.colors.primarySoft,borderRadius:14,padding:14,marginTop:10},label:{fontSize:11,fontWeight:'800',color:theme.colors.textMuted,marginTop:13,marginBottom:5},estimate:{fontSize:12,color:theme.colors.primaryDark,fontWeight:'700',marginTop:10},save:{backgroundColor:theme.colors.primary,alignItems:'center',justifyContent:'center',minHeight:45,borderRadius:12,flexDirection:'row',gap:8,marginTop:14},white:{color:'#FFF',fontWeight:'900',fontSize:13},newInput:{flexDirection:'row',alignItems:'center',gap:8,padding:12,marginTop:14,backgroundColor:theme.colors.primarySoft,borderRadius:12},newText:{color:theme.colors.primary,fontSize:12,fontWeight:'900'},form:{padding:14,borderColor:theme.colors.border,borderWidth:1,borderRadius:14,marginTop:8},types:{flexDirection:'row',flexWrap:'wrap',gap:7},type:{padding:8,borderWidth:1,borderColor:theme.colors.border,borderRadius:8},typeSelected:{backgroundColor:theme.colors.primarySoft,borderColor:theme.colors.primary},typeName:{fontSize:10,fontWeight:'800',color:theme.colors.text},budgetItem:{backgroundColor:'#FFF',borderColor:theme.colors.border,borderWidth:1,borderRadius:12,flexDirection:'row',gap:7,alignItems:'center',padding:12,marginTop:8}});
