import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { ProjectSelector } from '../components/budget/ProjectSelector';
import { CostInputEditor } from '../components/budget/CostInputEditor';
import { BdiEditor } from '../components/budget/BdiEditor';
import { CalendarField } from '../components/forms/CalendarField';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { DEFAULT_BDI,calculateBdi,calculateBudget } from '../utils/bdi';
import { formatCurrency } from '../utils/currency';
import { theme } from '../theme';

const DEFAULT_VALUES={title:'',clientDocument:'',clientPhone:'',validUntil:'',notes:''};
export function CreateBudgetScreen() {
  const {addBudgetDocument,goBack,members=[],selectedProject,currentUser}=useApp();
  const [items,setItems]=useState([]);
  const [bdi,setBdi]=useState({...DEFAULT_BDI});
  const [clientUserId,setClientUserId]=useState(null);
  const {control,handleSubmit,formState:{isSubmitting}}=useForm({defaultValues:DEFAULT_VALUES});
  const clients=useMemo(()=>members.filter(m=>m.role===USER_ROLES.CLIENT&&m.active!==false),[members]);
  let result=null,error='';try{if(items.length)result=calculateBudget(items,bdi);else calculateBdi(bdi);}catch(e){error=e.message;}
  async function save(values){
    if(!selectedProject?.id)return Alert.alert('Obra obrigatória','Escolha ou cadastre uma obra no seletor.');
    let calculated;
    try{calculated=calculateBudget(items,bdi);}catch(e){return Alert.alert('Revise o orçamento',e.message);}
    try{
      await addBudgetDocument({...values,clientUserId,clientEmail:clients.find(c=>c.id===clientUserId)?.email||'',
        ...calculated,items:calculated.items});
      Alert.alert('Orçamento salvo',`Subtotal ${formatCurrency(calculated.subtotal)} + BDI ${formatCurrency(calculated.bdiAmount)} = ${formatCurrency(calculated.total)}.\nAgora você pode gerar PDF e Excel.`,[{text:'Concluir',onPress:goBack}]);
    }catch(e){Alert.alert('Erro ao salvar',e?.message||'Não foi possível salvar o orçamento.');}
  }
  return <Screen><ScreenHeader title="Orçamento por insumos"/><Scroll><Content>
    <ProjectSelector label="OBRA DO ORÇAMENTO"/>
    <Text style={styles.title}>Identificação do orçamento</Text>
    <FormField control={control} name="title" label="OBJETO / DESCRIÇÃO" placeholder="Ex.: Iluminação pública da obra" rules={{required:'Informe o objeto do orçamento.'}}/>
    <CalendarField control={control} name="validUntil" label="VALIDADE (OPCIONAL)"/>
    <Text style={styles.title}>Cliente (opcional)</Text>
    <Text style={styles.hint}>Vincule a um cliente cadastrado para que ele possa ver o orçamento na própria conta. Não é obrigatório para gerar o orçamento da obra.</Text>
    {clients.map(c=><TouchableOpacity key={c.id} style={[styles.client,clientUserId===c.id&&styles.selected]} onPress={()=>setClientUserId(clientUserId===c.id?null:c.id)}><Text style={styles.clientText}>{clientUserId===c.id?'◉':'○'} {c.name} • {c.email}</Text></TouchableOpacity>)}
    <FormField control={control} name="clientDocument" label="CPF / CNPJ (OPCIONAL)" placeholder="00.000.000/0001-00"/>
    <CostInputEditor items={items} onChange={setItems} disabled={!selectedProject}/>
    <BdiEditor value={bdi} onChange={setBdi}/>
    <View style={styles.summary}><Text style={styles.title}>Resumo do cálculo</Text>
      <View style={styles.row}><Text>Insumos — subtotal sem BDI</Text><Text>{formatCurrency(result?.subtotal||0)}</Text></View>
      <View style={styles.row}><Text>BDI ({result?.bdiRate ?? '—'}%)</Text><Text>{formatCurrency(result?.bdiAmount||0)}</Text></View>
      <View style={[styles.row,styles.highlight]}><Text style={styles.big}>TOTAL COM BDI</Text><Text style={styles.big}>{formatCurrency(result?.total||0)}</Text></View>
      <Text style={styles.hint}>Coeficiente × preço unitário = custo do insumo. O BDI é aplicado uma única vez ao subtotal.</Text>
    </View>
    {!!error&&<Text style={styles.error}>{error}</Text>}
    <FormField control={control} multiline name="notes" label="OBSERVAÇÕES" placeholder="Escopo, condições, preços de referência..."/>
    <TouchableOpacity disabled={isSubmitting||!selectedProject||!result} style={[styles.button,(!selectedProject||!result||isSubmitting)&&styles.disabled]} onPress={handleSubmit(save)}><Text style={styles.buttonText}>{isSubmitting?'Salvando no Supabase...':'Salvar orçamento e disponibilizar PDF / Excel'}</Text></TouchableOpacity>
    <View style={{height:50}}/>
  </Content></Scroll></Screen>;
}
const styles=StyleSheet.create({title:{fontSize:18,fontWeight:'900',color:theme.colors.text,marginTop:24,marginBottom:4},hint:{color:theme.colors.textMuted,fontSize:11,lineHeight:17,marginTop:5},client:{backgroundColor:'#FFF',borderWidth:1,borderColor:theme.colors.border,borderRadius:12,marginTop:8,padding:12},selected:{borderColor:theme.colors.primary,backgroundColor:theme.colors.primarySoft},clientText:{fontSize:12,fontWeight:'700',color:theme.colors.text},summary:{padding:16,borderWidth:1,borderRadius:18,borderColor:theme.colors.border,backgroundColor:'#FFF',marginTop:18},row:{flexDirection:'row',justifyContent:'space-between',marginTop:11,gap:8},highlight:{borderTopColor:theme.colors.border,borderTopWidth:1,paddingTop:14},big:{fontSize:15,color:theme.colors.primaryDark,fontWeight:'900'},error:{fontSize:12,color:theme.colors.danger,marginTop:10},button:{borderRadius:14,backgroundColor:theme.colors.primary,padding:16,alignItems:'center',marginVertical:20},disabled:{opacity:.45},buttonText:{color:'#FFF',fontSize:13,fontWeight:'900',textAlign:'center'}});
