import {useEffect,useState} from 'react';
import {AccessibleView as View,AccessibleTouchableOpacity as Button,AccessibleTextInput as Input} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useInventoryTheme} from '../layout/InventoryScreen';
import {evaluateOrderApproval} from '../../services/projectAccessService';
export function OrderApprovalPanel({orderId,busy,onDecide}){
 const theme=useInventoryTheme(),[evaluation,setEvaluation]=useState(null),[error,setError]=useState(''),[reason,setReason]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{let live=true;setEvaluation(null);setError('');evaluateOrderApproval(orderId).then(v=>{if(live)setEvaluation(v);}).catch(e=>{if(live)setError(e.message);});return()=>{live=false;};},[orderId,revision]);
 const text={color:theme.colors.text,fontSize:15,lineHeight:22},button={padding:14,minHeight:48,backgroundColor:theme.colors.primarySoft,borderRadius:12,marginTop:10};
 return <View style={{marginTop:16}}><Text style={text}>{error||evaluation?.reason||'Verificando sua alçada…'}</Text><Button accessibilityRole="button" disabled={busy} onPress={()=>setRevision(n=>n+1)} style={button}><Text style={text}>Rever alçada</Text></Button>{evaluation?.allowed&&<><Text style={text}>Justificativa da decisão (mínimo 10 caracteres)</Text><Input accessibilityLabel="Justificativa da decisão" value={reason} onChangeText={setReason} editable={!busy} multiline style={{...text,borderWidth:1,borderColor:theme.colors.border,borderRadius:12,padding:12,minHeight:85}}/>{[['Aprovar',true],['Rejeitar',false]].map(([label,decision])=><Button key={label} accessibilityRole="button" disabled={busy||reason.trim().length<10} onPress={()=>onDecide(decision,reason.trim())} style={button}><Text style={text}>{label}</Text></Button>)}</>}</View>;
}
