import {useEffect,useRef,useState} from 'react';
import {Alert} from 'react-native';
import {AccessibleView as View,AccessibleTouchableOpacity as Button} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {CatalogInputPicker} from '../forms/CatalogInputPicker';
import {useInventoryTheme} from '../layout/InventoryScreen';
import {supabase} from '../../lib/supabase';
import {requestQuoteItem,requestStatusLabel} from '../../utils/procurementTrace';
export function QuoteRequestPicker({projectId,initialRequestId,request,items,roundId,onChoose,onMap,disabled}){
 const theme=useInventoryTheme(),[data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[revision,setRevision]=useState(0);
 const initialized=useRef('');
 useEffect(()=>{let live=true;setData(null);setError('');if(!projectId)return;setLoading(true);supabase.rpc('procurement_origins',{p_project_id:projectId}).then(({data,error})=>{if(!live)return;if(error)throw error;setData(data);const key=`${projectId}:${initialRequestId}`;if(initialRequestId&&initialized.current!==key){const r=data.requests.find(r=>r.id===initialRequestId&&!r.round?.awarded_quote_id);if(r){initialized.current=key;onChoose(r);}else setError('Solicitação de origem indisponível.');}}).catch(e=>{if(live)setError(e.message);}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[projectId,initialRequestId,revision]);
 const txt={fontSize:14,lineHeight:21,color:theme.colors.text},button={padding:14,minHeight:48,borderWidth:1,borderColor:theme.colors.border,borderRadius:12,marginTop:8};
 return <View style={{marginTop:18}}><Text accessibilityRole="header" style={{...txt,fontSize:18,fontWeight:'700'}}>Solicitação de origem</Text>
 {loading&&<Text style={txt}>Carregando solicitações…</Text>}{!!error&&<Text accessibilityRole="alert" style={txt}>{error}</Text>}
 {!roundId&&<Button disabled={disabled} accessibilityRole="radio" accessibilityState={{checked:!request}} style={button} onPress={()=>onChoose(null)}><Text style={txt}>{!request?'● ':'○ '}Cotação sem solicitação</Text></Button>}
 {(data?.requests||[]).filter(r=>!r.round?.awarded_quote_id).map(r=><Button key={r.id} disabled={disabled} accessibilityRole="radio" accessibilityState={{checked:request?.id===r.id}} style={[button,{backgroundColor:request?.id===r.id?theme.colors.primarySoft:theme.colors.surface}]} onPress={()=>onChoose(r)}><Text style={txt}>{r.items?.[0]?.material_name||r.number} · {requestStatusLabel(r.status)}</Text><Text selectable style={txt}>{r.number}</Text><Text style={txt}>{r.round?'Usar rodada existente':'Iniciar rodada desta solicitação'}</Text></Button>)}
 {request&&<View style={{padding:14,marginTop:12,backgroundColor:theme.colors.primarySoft,borderRadius:14}}><Text style={txt}>Necessidade: {request.needed_by||'Data não informada'} · {request.notes||'Sem observações'}</Text>{(request.items||[]).map(i=>{const selected=items.find(x=>x.requestItemId===i.id);return <View key={i.id} style={{marginTop:10}}><Text style={txt}>{i.material_name}: {i.quantity} {i.unit}</Text>{selected?<Text style={txt}>Associado: {selected.code} · {selected.description}</Text>:<><Text style={txt}>Associe explicitamente ao catálogo. Unidade e quantidade serão preservadas.</Text><CatalogInputPicker disabled={disabled} label={`Associar ${i.material_name}`} onSelect={input=>{try{onMap(requestQuoteItem(i,input));}catch(e){Alert.alert('Associação incompatível',e.message);}}}/></>}</View>;})}</View>}
 <Text style={{...txt,marginTop:10}}>Base atual: {data?.budget?`${data.budget.number} · revisão ${data.budget.revision}`:'não definida'}. Uma nova rodada preserva esta versão no servidor. Rodadas existentes mantêm a versão original.</Text>
 <Button disabled={disabled||loading} accessibilityRole="button" style={button} onPress={()=>setRevision(n=>n+1)}><Text style={txt}>Atualizar solicitações</Text></Button>
 </View>;
}
