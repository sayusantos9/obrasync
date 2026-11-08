import {BudgetImportPanel} from '../components/budget/BudgetImportPanel';
import {dateForDisplay} from '../utils/dates';
import {AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet} from 'react-native';
import { useForm } from 'react-hook-form';
import { ProjectSelector } from '../components/budget/ProjectSelector';
import { CostInputEditor } from '../components/budget/CostInputEditor';
import { BdiEditor } from '../components/budget/BdiEditor';
import { CalendarField } from '../components/forms/CalendarField';
import { FormField } from '../components/forms/FormField';
import { InventoryScreen } from '../components/layout/InventoryScreen';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import {useCompanyBdi} from '../hooks/useCompanyBdi';
import { DEFAULT_COMPANY_BDI,budgetBdiSnapshot,parseDecimal,calculateBdi,calculateBudget } from '../utils/bdi';
import { formatCurrency } from '../utils/currency';
import { useInventoryTheme, useInventoryStyles } from '../components/layout/InventoryScreen';

const DEFAULT_VALUES={title:'',clientDocument:'',clientPhone:'',validUntil:'',notes:'',baseDate:'',revisionReason:''};
export function CreateBudgetScreen() {
  const theme = useInventoryTheme();
  const styles = useInventoryStyles(makeStyles(theme));
  const {addBudgetDocument,goBack,members=[],selectedProject,budgetDocuments=[],currentUser}=useApp();
  const [revisionOf,setRevisionOf]=useState(null);
  const [importFile,setImportFile]=useState(null);
  const [showRevisions,setShowRevisions]=useState(false);
  const [items,setItems]=useState([]);
  const [bdi,setBdi]=useState({...DEFAULT_COMPANY_BDI});
  const companyBdi=useCompanyBdi(currentUser?.companyId),bdiEdited=useRef(false);
  const [clientUserId,setClientUserId]=useState(null);
  const {control,handleSubmit,setValue,reset,formState:{isSubmitting}}=useForm({defaultValues:DEFAULT_VALUES,shouldUnregister:true});
  useEffect(()=>{setItems([]);setImportFile(null);setRevisionOf(null);bdiEdited.current=false;setBdi(companyBdi.record?.config||{...DEFAULT_COMPANY_BDI});setClientUserId(null);reset(DEFAULT_VALUES);},[selectedProject?.id,reset]);
  useEffect(()=>{if(companyBdi.record&&!bdiEdited.current&&!revisionOf)setBdi(companyBdi.record.config);},[companyBdi.record,revisionOf]);
  function changeBdi(value){bdiEdited.current=true;setBdi(value);}
  async function saveBdiDefault(){try{await companyBdi.save(bdi);Alert.alert('Padrão salvo','Novos orçamentos usarão este padrão. As versões já salvas não serão alteradas.');}catch(e){Alert.alert('Não foi possível salvar o padrão',e.message);}}
  function chooseRevision(doc){
    Alert.alert('Revisar orçamento','Substituir o rascunho pelos dados desta versão? A versão anterior será preservada.',[{text:'Cancelar',style:'cancel'},{text:'Criar revisão',onPress:()=>{
      setRevisionOf(doc.id);setItems(doc.items.map(i=>({...i})));changeBdi(budgetBdiSnapshot(doc));setClientUserId(doc.clientUserId);setImportFile(null);
      setValue('title',doc.title);setValue('notes',doc.notes);setValue('baseDate',dateForDisplay(doc.baseDate));setValue('revisionReason','');setValue('clientDocument',doc.clientDocument);setValue('clientPhone',doc.clientPhone);setValue('validUntil',dateForDisplay(doc.validUntil));setShowRevisions(false);
    }}]);
  }
  const clients=useMemo(()=>members.filter(m=>m.role===USER_ROLES.CLIENT&&m.active!==false),[members]);
  let result=null,error='';try{if(items.length)result=calculateBudget(items,bdi);else calculateBdi(bdi);}catch(e){error=e.message;}
  async function save(values){
    if(companyBdi.loading||companyBdi.error)return Alert.alert('Padrão de BDI indisponível','Recarregue o padrão da empresa antes de salvar.');
    if(!selectedProject?.id)return Alert.alert('Obra obrigatória','Escolha ou cadastre uma obra no seletor.');
    let calculated;
    try{calculated=calculateBudget(items,bdi);}catch(e){return Alert.alert('Revise o orçamento',e.message);}
    try{
      await addBudgetDocument({...values,revisionOf,importFile,clientUserId,clientEmail:clients.find(c=>c.id===clientUserId)?.email||'',
        ...calculated,items:calculated.items});
      Alert.alert('Orçamento salvo',`Subtotal ${formatCurrency(calculated.subtotal)} + BDI ${formatCurrency(calculated.bdiAmount)} = ${formatCurrency(calculated.total)}.\nAgora você pode gerar PDF e Excel.`,[{text:'Concluir',onPress:goBack}]);
    }catch(e){Alert.alert('Erro ao salvar',e?.message||'Não foi possível salvar o orçamento.');}
  }
  return <InventoryScreen title="Novo orçamento" bottomTabs={false}><View style={styles.intro}><Text style={styles.introTag}>ORÇAMENTO POR INSUMOS</Text><Text style={styles.introTitle}>Planeje cada detalhe.</Text><Text style={styles.introText}>Escolha os insumos, informe as quantidades e aplique BDI somente quando necessário.</Text></View>
    <ProjectSelector label="OBRA DO ORÇAMENTO"/>
    <TouchableOpacity accessibilityRole="button" style={styles.client} onPress={()=>setShowRevisions(v=>!v)}><Text style={styles.clientText}>{revisionOf?'Revisão de '+budgetDocuments.find(b=>b.id===revisionOf)?.number:'Novo documento independente'} · Escolher versão anterior</Text></TouchableOpacity>
    {showRevisions&&budgetDocuments.filter(b=>b.projectId===selectedProject?.id).map(b=><TouchableOpacity accessibilityRole="button" key={b.id} style={styles.client} onPress={()=>chooseRevision(b)}><Text style={styles.clientText}>{b.number} · revisão {b.revisionNumber} · {b.title}</Text></TouchableOpacity>)}
    {revisionOf&&<TouchableOpacity accessibilityRole="button" style={styles.client} onPress={()=>{setRevisionOf(null);setValue('revisionReason','');}}><Text style={styles.clientText}>Usar rascunho como documento independente</Text></TouchableOpacity>}
    {revisionOf&&<FormField control={control} name="revisionReason" label="MOTIVO DA REVISÃO" rules={{required:'Informe o motivo.',minLength:{value:5,message:'Use pelo menos 5 caracteres.'}}}/>}
    <Text style={styles.title}>01 / Identificação</Text>
    <FormField control={control} name="title" label="OBJETO / DESCRIÇÃO" placeholder="Ex.: Iluminação pública da obra" rules={{required:'Informe o objeto do orçamento.'}}/>
    <CalendarField control={control} name="baseDate" label="DATA-BASE DOS PREÇOS" rules={{required:"Informe a data-base dos preços."}}/>
    <CalendarField control={control} name="validUntil" label="VALIDADE (OPCIONAL)"/>
    <Text style={styles.title}>02 / Cliente (opcional)</Text>
    <Text style={styles.hint}>Vincule a um cliente cadastrado para que ele possa ver o orçamento na própria conta. Não é obrigatório para gerar o orçamento da obra.</Text>
    {clients.map(c=><TouchableOpacity key={c.id} accessibilityRole="button" accessibilityState={{selected:clientUserId===c.id}} style={[styles.client,clientUserId===c.id&&styles.selected]} onPress={()=>setClientUserId(clientUserId===c.id?null:c.id)}><Text style={styles.clientText}>{clientUserId===c.id?'◉':'○'} {c.name} • {c.email}</Text></TouchableOpacity>)}
    <FormField control={control} name="clientDocument" label="CPF / CNPJ (OPCIONAL)" placeholder="00.000.000/0001-00"/>
    <BudgetImportPanel key={selectedProject?.id||"none"} disabled={!selectedProject||isSubmitting} onApply={(rows,file)=>{setItems(rows);setImportFile(file);}}/>
    {!!importFile&&<Text style={styles.hint}>Original vinculado: {importFile.name}. Alterações manuais não alteram o arquivo original.</Text>}
    <CostInputEditor items={items} onChange={setItems} disabled={!selectedProject}/>
    {companyBdi.loading&&<Text style={styles.hint}>Carregando padrão de BDI da empresa…</Text>}
    {!!companyBdi.error&&<Text accessibilityRole="alert" style={styles.error}>{companyBdi.error}</Text>}
    <BdiEditor value={bdi} onChange={changeBdi} subtotal={items.reduce((sum,i)=>sum+(Number.isFinite(parseDecimal(i.quantity)*parseDecimal(i.unitPrice))?Math.round(parseDecimal(i.quantity)*parseDecimal(i.unitPrice)*100)/100:0),0)} disabled={isSubmitting||companyBdi.loading||companyBdi.saving}/>
    <Text style={styles.hint}>{revisionOf?'Configuração preservada da versão escolhida.':'O padrão da empresa é sugerido para este orçamento; ajustes ficam nesta versão.'}</Text>
    <TouchableOpacity accessibilityRole="button" disabled={isSubmitting||companyBdi.loading||companyBdi.saving||!companyBdi.record} style={styles.client} onPress={()=>changeBdi(companyBdi.record.config)}><Text style={styles.clientText}>Usar padrão da empresa neste orçamento</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" disabled={isSubmitting||companyBdi.loading||companyBdi.saving||!companyBdi.record||!!error} style={styles.client} onPress={saveBdiDefault}><Text style={styles.clientText}>{companyBdi.saving?'Salvando padrão…':'Salvar este BDI como padrão da empresa'}</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" disabled={companyBdi.loading||companyBdi.saving} style={styles.client} onPress={companyBdi.reload}><Text style={styles.clientText}>Recarregar padrão de BDI salvo</Text></TouchableOpacity>
    <View style={styles.summary}><Text style={styles.title}>Resumo do cálculo</Text>
      <View style={styles.row}><Text style={styles.hint}>Subtotal dos insumos</Text><Text style={styles.amount}>{formatCurrency(result?.subtotal||0)}</Text></View>
      <View style={styles.row}><Text style={styles.hint}>BDI ({result?.bdiRate ?? '—'}%)</Text><Text style={styles.amount}>{formatCurrency(result?.bdiAmount||0)}</Text></View>
      <View style={[styles.row,styles.highlight]}><Text style={styles.big}>{bdi.enabled===false?'TOTAL DO ORÇAMENTO':'TOTAL COM BDI'}</Text><Text style={styles.big}>{formatCurrency(result?.total||0)}</Text></View>
      <Text style={styles.hint}>Coeficiente × preço unitário = custo do insumo. Quando ativado, o BDI é aplicado uma única vez ao subtotal.</Text>
    </View>
    {!!error&&<Text style={styles.error}>{error}</Text>}
    <FormField control={control} multiline name="notes" label="OBSERVAÇÕES" placeholder="Escopo, condições, preços de referência..."/>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Salvar orçamento" disabled={isSubmitting||companyBdi.loading||companyBdi.saving||!!companyBdi.error||!selectedProject||!result} style={[styles.button,(!selectedProject||!result||isSubmitting)&&styles.disabled]} onPress={handleSubmit(save)}><Text style={styles.buttonText}>{isSubmitting?'Salvando orçamento...':'Salvar orçamento'}</Text></TouchableOpacity>
    <View style={{height:50}}/>
  </InventoryScreen>;
}
const makeStyles = (theme) => StyleSheet.create({amount:{fontSize:14,color:theme.colors.text,fontWeight:'600'},intro:{backgroundColor:theme.colors.primary,borderRadius:18,padding:20},introTag:{fontSize:10,color:'#8DCBFF',fontWeight:'700',letterSpacing:1},introTitle:{fontSize:24,color:'#FFFFFF',fontWeight:'700',marginTop:12},introText:{fontSize:13,color:'#DCE4F0',marginTop:8},title:{fontSize:18,fontWeight:'700',color:theme.colors.text,marginTop:24,marginBottom:4},hint:{color:theme.colors.textMuted,fontSize:11,lineHeight:17,marginTop:5},client:{backgroundColor:'#FFF',borderWidth:1,borderColor:theme.colors.border,borderRadius:12,marginTop:8,padding:12},selected:{borderColor:theme.colors.primary,backgroundColor:theme.colors.primarySoft},clientText:{fontSize:12,fontWeight:'700',color:theme.colors.text},summary:{padding:16,borderWidth:1,borderRadius:18,borderColor:theme.colors.border,backgroundColor:'#FFF',marginTop:18},row:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',marginTop:11,gap:8},highlight:{borderTopColor:theme.colors.border,borderTopWidth:1,paddingTop:14},big:{fontSize:15,color:theme.colors.primaryDark,fontWeight:'700'},error:{fontSize:12,color:theme.colors.danger,marginTop:10},button:{borderRadius:14,backgroundColor:theme.colors.primary,padding:16,alignItems:'center',marginVertical:20},disabled:{opacity:.45},buttonText:{color:'#FFF',fontSize:13,fontWeight:'700',textAlign:'center'}});
