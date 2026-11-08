import {QuoteRequestPicker} from '../components/procurement/QuoteRequestPicker';
import {OriginCard} from '../components/procurement/OriginCard';
import {prepareRequestItems} from '../utils/procurementTrace';
import {SupplierPicker} from '../components/forms/SupplierPicker';
import {useEffect,useState} from 'react';
import {Alert} from 'react-native';
import {useForm} from 'react-hook-form';
import {AccessibleView as View,AccessibleTouchableOpacity as Button} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';
import {InventoryScreen,useInventoryTheme} from '../components/layout/InventoryScreen';
import {ProjectSelector} from '../components/budget/ProjectSelector';
import {CostInputEditor} from '../components/budget/CostInputEditor';
import {CalendarField} from '../components/forms/CalendarField';
import {FormField} from '../components/forms/FormField';
import {useApp} from '../contexts/AppContext';
const defaults={title:'',roundTitle:'',supplierName:'',supplierDocument:'',supplierContact:'',supplierEmail:'',clientName:'',clientDocument:'',validUntil:'',expectedAt:'',paymentTerms:'',freight:'0',taxes:'0',discount:'0',notes:''};
export function CreateQuoteScreen(){
 const {addQuote,goBack,selectedProject,quotes=[],costInputs=[],currentScreenParams={}}=useApp(),theme=useInventoryTheme();
 const [supplier,setSupplier]=useState(null),[request,setRequest]=useState(null);
 const [items,setItems]=useState([]),[roundId,setRoundId]=useState(null);
 const {control,handleSubmit,reset,formState:{isSubmitting}}=useForm({defaultValues:defaults,shouldUnregister:true});
 useEffect(()=>{setRequest(null);setSupplier(null);setItems([]);setRoundId(null);reset(defaults);},[selectedProject?.id,reset]);
 const rounds=[...new Map(quotes.filter(q=>q.projectId===selectedProject?.id&&q.roundId&&!q.awardedQuoteId).map(q=>[q.roundId,q])).values()];
 const text={color:theme.colors.text,fontSize:14},heading={...text,fontSize:19,fontWeight:'700',marginTop:20},button={backgroundColor:theme.colors.primarySoft,padding:16,borderRadius:12,marginTop:10,minHeight:48};
 function chooseRound(q){Alert.alert('Usar itens da rodada?', 'Os itens atuais serão substituídos pelos mesmos insumos e quantidades desta rodada. Informe os preços do novo fornecedor.',[{text:'Cancelar',style:'cancel'},{text:'Usar rodada',onPress:()=>{setRoundId(q.roundId);setRequest(q.originSnapshot?.request?{...q.originSnapshot.request,needed_by:q.originSnapshot.request.neededBy}:null);setItems(q.items.map(i=>({...i,unitPrice:'',total:0})));}}]);}
 function chooseRequest(r){
  const existing=r?.round?quotes.find(q=>q.roundId===r.round.id):null;
  setRequest(r);setRoundId(r?.round?.id||null);
  setItems(existing?existing.items.map(i=>({...i,unitPrice:'',total:0})):prepareRequestItems(r,costInputs));
 }
 async function save(values){try{if(!supplier)throw new Error('Selecione um fornecedor cadastrado.');if(request&&items.length!==(request.items||[]).length)throw new Error('Associe todos os itens da solicitação ao catálogo.');const q=await addQuote({...values,requestId:request?.id||null,supplierId:supplier.id,supplierName:supplier.name,roundId,items});Alert.alert('Proposta salva',`${q.number}. Consulte o mapa comparativo em Cotações.`,[{text:'Concluir',onPress:goBack}]);}catch(e){Alert.alert('Revise a proposta',e.message);}}
 return <InventoryScreen title="Nova cotação" bottomTabs={false}><ProjectSelector label="OBRA DA COTAÇÃO"/>
 <View style={{padding:20,borderRadius:20,backgroundColor:theme.colors.primary,marginTop:16}}><Text style={{color:'#FFF',fontSize:24,fontWeight:'700'}}>Compare antes de comprar.</Text><Text style={{color:'#DCE4F0',marginTop:10}}>Uma rodada reúne propostas de fornecedores para os mesmos insumos, unidades e quantidades.</Text></View>
 <Text style={heading}>Rodada de cotações</Text><Button accessibilityRole="radio" accessibilityState={{checked:!roundId}} style={button} onPress={()=>{setRoundId(null);setRequest(null);setItems([]);}}><Text style={text}>{!roundId?'● ':'○ '}Criar nova rodada</Text></Button>
 {rounds.map(q=><Button key={q.roundId} accessibilityRole="radio" accessibilityState={{checked:roundId===q.roundId}} style={button} onPress={()=>chooseRound(q)}><Text style={text}>{roundId===q.roundId?'● ':'○ '}{q.roundTitle}</Text></Button>)}
 {!roundId&&<FormField control={control} name="roundTitle" label="NOME DA RODADA" rules={{required:'Informe o nome da rodada.'}} placeholder="Ex.: Elétrica — etapa 1"/>}
 <QuoteRequestPicker projectId={selectedProject?.id} initialRequestId={currentScreenParams.requestId} request={request} roundId={roundId} items={items} onChoose={chooseRequest} onMap={item=>setItems(previous=>[...previous.filter(i=>i.requestItemId!==item.requestItemId),item])} disabled={isSubmitting}/>
 {roundId&&<OriginCard origin={quotes.find(q=>q.roundId===roundId)?.originSnapshot} traceVersion={quotes.find(q=>q.roundId===roundId)?.traceVersion}/>}
 <FormField control={control} name="title" label="TÍTULO DA PROPOSTA" rules={{required:'Informe o título.'}}/>
 <Text style={heading}>Fornecedor e condições</Text>
 <SupplierPicker value={supplier} onChange={setSupplier} disabled={isSubmitting}/>
 <CalendarField control={control} name="validUntil" label="VALIDADE DA PROPOSTA" rules={{required:'Informe a validade.'}}/>
 <CalendarField control={control} name="expectedAt" label="ENTREGA PREVISTA" rules={{required:'Informe a entrega prevista.'}}/>
 <FormField control={control} name="paymentTerms" label="CONDIÇÃO DE PAGAMENTO" placeholder="Ex.: PIX ou boleto em 30 dias"/>
 <CostInputEditor editablePrices lockedItems={!!roundId||!!request} items={items} onChange={setItems} disabled={!selectedProject||isSubmitting}/>
 {roundId&&<Text style={text}>Mantenha os códigos, unidades e quantidades da rodada. O servidor rejeita propostas com itens incompatíveis.</Text>}
 <FormField control={control} name="freight" label="FRETE (R$)" keyboardType="decimal-pad"/>
 <FormField control={control} name="taxes" label="TRIBUTOS ADICIONAIS NÃO INCLUSOS (R$)" keyboardType="decimal-pad"/>
 <FormField control={control} name="discount" label="DESCONTO (R$)" keyboardType="decimal-pad"/>
 <FormField control={control} name="notes" label="ESPECIFICAÇÃO, MARCA E OBSERVAÇÕES" multiline placeholder="Registre diferenças de marca, garantia e condições para avaliação técnica."/>
 <Button accessibilityRole="button" accessibilityLabel="Salvar proposta" disabled={isSubmitting||!selectedProject} onPress={handleSubmit(save)} style={[button,{backgroundColor:theme.colors.accent,marginBottom:30,opacity:(isSubmitting||!selectedProject)?0.5:1}]}><Text style={{color:'#FFF',fontWeight:'700',textAlign:'center'}}>{isSubmitting?'Salvando…':'Salvar proposta'}</Text></Button>
 </InventoryScreen>;
}
