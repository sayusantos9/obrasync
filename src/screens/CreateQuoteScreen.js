import { useState } from 'react';
import { ProjectSelector } from '../components/budget/ProjectSelector';
import { Alert,StyleSheet,Text,TouchableOpacity,View } from 'react-native';
import { useForm } from 'react-hook-form';
import { LineItemsEditor } from '../components/documents/LineItemsEditor';
import { CalendarField } from '../components/forms/CalendarField';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { QUOTE_TEMPLATE } from '../data/quoteTemplate';
import { TABS } from '../navigation/routes';
import { theme } from '../theme';

const DEFAULT_VALUES={title:'',clientName:'',clientDocument:'',supplierName:'',supplierDocument:'',supplierContact:'',supplierEmail:'',validUntil:'',paymentTerms:'',notes:''};
export function CreateQuoteScreen(){
 const {addQuote,goBack,selectedProject,selectTab}=useApp();
 const [items,setItems]=useState([]);
 const {control,handleSubmit,setValue,formState:{isSubmitting}}=useForm({defaultValues:DEFAULT_VALUES});
 function applyTemplate(){
   setValue('title',QUOTE_TEMPLATE.title,{shouldValidate:true});
   setValue('paymentTerms',QUOTE_TEMPLATE.paymentTerms);
   setValue('notes',QUOTE_TEMPLATE.notes);
   Alert.alert('Modelo-base aplicado','Preencha os dados reais do fornecedor, o cliente, a validade e os itens. Nenhum preço fictício foi adicionado.');
 }
 async function save(formValues){
   if(!selectedProject?.id){Alert.alert('Obra obrigatória','Selecione uma obra antes de salvar.');return;}
   if(!items.length){Alert.alert('Cotação sem itens','Adicione pelo menos um material ou serviço.');return;}
   try{const q=await addQuote({...formValues,items});
     Alert.alert('Cotação salva no Supabase',`${q.number} • ${q.items.length} item(ns).`,[{text:'Concluir',onPress:goBack}]);
   }catch(error){Alert.alert('Erro ao salvar cotação',error?.message||'Revise a conexão e tente novamente.');}
 }
 return <Screen><ScreenHeader title="Nova cotação"/><Scroll><Content>
   <ProjectSelector label="OBRA DA COTAÇÃO"/>
   <View style={styles.projectCard}><Text style={styles.projectLabel}>OBRA ATIVA</Text><Text style={styles.projectName}>{selectedProject?.name||'Nenhuma obra selecionada'}</Text>
     {!selectedProject&&<TouchableOpacity style={styles.choose} onPress={()=>selectTab(TABS.PROJECTS)}><Text style={styles.chooseText}>Selecionar obra</Text></TouchableOpacity>}</View>
   <View style={styles.model}><Text style={styles.modelTitle}>Modelo-base de cotação</Text><Text style={styles.modelDesc}>Estrutura sugerida: identificação, cliente, fornecedor, condição de pagamento, validade e itens com valores reais.</Text>
     <TouchableOpacity style={styles.modelButton} onPress={applyTemplate}><Text style={styles.modelText}>Usar modelo-base</Text></TouchableOpacity></View>
   <Text style={styles.section}>Identificação</Text><FormField control={control} name="title" label="TÍTULO / REFERÊNCIA" placeholder="Ex.: Cotação de materiais elétricos" rules={{required:'Informe o título.'}}/>
   <Text style={styles.section}>Cliente</Text><FormField control={control} name="clientName" label="NOME / RAZÃO SOCIAL" placeholder="Cliente" rules={{required:'Informe o cliente.'}}/>
   <FormField control={control} name="clientDocument" label="CPF / CNPJ" placeholder="00.000.000/0001-00"/>
   <Text style={styles.section}>Fornecedor</Text><FormField control={control} name="supplierName" label="NOME / RAZÃO SOCIAL" placeholder="Fornecedor" rules={{required:'Informe o fornecedor.'}}/>
   <FormField control={control} name="supplierDocument" label="CNPJ" placeholder="00.000.000/0001-00"/>
   <FormField control={control} name="supplierContact" label="CONTATO" placeholder="Nome ou telefone"/>
   <FormField control={control} autoCapitalize="none" keyboardType="email-address" name="supplierEmail" label="E-MAIL" placeholder="vendas@fornecedor.com" rules={{pattern:{value:/^$|\S+@\S+\.\S+$/,message:'E-mail inválido.'}}}/>
   <CalendarField control={control} name="validUntil" label="VALIDADE DA COTAÇÃO" rules={{required:'Informe a validade.'}}/>
   <FormField control={control} name="paymentTerms" label="CONDIÇÃO DE PAGAMENTO" placeholder="Ex.: PIX, boleto, 30 dias"/>
   <LineItemsEditor items={items} onChange={setItems} title="Materiais e serviços cotados"/>
   <FormField control={control} multiline name="notes" label="OBSERVAÇÕES" placeholder="Frete, entrega e garantia"/>
   <TouchableOpacity disabled={isSubmitting||!selectedProject} onPress={handleSubmit(save)} style={[styles.save,(isSubmitting||!selectedProject)&&{opacity:.5}]}><Text style={styles.saveText}>{isSubmitting?'Salvando...':'Salvar cotação'}</Text></TouchableOpacity>
 </Content></Scroll></Screen>;
}
const styles=StyleSheet.create({projectCard:{backgroundColor:theme.colors.primarySoft,borderRadius:16,marginTop:20,padding:16},projectLabel:{color:theme.colors.primary,fontSize:11,fontWeight:'900'},projectName:{color:theme.colors.primaryDark,fontSize:16,fontWeight:'900',marginTop:4},choose:{backgroundColor:'#FFF',borderRadius:9,marginTop:12,padding:12,alignSelf:'flex-start'},chooseText:{color:theme.colors.primary,fontWeight:'900'},section:{color:theme.colors.text,fontSize:18,fontWeight:'900',marginTop:24},model:{backgroundColor:'#FFF',borderColor:theme.colors.border,borderWidth:1,borderRadius:16,padding:16,marginTop:17},modelTitle:{color:theme.colors.text,fontSize:16,fontWeight:'900'},modelDesc:{color:theme.colors.textMuted,fontSize:12,marginTop:5,lineHeight:17},modelButton:{backgroundColor:theme.colors.accentSoft,padding:13,marginTop:12,borderRadius:10,alignItems:'center'},modelText:{color:theme.colors.primaryDark,fontWeight:'900'},save:{backgroundColor:theme.colors.primary,borderRadius:16,marginVertical:25,minHeight:56,alignItems:'center',justifyContent:'center'},saveText:{color:'#FFF',fontSize:16,fontWeight:'900'}});
