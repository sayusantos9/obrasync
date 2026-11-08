import {useEffect,useMemo,useRef,useState} from 'react';
import {View,Text,TouchableOpacity,useWindowDimensions} from 'react-native';
import {WebView} from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {librasHtml} from '../../utils/libras';

export function FloatingLibras({text,onClose}){
 const web=useRef(null),latest=useRef(text),{width,height}=useWindowDimensions(),insets=useSafeAreaInsets();
 const [right,setRight]=useState(false),[minimized,setMinimized]=useState(false),[error,setError]=useState('');
 const source=useMemo(()=>({html:librasHtml('',{embedded:true}),baseUrl:'https://vlibras.gov.br/'}),[]);
 latest.current=text;
 function send(){web.current?.injectJavaScript(`window.setLibrasText?.(${JSON.stringify(latest.current)});true;`);}
 useEffect(()=>{send();},[text]);
 return <View testID="floating-libras" style={{position:'absolute',zIndex:120,elevation:12,bottom:Math.max(insets.bottom+72,88),[right?'right':'left']:12,width:Math.min(310,width-76),height:minimized?48:Math.min(400,height*0.52),borderRadius:14,overflow:'hidden',borderWidth:1,borderColor:'#54B9E9',backgroundColor:'#003F69'}}>
  {!!error&&!minimized&&<Text accessibilityRole="alert" style={{color:'white',padding:8}}>{error}</Text>}
  <View style={{flex:1,display:minimized?'none':'flex'}}>
   <WebView ref={web} source={source} onLoadEnd={send} onMessage={e=>{try{const data=JSON.parse(e.nativeEvent.data);if(data.ready)send();}catch{}}} originWhitelist={['https://*','about:*']} javaScriptEnabled domStorageEnabled mixedContentMode="never" setSupportMultipleWindows={false} onError={()=>setError('Não foi possível carregar o avatar. Confira a conexão.')} style={{flex:1,backgroundColor:'transparent'}}/>
  </View>
  <View style={{flexDirection:'row',alignItems:'center',minHeight:48}}>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel={minimized?'Expandir avatar':'Minimizar avatar'} onPress={()=>setMinimized(!minimized)} style={{flex:1,padding:12}}><Text style={{color:'white',fontWeight:'700'}}>{minimized?'Expandir Libras':'Minimizar'}</Text></TouchableOpacity>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mover avatar para o outro lado" onPress={()=>setRight(!right)} style={{padding:12}}><Text style={{color:'white'}}>↔</Text></TouchableOpacity>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar avatar" onPress={onClose} style={{padding:12}}><Text style={{color:'white'}}>✕</Text></TouchableOpacity>
  </View>
 </View>;
}
