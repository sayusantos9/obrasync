import {useRef,useState} from 'react';
import {Alert} from 'react-native';
import {AccessibleView as View,AccessibleTextInput as TextInput,AccessibleTouchableOpacity as Button} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useApp} from '../../contexts/AppContext';
import {useInventoryTheme} from '../layout/InventoryScreen';
import {returnableQuantity,supplierReturnPayload} from '../../utils/receiptQuality';

export function ReceiptQualityPanel({receipt}){
 const {currentUser,createReceipt,pendingReceipts=[]}=useApp(),theme=useInventoryTheme();
 const [selected,setSelected]=useState(null),[quantity,setQuantity]=useState(''),[reason,setReason]=useState(''),[nonconformity,setNonconformity]=useState(''),[reference,setReference]=useState(''),[busy,setBusy]=useState(false),lock=useRef(false);
 const text={color:theme.colors.text,fontSize:15,lineHeight:22},input={color:theme.colors.text,backgroundColor:theme.colors.background,borderWidth:1,borderColor:theme.colors.border,borderRadius:12,padding:12,minHeight:48,marginTop:8};
 const button={padding:14,minHeight:48,backgroundColor:theme.colors.primarySoft,borderRadius:12,marginTop:10};
 const pending=pendingReceipts.some(r=>r.data.orderId===receipt.order_id),canReturn=['MASTER','PURCHASING'].includes(currentUser?.role);
 async function save(){if(lock.current)return;lock.current=true;setBusy(true);try{
  const payload=supplierReturnPayload(receipt,selected,quantity,reason,nonconformity,reference);
  const result=await createReceipt(payload,'RETURN');setSelected(null);setQuantity('');setReason('');setNonconformity('');setReference('');
  Alert.alert(result.status==='SYNCED'?'Devolução confirmada':'Devolução na fila',result.status==='SYNCED'?'Estoque baixado e saldo a receber reaberto para reposição. A compra permanece registrada; crédito financeiro não é presumido.':'Aguarde a confirmação na fila. Não registre novamente a mesma devolução.');
 }catch(e){Alert.alert('Não foi possível devolver',e.message);}finally{lock.current=false;setBusy(false);}}
 return <View style={{padding:14,backgroundColor:theme.colors.surface,borderRadius:16}}>
 {(receipt.receipt_quality||[]).map(q=><View key={q.id} style={{marginTop:8}}><Text style={text}>Conferência: {q.accepted_quantity} aceita(s) · {q.rejected_quantity} rejeitada(s)</Text>{!!q.reason&&<Text style={text}>Motivo: {q.reason}</Text>}{!!q.nonconformity&&<Text style={text}>Não conformidade: {q.nonconformity}</Text>}</View>)}
 {(receipt.items||[]).map(i=><View key={i.id} style={{marginTop:10}}><Text style={text}>{i.description} · aceita: {i.quantity} {i.unit} · devolvível: {returnableQuantity(i)} {i.unit}</Text>
 {(i.supplier_returns||[]).map(r=><Text key={r.id} style={text}>Devolução: {r.quantity} {i.unit} · {r.reason}{r.nonconformity?` · ${r.nonconformity}`:''}{r.reference?` · ${r.reference}`:''}</Text>)}
 {canReturn&&returnableQuantity(i)>0&&<Button style={button} accessibilityRole="button" disabled={busy||pending} onPress={()=>{setSelected(i);setQuantity('');setReason('');setNonconformity('');setReference('');}}><Text style={text}>Devolver {i.description} ao fornecedor</Text></Button>}</View>)}
 {pending&&<Text style={text}>Há uma operação deste pedido na fila. Sincronize antes de registrar outra.</Text>}
 {!!selected&&<View style={{marginTop:12}}><Text accessibilityRole="header" style={{...text,fontWeight:'700'}}>Devolver: {selected.description}</Text><Text style={text}>Somente material disponível nesta obra. A devolução exige reposição; eventual reembolso será tratado separadamente.</Text>
 <TextInput accessibilityLabel="Quantidade a devolver" placeholder="Quantidade a devolver" placeholderTextColor={theme.colors.textMuted} keyboardType="decimal-pad" style={input} value={quantity} onChangeText={setQuantity} editable={!busy}/>
 <TextInput accessibilityLabel="Motivo da devolução" placeholder="Motivo obrigatório" placeholderTextColor={theme.colors.textMuted} style={input} value={reason} onChangeText={setReason} editable={!busy}/>
 <TextInput accessibilityLabel="Não conformidade da devolução" placeholder="Não conformidade (opcional)" placeholderTextColor={theme.colors.textMuted} style={input} value={nonconformity} onChangeText={setNonconformity} editable={!busy}/>
 <TextInput accessibilityLabel="Documento da devolução" placeholder="Documento / referência (opcional)" placeholderTextColor={theme.colors.textMuted} style={input} value={reference} onChangeText={setReference} editable={!busy}/>
 <Button accessibilityRole="button" style={button} disabled={busy||pending} onPress={()=>Alert.alert('Confirmar devolução?','O saldo será baixado após confirmação do servidor. O pedido ficará pendente de reposição.',[{text:'Cancelar',style:'cancel'},{text:'Confirmar',onPress:save}])}><Text style={text}>{busy?'Registrando…':'Confirmar devolução'}</Text></Button>
 <Button accessibilityRole="button" style={button} disabled={busy} onPress={()=>setSelected(null)}><Text style={text}>Cancelar devolução</Text></Button></View>}
 </View>;
}
