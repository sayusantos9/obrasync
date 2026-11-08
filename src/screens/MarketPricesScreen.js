import {AccessibleIonicons as Ionicons} from '../components/accessibility/AccessibleNative';
import {AccessibleTextInput as TextInput,AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';
import {useEffect,useMemo,useState,useRef} from 'react';
import {Alert,Linking,StyleSheet,Switch} from 'react-native';

import {PlanengenScreen,usePlanengenStyle} from '../components/layout/PlanengenScreen';
import {useApp} from '../contexts/AppContext';
import {fetchMarketPrices,saveMarketPrice,searchMarketPrices} from '../services/marketPriceService';
import {marketComparison} from '../utils/marketPrices';
import {parseDecimal} from '../utils/bdi';
import {formatCurrency} from '../utils/currency';

const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const empty=()=>({supplier:'',product:'',url:'',pack:'1',price:'',freight:'',date:today(),notes:'',verified:false,available:false});
function Field({label,value,onChangeText,numeric=false,...props}) {
 const {colors,text}=usePlanengenStyle();
 return <View style={styles.field}><Text style={text(styles.label)}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} keyboardType={numeric?'decimal-pad':'default'} placeholderTextColor={colors.muted} style={[styles.input,{color:colors.text,borderColor:colors.border}]} {...props}/></View>;
}
export function MarketPricesScreen() {
 const {selectedProject,currentUser}=useApp();
 return <MarketContent key={`${currentUser?.id}:${selectedProject?.id}`}/>;
}
function MarketContent() {
 const {selectedProject,currentUser,costInputs=[],budgetDocuments=[],refreshCostInputs,costInputsError}=useApp();
 const {colors,text}=usePlanengenStyle();
 const [offers,setOffers]=useState([]),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const [query,setQuery]=useState(''),[selected,setSelected]=useState(null),[budgetId,setBudgetId]=useState('');
 const [quantity,setQuantity]=useState('1'),[cep,setCep]=useState(''),[payment,setPayment]=useState('À vista');
 const [form,setForm]=useState(empty),[showForm,setShowForm]=useState(false),[saving,setSaving]=useState(false);
 const saveLock=useRef(false);
 const searchLock=useRef(false),searchVersion=useRef(0);
 const [store,setStore]=useState(''),[searching,setSearching]=useState(false),[searchError,setSearchError]=useState(''),[research,setResearch]=useState(null);
 const [searchTerm,setSearchTerm]=useState(''),[checkedOffers,setCheckedOffers]=useState({});
 useEffect(()=>{setSearchTerm(selected?.description||'');},[selected?.id,selected?.source]);
 useEffect(()=>{searchVersion.current++;setResearch(null);setSearchError('');setCheckedOffers({});},[selected?.id,selected?.source,searchTerm,store,quantity,cep,payment]);
 useEffect(()=>()=>{searchVersion.current++;},[]);
 async function search(){
  if(searchLock.current)return;
  if(!selected||searchTerm.trim().length<3||!validQuantity||postal.length!==8||payment.trim().length<2)return Alert.alert('Revise a pesquisa','Escolha o insumo e informe descrição, quantidade, CEP e pagamento.');
  const version=++searchVersion.current;searchLock.current=true;setSearching(true);setSearchError('');setResearch(null);
  try{const data=await searchMarketPrices({projectId:selectedProject.id,query:searchTerm.trim(),unit:selected.unit,store,quantity:qty,postalCode:postal,payment:payment.trim()});if(version===searchVersion.current)setResearch(data);}
  catch(e){if(version===searchVersion.current)setSearchError(e.message);}
  finally{searchLock.current=false;setSearching(false);}
 }
 const set=(key)=>(value)=>setForm(f=>({...f,[key]:value}));
 async function load(){setLoading(true);setError('');try{setOffers(await fetchMarketPrices(selectedProject.id));}catch(e){setError(e.message);}finally{setLoading(false);}}
 useEffect(()=>{if(selectedProject?.id)load();},[]);
 const budgets=budgetDocuments.filter(b=>b.projectId===selectedProject?.id);
 const budget=budgets.find(b=>b.id===budgetId);
 const planned=budget?.items.filter(i=>i.inputId===selected?.id && i.source===selected?.source && i.unit.trim().toLowerCase()===selected?.unit.trim().toLowerCase())||[];
 const plannedQuantity=planned.reduce((s,i)=>s+Number(i.quantity),0);
 const estimated=plannedQuantity>0?planned.reduce((s,i)=>s+Number(i.quantity)*Number(i.unitPrice),0)/plannedQuantity:null;
 const qty=parseDecimal(quantity),postal=cep.replace(/\D/g,'');
 const validQuantity=Number.isFinite(qty)&&qty>0;
 const history=offers.filter(o=>selected?.source==='shared'?o.catalog_input_id===selected.id:o.cost_input_id===selected?.id).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 const comparisons=useMemo(()=>marketComparison(history,validQuantity?qty:0,postal,payment),[offers,selected,quantity,cep,payment]);
 const best=validQuantity?comparisons.find(o=>o.eligible):null;
 const matches=costInputs.filter(i=>`${i.code} ${i.description}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,15);
 async function save() {
  if(saveLock.current)return;
  const price=parseDecimal(form.price),pack=parseDecimal(form.pack),freight=form.freight.trim()?parseDecimal(form.freight):null;
  const date=new Date(form.date+'T12:00:00Z');
  if(!selected||!validQuantity||postal.length!==8||payment.trim().length<2||form.supplier.trim().length<2||form.product.trim().length<2||!Number.isFinite(price)||price<0||!Number.isFinite(pack)||pack<=0||(freight!==null&&(!Number.isFinite(freight)||freight<0))||!/^\d{4}-\d{2}-\d{2}$/.test(form.date)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==form.date||form.date>today())return Alert.alert('Revise os dados','Informe loja, produto, quantidade, CEP, pagamento, data válida e valores não negativos. A embalagem deve conter uma quantidade maior que zero.');
  if(form.url.trim())try{const u=new URL(form.url.trim());if(!['http:','https:'].includes(u.protocol))throw Error();}catch{return Alert.alert('Link inválido','Use um endereço completo começando com https:// ou http://.');}
  saveLock.current=true;setSaving(true);
  try {
   const row=await saveMarketPrice({company_id:currentUser.companyId,project_id:selectedProject.id,catalog_input_id:selected.source==='shared'?selected.id:null,cost_input_id:selected.source==='company'?selected.id:null,unit:selected.unit,supplier:form.supplier.trim(),product:form.product.trim(),url:form.url.trim(),pack_quantity:pack,price,freight,surveyed_quantity:qty,postal_code:postal,payment:payment.trim(),observed_on:form.date,in_stock:form.available,verified_spec:form.verified,notes:form.notes.trim()});
   setOffers(old=>[row,...old]);setShowForm(false);setForm(empty());Alert.alert('Pesquisa salva','A oferta foi adicionada ao histórico. Nenhuma compra ou orçamento foi alterado.');
  }catch(e){Alert.alert('Não foi possível salvar',e.message);}finally{saveLock.current=false;setSaving(false);}
 }
 const button=(label,onPress,secondary=false,disabled=false)=><TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button,{backgroundColor:secondary?'#E7F2FE':colors.navy,opacity:disabled?0.5:1}]}><Text style={text(styles.buttonText,secondary?colors.blue:'#FFFFFF')}>{label}</Text></TouchableOpacity>;
 return <PlanengenScreen title="Preços de mercado">
  <View style={[styles.hero,{backgroundColor:colors.navy}]}><Ionicons name="pricetags-outline" size={28} color="#6AB9FF"/><Text style={text(styles.heading,'#FFFFFF')}>Pesquise antes de comprar.</Text><Text style={text(styles.body,'#D5E6FF')}>{selectedProject?.name} · Compare ofertas pesquisadas para o mesmo insumo e destino.</Text></View>
  <Text style={text(styles.note,colors.muted)}>Pesquise preços públicos nas lojas e compare com o orçamento. Os resultados trazem fontes para conferência; frete e disponibilidade precisam ser confirmados com a loja.</Text>
  <Text style={text(styles.section)}>1. Escolha o insumo</Text>
  <Field label="Buscar por código ou descrição" value={query} onChangeText={setQuery}/>
  {!!costInputsError&&<Text accessibilityRole="alert" style={text(styles.body,'#B42318')}>{costInputsError}</Text>}
  {(!selected||query.trim())&&matches.map(i=><TouchableOpacity accessibilityRole="button" key={i.source+i.id} onPress={()=>{setSelected(i);setQuery('');setShowForm(false);setForm(empty());}} style={[styles.option,{borderColor:colors.border}]}><Text style={text(styles.label,colors.blue)}>{i.code} · {i.unit}</Text><Text style={text(styles.body)}>{i.description}</Text></TouchableOpacity>)}
  {!costInputs.length&&button('Atualizar catálogo',()=>refreshCostInputs().catch(e=>Alert.alert('Erro',e.message)),true)}
  {selected&&<>
   <View style={[styles.card,{borderColor:colors.border}]}><Text style={text(styles.label,colors.blue)}>{selected.code}</Text><Text style={text(styles.section)}>{selected.description}</Text><Text style={text(styles.note,colors.muted)}>Referência do catálogo: {formatCurrency(selected.unitPrice)} / {selected.unit}. Esse valor não é uma pesquisa atual de loja.</Text></View>
   <Text style={text(styles.section)}>2. Defina a comparação</Text>
   <Text style={text(styles.note,colors.muted)}>Escolha um orçamento-base para medir a economia. Compare apenas produtos tecnicamente equivalentes.</Text>
   {button(budgetId?'Remover orçamento-base':'Sem orçamento-base',()=>setBudgetId(''),true)}
   {budgets.map(b=><TouchableOpacity accessibilityRole="radio" accessibilityState={{checked:b.id===budgetId}} key={b.id} onPress={()=>setBudgetId(b.id)} style={[styles.option,{borderColor:b.id===budgetId?colors.blue:colors.border}]}><Text style={text(styles.body)}>{b.id===budgetId?'✓ ':''}{b.title}</Text></TouchableOpacity>)}
   <Text style={text(styles.note,colors.muted)}>{estimated!==null?`Estimado no orçamento: ${formatCurrency(estimated)} / ${selected.unit}. Quantidade prevista: ${plannedQuantity}.`:'Sem preço estimado comparável no orçamento selecionado. Ainda é possível pesquisar ofertas.'}</Text>
   <Field label={`Quantidade necessária (${selected.unit})`} value={quantity} onChangeText={setQuantity} numeric/>
   <Field label="CEP de entrega (8 dígitos)" value={cep} onChangeText={setCep} keyboardType="number-pad" maxLength={9}/>
   <Field label="Condição de pagamento" value={payment} onChangeText={setPayment} placeholder="Ex.: À vista ou 3x sem juros"/>
   <View style={[styles.card,{borderColor:colors.border}]}>
    <Text style={text(styles.section)}>Pesquisa automática</Text>
    <Field label="Descrição para pesquisar nas lojas" value={searchTerm} onChangeText={setSearchTerm} maxLength={500} placeholder="Ex.: cimento branco 1kg"/>
    <Text style={text(styles.label)}>Onde pesquisar</Text>
    {[['','Todas as lojas integradas'],['potiguar','Potiguar'],['telhanorte','Telhanorte']].map(([id,label])=><TouchableOpacity accessibilityRole="radio" accessibilityState={{checked:store===id}} key={id} onPress={()=>setStore(id)} style={[styles.option,{borderColor:store===id?colors.blue:colors.border}]}><Text style={text(styles.body,store===id?colors.blue:colors.text)}>{store===id?'✓ ':''}{label}</Text></TouchableOpacity>)}
    <Text style={text(styles.note,colors.muted)}>Consulta direta aos sites, sem API de IA paga. Pesquisa geral cobre apenas as lojas integradas. CEP e pagamento não são confirmados pela busca: confira essas condições na loja.</Text>
    {button(searching?'Pesquisando nas lojas...':'Pesquisar e comparar',search,false,searching)}
    {!!searchError&&<Text accessibilityRole="alert" style={text(styles.body,'#B42318')}>{searchError}</Text>}
    {research&&<>
     <Text style={text(styles.note,colors.muted)}>Consultado em {new Date(research.searchedAt).toLocaleString('pt-BR')}</Text>
     {!!research.summary&&<Text style={text(styles.body)}>{research.summary}</Text>}
     {(research.stores||[]).map(s=><Text key={s.name} style={text(styles.note,s.status==='unavailable'?'#946000':colors.muted)}>{s.name}: {s.status==='ok'?'ofertas encontradas':s.status==='empty'?'nenhum preço compatível encontrado':'consulta indisponível; tente depois ou consulte o site'}</Text>)}
     {!research.offers.length&&<Text style={text(styles.body)}>Nenhum preço público verificável encontrado para esta pesquisa. Tente outra loja ou registre uma cotação manual.</Text>}
     {research.offers.map((o,index)=>{
      const packs=Math.ceil(qty/o.packQuantity),subtotal=packs*o.price,unitPrice=o.price/o.packQuantity;
      const comparable=o.unitKnown===true&&checkedOffers[o.url]===true;
      const difference=estimated!==null&&comparable?estimated*qty-subtotal:null;
      return <View key={o.url+index} style={[styles.option,{borderColor:colors.border}]}>
       <Text style={text(styles.section)}>{o.supplier}</Text><Text style={text(styles.body)}>{o.product}</Text>
       <Text style={text(styles.heading)}>{formatCurrency(o.price)} / embalagem</Text>
       {o.unitKnown?<Text style={text(styles.body)}>Embalagem identificada: {o.packQuantity} {o.unit} · {formatCurrency(unitPrice)} / {o.unit}</Text>:<Text style={text(styles.note,'#946000')}>Unidade da embalagem não identificada com segurança. Revise o cadastro para informar a quantidade correta em {selected.unit}.</Text>}
       {o.unitKnown&&<View style={styles.switchRow}><Text style={[text(styles.body),{flex:1}]}>Conferi que produto e embalagem correspondem ao insumo selecionado</Text><Switch accessibilityLabel={`Confirmar equivalência: ${o.product}`} value={!!checkedOffers[o.url]} onValueChange={v=>setCheckedOffers(old=>({...old,[o.url]:v}))}/></View>}
       {comparable?<Text style={text(styles.body)}>Para {qty} {selected.unit}: {packs} embalagem(ns), subtotal {formatCurrency(subtotal)} sem frete.</Text>:<Text style={text(styles.note,'#946000')}>Equivalência não confirmada. Não incluído na comparação com o orçamento.</Text>}
       {difference!==null&&<Text style={text(styles.body,colors.blue)}>{difference>=0?'Abaixo':'Acima'} do previsto: {formatCurrency(Math.abs(difference))}{estimated>0?` (${(Math.abs(difference)/(estimated*qty)*100).toFixed(1)}%)`:''}, sem frete e sujeito às condições da oferta.</Text>}
       {!!o.notes&&<Text style={text(styles.note,colors.muted)}>{o.notes}</Text>}
       {button('Ver preço na fonte',()=>Linking.openURL(o.url).catch(()=>Alert.alert('Não foi possível abrir o link')),true)}
       {button('Revisar e registrar oferta',()=>{setForm({...empty(),supplier:o.supplier,product:o.product,url:o.url,pack:o.unitKnown?String(o.packQuantity):'',price:String(o.price),notes:`Pesquisa direta ${research.searchedAt}. ${o.notes}. Conferir embalagem em ${selected.unit}, equivalência e condições.`,verified:false,available:false});setShowForm(true);},true)}
      </View>;
     })}
     {!!research.sources?.length&&<Text style={text(styles.label)}>Fontes consultadas</Text>}
     {(research.sources||[]).map(s=><TouchableOpacity key={s.url} accessibilityRole="link" onPress={()=>Linking.openURL(s.url).catch(()=>Alert.alert('Não foi possível abrir o link'))}><Text style={[text(styles.note,colors.blue),{textDecorationLine:'underline'}]}>{s.title||s.url}</Text></TouchableOpacity>)}
    </>}
   </View>
   {button(showForm?'Fechar cadastro de oferta':'Registrar oferta pesquisada',()=>setShowForm(v=>!v),false,saving)}
   {showForm&&<View style={[styles.card,{borderColor:colors.border}]}>
    <Text style={text(styles.section)}>Nova consulta</Text>
    <Text style={text(styles.note,colors.muted)}>Frete válido para {quantity} {selected.unit}, CEP {cep||'não informado'} e pagamento {payment||'não informado'}. Cada consulta é preservada no histórico.</Text>
    <Field label="Loja / fornecedor" value={form.supplier} onChangeText={set('supplier')} placeholder="Ex.: Potiguar — unidade consultada" maxLength={150}/>
    <Field label="Produto, marca e especificação" value={form.product} onChangeText={set('product')} maxLength={500}/>
    <Field label="Link da oferta (opcional)" value={form.url} onChangeText={set('url')} autoCapitalize="none" keyboardType="url"/>
    <Field label={`Quantidade por embalagem (${selected.unit})`} value={form.pack} onChangeText={set('pack')} numeric/>
    <Text style={text(styles.note,colors.muted)}>Exemplo: rolo de 100 m → quantidade por embalagem 100, se o insumo estiver em metros. Não converte unidades diferentes.</Text>
    <Field label="Preço por embalagem (R$)" value={form.price} onChangeText={set('price')} numeric/>
    <Field label="Frete total da quantidade pesquisada (R$)" value={form.freight} onChangeText={set('freight')} numeric placeholder="Vazio = desconhecido; 0 = gratuito ou retirada"/>
    <Field label="Data da consulta (AAAA-MM-DD)" value={form.date} onChangeText={set('date')} maxLength={10}/>
    <Field label="Observações / origem da cotação" value={form.notes} onChangeText={set('notes')} multiline/>
    {[['verified','Conferi a especificação e a equivalência com o insumo'],['available','Disponibilidade confirmada para a quantidade']].map(([key,label])=><View key={key} style={styles.switchRow}><Text style={[text(styles.body),{flex:1}]}>{label}</Text><Switch accessibilityLabel={label} value={form[key]} onValueChange={set(key)}/></View>)}
    {button(saving?'Salvando...':'Salvar pesquisa no Supabase',save,false,saving)}
   </View>}
   <Text style={text(styles.section)}>3. Compare as lojas consultadas</Text>
   <Text style={text(styles.note,colors.muted)}>Usamos a última consulta de cada produto, loja, CEP e pagamento. Consultas com mais de 7 dias precisam ser renovadas. Embalagens são arredondadas para cima.</Text>
   {!!error&&<Text accessibilityRole="alert" style={text(styles.body,'#B42318')}>{error}</Text>}
   {button(loading?'Atualizando...':'Atualizar ofertas',load,true,loading)}
   {!validQuantity&&<Text accessibilityRole="alert">Informe uma quantidade maior que zero.</Text>}
   {!best&&<Text style={text(styles.note,colors.muted)}>Sem oferta elegível para indicar o menor custo. Confira CEP, pagamento, quantidade, frete, disponibilidade e data.</Text>}
   {comparisons.map(o=><View key={o.id} style={[styles.card,{borderColor:best?.id===o.id?colors.blue:colors.border,borderWidth:best?.id===o.id?2:1}]}>
    {best?.id===o.id&&<Text style={text(styles.label,colors.blue)}>MENOR CUSTO ENTRE AS OFERTAS COMPARÁVEIS</Text>}
    <Text style={text(styles.section)}>{o.supplier}</Text><Text style={text(styles.body)}>{o.product}</Text>
    <Text style={text(styles.heading)}>{formatCurrency(o.unitPrice)} / {selected.unit}</Text>
    <Text style={text(styles.note,colors.muted)}>{o.observed_on} · CEP {o.postal_code} · {o.payment}</Text>
    <Text style={text(styles.body)}>{o.packs} embalagem(ns) · {o.freight==null?'Subtotal sem frete':'Total com frete'}: {formatCurrency(o.total)}</Text>
    {o.eligible&&estimated!==null&&<Text style={text(styles.body,colors.blue)}>Diferença do orçamento para {qty} {selected.unit}: {formatCurrency(estimated*qty-o.total)} {estimated*qty>=o.total?'de economia potencial':'(acima do estimado)'}</Text>}
    {o.reasons.map(r=><Text key={r} style={text(styles.note,'#946000')}>• {r}</Text>)}
    {!!o.url&&button('Abrir oferta na loja',()=>Linking.openURL(o.url).catch(()=>Alert.alert('Não foi possível abrir o link')),true)}
   </View>)}
   <Text style={text(styles.section)}>Histórico de consultas · {history.length}</Text>
   {history.map(o=><View key={o.id} style={[styles.option,{borderColor:colors.border}]}><Text style={text(styles.label)}>{o.observed_on} · {o.supplier}</Text><Text style={text(styles.body)}>{formatCurrency(Number(o.price))} / embalagem de {o.pack_quantity} {o.unit}</Text><Text style={text(styles.note,colors.muted)}>{o.product} · {o.payment} · CEP {o.postal_code}{o.notes?` · ${o.notes}`:''}</Text></View>)}
  </>}
 </PlanengenScreen>;
}
const styles=StyleSheet.create({hero:{padding:22,borderRadius:20,gap:10},heading:{fontSize:23,fontWeight:'700'},body:{fontSize:14,lineHeight:22},note:{fontSize:12,lineHeight:19,marginTop:8},section:{fontSize:18,fontWeight:'700',marginTop:18,marginBottom:8},label:{fontSize:12,fontWeight:'700',marginBottom:6},field:{marginTop:16},input:{borderWidth:1,borderRadius:12,backgroundColor:'#FFFFFF',minHeight:48,padding:12,fontSize:16},card:{borderWidth:1,borderRadius:18,padding:18,backgroundColor:'#FFFFFF',marginTop:16},option:{borderWidth:1,borderRadius:12,padding:14,backgroundColor:'#FFFFFF',marginTop:8},button:{padding:15,minHeight:48,borderRadius:12,alignItems:'center',marginTop:14},buttonText:{fontSize:14,fontWeight:'700'},switchRow:{flexDirection:'row',alignItems:'center',gap:12,marginTop:16}});
