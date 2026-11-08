import {AccessibleModal as Modal} from '../accessibility/AccessibleNative';
import {AccessibleTextInput as TextInput,AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useState} from 'react';
import {Alert} from 'react-native';
export function ArchiveDialog({document,onCancel,onConfirm}) {
 const [reason,setReason]=useState('');
 const [busy,setBusy]=useState(false);
 async function save() {
  if(busy || reason.trim().length<5) return;
  setBusy(true);
  try { await onConfirm(document.id,reason.trim());setReason('');onCancel(); }
  catch(error) { Alert.alert('Não foi possível arquivar',error.message); }
  finally { setBusy(false); }
 }
 return <Modal visible={Boolean(document)} transparent animationType="none" onRequestClose={()=>!busy&&onCancel()}><View style={{flex:1,justifyContent:'center',padding:24,backgroundColor:'#0009'}}><View style={{padding:22,backgroundColor:'white',borderRadius:18}}>
  <Text accessibilityRole="header" style={{fontSize:20,color:'#010028',fontWeight:'700'}}>Arquivar {document?.number}</Text>
  <Text style={{marginVertical:12}}>O documento e seus itens serão preservados no banco. Informe o motivo do arquivamento.</Text>
  <TextInput accessibilityLabel="Motivo do arquivamento" placeholder="Justificativa (mínimo 5 caracteres)" value={reason} onChangeText={setReason} multiline style={{borderWidth:1,borderColor:'#777',borderRadius:10,padding:12,minHeight:90}}/>
  <TouchableOpacity accessibilityRole="button" disabled={busy||reason.trim().length<5} onPress={save} style={{padding:14,marginTop:16,backgroundColor:reason.trim().length<5?'#777':'#010028',borderRadius:10}}><Text style={{color:'white',textAlign:'center'}}>{busy?'Arquivando...':'Confirmar arquivamento'}</Text></TouchableOpacity>
  <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={onCancel} style={{padding:14}}><Text style={{textAlign:'center'}}>Cancelar</Text></TouchableOpacity>
 </View></View></Modal>;
}
