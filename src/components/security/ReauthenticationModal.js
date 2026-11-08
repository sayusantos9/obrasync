import {useEffect,useRef,useState} from 'react';
import {Modal,KeyboardAvoidingView,Platform,ActivityIndicator,ScrollView} from 'react-native';
import {AccessibleView as View,AccessibleTextInput as TextInput,AccessibleTouchableOpacity as Button} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {supabase} from '../../lib/supabase';
import {useApp} from '../../contexts/AppContext';
import {setReauthenticationListener,finishReauthentication} from '../../services/recentAuth';
export function ReauthenticationModal(){
 const {currentUser}=useApp(),[visible,setVisible]=useState(false),[password,setPassword]=useState(''),[code,setCode]=useState(''),[factor,setFactor]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),actor=useRef(null),lock=useRef(false);
 useEffect(()=>{
  setVisible(false);setPassword('');setCode('');setFactor(null);setError('');
  return setReauthenticationListener(v=>{setVisible(v);setPassword('');setCode('');setFactor(null);setError('');actor.current=currentUser?.id;});
 },[currentUser?.id]);
 const input={borderWidth:1,borderColor:'#CCD8E5',borderRadius:12,minHeight:50,padding:12,color:'#010028',marginTop:12},button={padding:14,minHeight:50,backgroundColor:'#0066BE',borderRadius:12,marginTop:14};
 function cancel(){if(!lock.current)finishReauthentication(new Error('Confirmação de identidade cancelada.'));}
 async function confirm(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{
  if(!currentUser?.id||actor.current!==currentUser.id)throw new Error('A conta mudou. Reabra a operação.');
  if(factor){const {error}=await supabase.auth.mfa.challengeAndVerify({factorId:factor,code});if(error)throw new Error('Código inválido ou expirado.');}
  else {const {data,error}=await supabase.auth.signInWithPassword({email:currentUser.email,password});if(error)throw new Error('Não foi possível confirmar a senha. Revise os dados ou tente novamente.');
   if(data.user?.id!==actor.current)throw new Error('A conta mudou. Reabra a operação.');setPassword('');
   const factors=await supabase.auth.mfa.listFactors();if(factors.error)throw factors.error;
   const verified=factors.data.totp.find(f=>f.status==='verified');if(verified){setFactor(verified.id);return;}
  }
  finishReauthentication();
 }catch(e){setError(e.message);}finally{lock.current=false;setBusy(false);}}
 return <Modal visible={visible} transparent animationType="none" onRequestClose={cancel}><KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1,backgroundColor:'rgba(1,0,40,.65)',justifyContent:'center',padding:20}}><ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center'}} keyboardShouldPersistTaps="handled"><View style={{padding:22,borderRadius:22,backgroundColor:'#FFFFFF'}}>
 <Text accessibilityRole="header" style={{fontSize:24,fontWeight:'700',color:'#010028'}}>Confirme sua identidade</Text><Text style={{color:'#575D6B',marginTop:10}}>Esta ação exige confirmação recente. Sua senha não é salva pelo aplicativo.</Text>
 {factor?<TextInput accessibilityLabel="Código do autenticador" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" style={input} editable={!busy}/>:<TextInput accessibilityLabel="Senha para confirmar identidade" secureTextEntry value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} textContentType="password" style={input} editable={!busy}/>}
 {!!error&&<Text accessibilityRole="alert" style={{color:'#B42318',marginTop:12}}>{error}</Text>}
 <Button accessibilityRole="button" disabled={busy||(!factor&&!password)||(!!factor&&code.length!==6)} style={button} onPress={confirm}>{busy?<ActivityIndicator color="#FFFFFF"/>:<Text style={{color:'#FFFFFF',fontWeight:'700'}}>Confirmar identidade</Text>}</Button>
 <Button accessibilityRole="button" disabled={busy} onPress={cancel} style={{padding:14,minHeight:48,alignItems:'center'}}><Text style={{color:'#0066BE'}}>Cancelar</Text></Button>
 </View></ScrollView></KeyboardAvoidingView></Modal>;
}
