import {useEffect,useRef,useState} from 'react';
import {Alert,Switch} from 'react-native';
import {useForm} from 'react-hook-form';
import {AccessibleView as View,AccessibleTouchableOpacity as Button,AccessibleTextInput as TextInput} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';
import {InventoryScreen,useInventoryTheme} from '../components/layout/InventoryScreen';
import {FormField} from '../components/forms/FormField';
import {useApp} from '../contexts/AppContext';
import {fetchSuppliers,saveSupplier} from '../services/supplierService';
import {supplierMatches} from '../utils/suppliers';
const empty={name:'',document:'',email:'',phone:'',contactName:''};
export function SuppliersScreen(){
 const theme=useInventoryTheme(),{currentUser}=useApp(),canEdit=['MASTER','PURCHASING'].includes(currentUser?.role);
 const [rows,setRows]=useState([]),[query,setQuery]=useState(''),[filter,setFilter]=useState('Ativos'),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0),[editing,setEditing]=useState(null),[active,setActive]=useState(true),[limit,setLimit]=useState(20),[saved,setSaved]=useState('');
 const lock=useRef(false),{control,reset,handleSubmit,formState:{isSubmitting}}=useForm({defaultValues:empty});
 useEffect(()=>{let live=true;setLoading(true);setError('');fetchSuppliers().then(data=>{if(live)setRows(data);}).catch(e=>{if(live)setError(e.message);}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[currentUser?.id,currentUser?.companyId,revision]);
 useEffect(()=>setLimit(20),[query,filter]);
 const txt={color:theme.colors.text,fontSize:15,lineHeight:22},card={padding:18,marginTop:14,borderRadius:18,borderWidth:1,borderColor:theme.colors.border,backgroundColor:theme.colors.surface},button={padding:14,minHeight:48,borderRadius:12,marginTop:10,backgroundColor:theme.colors.primarySoft};
 function edit(s){setEditing(s||{});setActive(s?.active!==false);reset(s?{name:s.name,document:s.document||'',email:s.email||'',phone:s.phone||'',contactName:s.contact_name||''}:empty);setSaved('');}
 async function save(values){if(lock.current)return;lock.current=true;try{await saveSupplier({...values,id:editing?.id,updatedAt:editing?.updated_at,active});setEditing(null);setSaved('Fornecedor salvo. As referências dos pedidos anteriores foram preservadas.');setRevision(n=>n+1);}catch(e){Alert.alert('Não foi possível salvar',e.message);}finally{lock.current=false;}}
 const visible=rows.filter(s=>(filter==='Todos'||s.active===(filter==='Ativos'))&&supplierMatches(s,query));
 return <InventoryScreen key={editing?'editing':'list'} title="Fornecedores"><View style={[card,{backgroundColor:theme.colors.primary}]}><Text style={{color:'#FFF',fontSize:25,fontWeight:'700'}}>Parceiros da sua obra.</Text><Text style={{color:'#D5E6FF',marginTop:10}}>Cadastros da empresa, compartilhados entre suas obras. Mantenha contatos e identificação atualizados.</Text></View>
 {!!saved&&<Text accessibilityLiveRegion="polite" style={[txt,{marginTop:15}]}>{saved}</Text>}
 {canEdit&&!editing&&<Button accessibilityRole="button" style={button} onPress={()=>edit(null)}><Text style={txt}>+ Novo fornecedor</Text></Button>}
 {editing&&<View style={card}><Text accessibilityRole="header" style={{...txt,fontSize:20,fontWeight:'700'}}>{editing.id?'Editar fornecedor':'Novo fornecedor'}</Text>
 <FormField control={control} name="name" label="NOME / RAZÃO SOCIAL" rules={{required:'Informe o nome.'}}/>
 <FormField control={control} name="document" label="DOCUMENTO (CPF/CNPJ OU IDENTIFICAÇÃO)" autoCapitalize="characters"/>
 <FormField control={control} name="contactName" label="PESSOA DE CONTATO"/>
 <FormField control={control} name="email" label="E-MAIL" keyboardType="email-address" autoCapitalize="none"/>
 <FormField control={control} name="phone" label="TELEFONE COM DDD" keyboardType="phone-pad"/>
 <Text style={txt}>Nome obrigatório; demais campos opcionais. A identificação não substitui a verificação cadastral do fornecedor.</Text>
 {!!editing.id&&<View style={{flexDirection:'row',alignItems:'center',marginTop:12}}><Text style={[txt,{flex:1}]}>Disponível para novas compras</Text><Switch accessibilityLabel="Fornecedor ativo" value={active} disabled={isSubmitting} onValueChange={setActive}/></View>}
 {!active&&<Text style={txt}>Desativar impede novas propostas e pedidos; o histórico permanece disponível.</Text>}
 <Button disabled={isSubmitting} accessibilityRole="button" style={[button,{backgroundColor:theme.colors.accent}]} onPress={handleSubmit(save)}><Text style={{...txt,color:'#FFF',textAlign:'center'}}>{isSubmitting?'Salvando…':'Salvar fornecedor'}</Text></Button>
 <Button disabled={isSubmitting} accessibilityRole="button" style={button} onPress={()=>setEditing(null)}><Text style={txt}>Cancelar edição</Text></Button></View>}
 <TextInput accessibilityLabel="Buscar fornecedores" value={query} onChangeText={setQuery} placeholder="Nome, documento, contato ou e-mail" placeholderTextColor={theme.colors.textMuted} style={[card,txt]}/>
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{['Ativos','Inativos','Todos'].map(f=><Button key={f} accessibilityRole="radio" accessibilityState={{checked:f===filter}} style={[button,{backgroundColor:f===filter?theme.colors.primary:theme.colors.primarySoft}]} onPress={()=>setFilter(f)}><Text style={{...txt,color:f===filter?'#FFF':theme.colors.text}}>{f}</Text></Button>)}</View>
 <Button accessibilityRole="button" disabled={loading||isSubmitting} style={button} onPress={()=>setRevision(n=>n+1)}><Text style={txt}>Atualizar lista</Text></Button>
 {loading?<Text style={txt}>Carregando…</Text>:error?<Text accessibilityRole="alert" style={txt}>{error}</Text>:<><Text style={[txt,{marginTop:14}]}>{visible.length} fornecedor(es)</Text>{visible.slice(0,limit).map(s=><View key={s.id} style={card}><Text accessibilityRole="header" style={{...txt,fontSize:19,fontWeight:'700'}}>{s.name}</Text><Text style={{...txt,color:theme.colors.accent}}>{s.active?'Ativo':'Inativo'}</Text>{[['Documento',s.document],['Contato',s.contact_name],['E-mail',s.email],['Telefone',s.phone]].map(([label,v])=><Text selectable key={label} style={txt}>{label}: {v||'Não informado'}</Text>)}{canEdit&&!editing&&<Button accessibilityRole="button" accessibilityLabel={`Editar ${s.name}`} style={button} onPress={()=>edit(s)}><Text style={txt}>Editar cadastro</Text></Button>}</View>)}{visible.length>limit&&<Button accessibilityRole="button" style={button} onPress={()=>setLimit(n=>n+20)}><Text style={txt}>Mostrar mais</Text></Button>}</>}
 {!canEdit&&<Text style={[txt,{marginTop:15}]}>Seu perfil pode consultar. Gestor e Compras podem cadastrar e editar.</Text>}
 </InventoryScreen>;
}
