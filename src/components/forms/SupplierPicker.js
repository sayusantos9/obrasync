import {useEffect,useState} from 'react';
import {AccessibleView as View,AccessibleTouchableOpacity as Button,AccessibleTextInput as TextInput} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useInventoryTheme} from '../layout/InventoryScreen';
import {useApp} from '../../contexts/AppContext';
import {fetchSuppliers} from '../../services/supplierService';
import {supplierMatches} from '../../utils/suppliers';
import {SCREENS} from '../../navigation/routes';
export function SupplierPicker({value,onChange,disabled=false}){
 const theme=useInventoryTheme(),{currentUser,openScreen}=useApp();
 const [rows,setRows]=useState([]),[query,setQuery]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);
 useEffect(()=>{let live=true;setLoading(true);setError('');fetchSuppliers().then(data=>{if(live)setRows(data.filter(s=>s.active));}).catch(e=>{if(live)setError(e.message);}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[currentUser?.id,currentUser?.companyId,revision]);
 const txt={color:theme.colors.text,fontSize:14},button={padding:14,borderWidth:1,borderColor:theme.colors.border,borderRadius:12,minHeight:48,marginTop:8};
 const matches=rows.filter(s=>supplierMatches(s,query));
 return <View style={{marginTop:18}}><Text style={{...txt,fontWeight:'700'}}>FORNECEDOR CADASTRADO</Text>
 <TextInput accessibilityLabel="Buscar fornecedor por nome ou documento" value={query} editable={!disabled} onChangeText={setQuery} placeholder="Buscar por nome ou documento" placeholderTextColor={theme.colors.textMuted} style={[button,txt,{backgroundColor:theme.colors.surface}]}/>
 {!!value&&<Text style={{...txt,marginTop:8}}>Selecionado: {value.name} {value.document?`· ${value.document}`:''}</Text>}
 {loading?<Text style={txt}>Carregando fornecedores…</Text>:error?<Text accessibilityRole="alert" style={txt}>{error}</Text>:matches.slice(0,8).map(s=><Button key={s.id} disabled={disabled} accessibilityRole="radio" accessibilityState={{checked:value?.id===s.id,disabled}} onPress={()=>onChange(s)} style={[button,{backgroundColor:value?.id===s.id?theme.colors.primarySoft:theme.colors.surface}]}><Text style={txt}>{value?.id===s.id?'● ':'○ '}{s.name}</Text><Text style={{...txt,fontSize:12,color:theme.colors.textMuted}}>{s.document||'Documento não informado'}{s.contact_name?` · ${s.contact_name}`:''}</Text></Button>)}
 {!loading&&!error&&!matches.length&&<Text style={txt}>Nenhum fornecedor ativo encontrado.</Text>}
 {matches.length>8&&<Text style={txt}>Refine a busca para encontrar outros fornecedores.</Text>}
 <Button disabled={disabled||loading} accessibilityRole="button" style={button} onPress={()=>setRevision(n=>n+1)}><Text style={txt}>Atualizar fornecedores</Text></Button>
 <Button disabled={disabled} accessibilityRole="button" style={button} onPress={()=>openScreen(SCREENS.SUPPLIERS)}><Text style={{...txt,color:theme.colors.accent}}>{['MASTER','PURCHASING'].includes(currentUser?.role)?'Gerenciar fornecedores':'Consultar fornecedores'}</Text></Button>
 </View>;
}
