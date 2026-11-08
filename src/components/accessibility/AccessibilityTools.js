import {ReadableText as Text} from './ReadableText';
import {AccessibleView as View,AccessibleTouchableOpacity as TouchableOpacity} from './AccessibleNative';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,AppState,findNodeHandle,Keyboard,Modal,Platform,StyleSheet,Switch,useWindowDimensions} from 'react-native';
import {SafeAreaView,useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import {useApp} from '../../contexts/AppContext';
import {usePlanengenStyle} from '../layout/PlanengenScreen';
import {KeyboardScrollView} from '../layout/KeyboardScrollView';
import {ACCESSIBILITY_PRESETS} from '../../utils/accessibility';
import {TextRegistryContext} from './ReadableText';
import {VisualSettingsContext,ReadingInteractionContext} from './AccessibilityRuntime';
import {VisualAccessibilityPanel} from './VisualAccessibilityPanel';
import {FloatingLibras} from './FloatingLibras';

const ToolsContext=createContext({openAccessibility:()=>{},startExploring:()=>{}});
export const useAccessibilityTools=()=>useContext(ToolsContext);
export function AccessibilityPanel({initialTab='visual'}){
 const {accessibilitySettings:settings,updateAccessibility}=useApp();
 const {colors,text}=usePlanengenStyle();
 const {startExploring}=useAccessibilityTools();
 const [tab,setTab]=useState(initialTab);
 const button=(label,onPress,disabled=false)=><TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button,{backgroundColor:colors.blue,opacity:disabled?0.5:1}]}><Text style={text(styles.buttonText,'#FFFFFF')}>{label}</Text></TouchableOpacity>;
 return <View>
  <Text style={text(styles.intro,colors.muted)}>Escolha como deseja ler, ouvir e acompanhar o conteúdo. Os ajustes visuais ficam salvos neste aparelho.</Text>
  <View accessibilityRole="tablist" style={styles.tabs}>{[['libras','hand-left-outline','Libras'],['voice','volume-high-outline','Voz'],['visual','eye-outline','Visual']].map(([id,icon,label])=><TouchableOpacity key={id} accessibilityRole="tab" accessibilityState={{selected:tab===id}} onPress={()=>{setTab(id);}} style={[styles.tab,{borderColor:tab===id?colors.blue:colors.border,backgroundColor:tab===id?'#E7F2FE':'white'}]}><Ionicons name={icon} size={24} color={colors.blue}/><Text style={text(styles.label,colors.navy)}>{label}</Text></TouchableOpacity>)}</View>
  {tab==='visual'?<>
   <VisualAccessibilityPanel/>
  </>:<>
   <Text accessibilityRole="header" style={text(styles.heading,colors.navy)}>{tab==='voice'?'Ouvir a tela pelo toque':'Libras pelo toque'}</Text>
   <Text style={text(styles.note,colors.muted)}>Mantenha o dedo sobre um texto ou botão para ouvir ou traduzir. Arraste normalmente para rolar e toque uma vez para abrir opções. A leitura fica ativa durante a navegação.</Text>
   {tab==='libras'&&<Text style={text(styles.note,colors.muted)}>O trecho selecionado será traduzido pelo serviço externo gratuito VLibras. Precisa de internet.</Text>}
   {tab==='voice'&&<View style={styles.row}><Text style={text(styles.label)}>Leitura mais lenta</Text><Switch accessibilityLabel="Leitura mais lenta" value={!!settings.slowSpeech} onValueChange={slowSpeech=>updateAccessibility({slowSpeech})}/></View>}
   {button(tab==='voice'?'Explorar com voz':'Explorar com Libras',()=>startExploring(tab))}

  </>}
 </View>;
}

export function AccessibilityToolsProvider({children}){
 const app=useApp(),{accessibilitySettings:settings,currentScreen,activeTab}=app;
 const [opened,setOpened]=useState(false),[keyboardTop,setKeyboardTop]=useState(null),[initialTab,setInitialTab]=useState('visual');
 const {height}=useWindowDimensions();
 const registry=useRef(new Map()).current,gesture=useRef(0),lastText=useRef(''),timer=useRef(null),explorationLayer=useRef(null);
 const [mode,setMode]=useState(null),[selected,setSelected]=useState(''),[translation,setTranslation]=useState(null),[readError,setReadError]=useState('');
 function stopExploring(){gesture.current++;clearTimeout(timer.current);Speech.stop().catch(()=>{});setMode(null);setSelected('');setTranslation(null);lastText.current='';}
 function pauseExploring(){gesture.current++;clearTimeout(timer.current);Speech.stop().catch(()=>{});setMode(null);setSelected('');lastText.current='';}
 function startExploring(next){pauseExploring();if(next!=='libras')setTranslation(null);Keyboard.dismiss();setOpened(false);setReadError('');setMode(next);}

 useEffect(()=>{if(settings.accessibilityToolbar===false)stopExploring();},[settings.accessibilityToolbar]);
 useEffect(()=>{const listener=AppState.addEventListener('change',s=>{if(s!=='active')stopExploring();});return()=>{listener.remove();clearTimeout(timer.current);Speech.stop().catch(()=>{});};},[]);
 async function read(content){
  const version=++gesture.current;setSelected(content);setReadError('');
  if(mode==='libras'){setTranslation(content);return;}
  if(mode!=='voice')return;
  try{await Speech.stop();if(version!==gesture.current)return;Speech.speak(content,{language:'pt-BR',rate:settings.slowSpeech?0.75:1,onError:()=>setReadError('Não foi possível reproduzir a voz.')});}catch{setReadError('Voz indisponível neste aparelho.');}
 }

 const heading=useRef(null),insets=useSafeAreaInsets();
 useEffect(()=>{const a=Keyboard.addListener('keyboardDidShow',e=>setKeyboardTop(e.endCoordinates.screenY)),b=Keyboard.addListener('keyboardDidHide',()=>setKeyboardTop(null));return()=>{a.remove();b.remove();};},[]);
 const openAccessibility=(tab='visual')=>{stopExploring();Keyboard.dismiss();setInitialTab(['libras','voice','visual'].includes(tab)?tab:'visual');setOpened(true);};
 const close=()=>setOpened(false);
 return <VisualSettingsContext.Provider value={settings}><ReadingInteractionContext.Provider value={{mode,read}}><ToolsContext.Provider value={{openAccessibility,startExploring}}>
  <View style={{flex:1}} accessibilityElementsHidden={opened} importantForAccessibility={opened?'no-hide-descendants':'auto'}><TextRegistryContext.Provider value={registry}>{children}</TextRegistryContext.Provider></View>
  {!!mode&&!(mode==='libras'&&translation)&&<View style={{position:'absolute',top:insets.top+8,left:12,right:64,zIndex:110,backgroundColor:'#003F69',borderRadius:12,padding:12}}>
   <Text style={{color:'white',fontWeight:'700'}}>{mode==='voice'?'Voz pelo toque':'Libras pelo toque'}</Text>
   <Text numberOfLines={2} style={{color:'white',marginTop:5}}>{readError||selected||'Segure um texto para ler. Role e toque normalmente.'}</Text>
   <TouchableOpacity accessibilityRole="button" onPress={pauseExploring} style={{paddingVertical:12}}><Text style={{color:'white',fontWeight:'700'}}>Desativar leitura</Text></TouchableOpacity>
  </View>}
  {!!translation&&!opened&&<FloatingLibras text={translation} onClose={()=>{setTranslation(null);lastText.current='';}}/>}
  {settings.readingMask&&!opened&&<View pointerEvents="none" style={[StyleSheet.absoluteFill,{zIndex:80}]}><View style={{position:'absolute',top:0,left:0,right:0,height:'36%',backgroundColor:'rgba(0,0,0,0.35)'}}/><View style={{position:'absolute',bottom:0,left:0,right:0,height:'36%',backgroundColor:'rgba(0,0,0,0.35)'}}/></View>}
  {settings.readingGuide&&!opened&&keyboardTop===null&&<View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={styles.guide}/>}
  {settings.accessibilityToolbar!==false&&!opened&&<View testID="accessibility-toolbar" style={[styles.toolbar,{right:Math.max(4,insets.right),top:Math.max(insets.top+8,(Math.min(height,keyboardTop??height)-144)/2)}]}>
   {[['libras','hand-left-outline','Abrir Libras'],['voice','volume-high-outline','Abrir leitura em voz'],['visual','eye-outline','Abrir ajustes visuais']].map(([tab,icon,label],index)=><TouchableOpacity key={tab} accessibilityRole="button" accessibilityLabel={label} accessibilityHint="Abre o painel de acessibilidade sobre a tela atual" onPress={()=>tab==='visual'?openAccessibility(tab):mode===tab?stopExploring():startExploring(tab)} style={[styles.toolbarButton,index>0&&styles.toolbarDivider]}><Ionicons name={icon} size={23} color="#FFFFFF"/></TouchableOpacity>)}
  </View>}
  <Modal visible={opened} animationType={settings.reduceMotion?'none':'slide'} onRequestClose={close} onShow={()=>{if(Platform.OS==='web'){heading.current?.focus?.();return;}const node=findNodeHandle(heading.current);if(node)AccessibilityInfo.setAccessibilityFocus(node);}}>
   <SafeAreaView style={{flex:1,backgroundColor:'#010028'}}><View accessibilityViewIsModal style={{flex:1}}>
    <View style={styles.modalHeader}><Text ref={heading} accessible accessibilityRole="header" style={styles.modalTitle}>Acessibilidade</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar acessibilidade" onPress={close} style={{padding:12}}><Ionicons name="close" size={26} color="white"/></TouchableOpacity></View>
    <KeyboardScrollView contentContainerStyle={{padding:20,paddingBottom:40}} style={{backgroundColor:'#EEF0F2',flex:1}}>{opened&&<AccessibilityPanel initialTab={initialTab}/>}</KeyboardScrollView>
   </View></SafeAreaView>
  </Modal>
 </ToolsContext.Provider></ReadingInteractionContext.Provider></VisualSettingsContext.Provider>;
}
const styles=StyleSheet.create({intro:{fontSize:14,lineHeight:22},tabs:{flexDirection:'row',gap:10,marginTop:18},tab:{flex:1,minHeight:80,borderRadius:16,borderWidth:1,alignItems:'center',justifyContent:'center',gap:7},label:{fontSize:13,fontWeight:'600'},heading:{fontSize:21,fontWeight:'700',marginTop:24,marginBottom:12},title:{fontSize:16,fontWeight:'600'},note:{fontSize:13,lineHeight:21,marginTop:9},card:{backgroundColor:'white',borderWidth:1,borderRadius:16,padding:16,marginTop:12},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},presets:{flexDirection:'row',flexWrap:'wrap',gap:8},preset:{padding:13,borderWidth:1,borderRadius:12,backgroundColor:'white',minHeight:48},input:{fontSize:17,lineHeight:26,minHeight:150,textAlignVertical:'top',padding:15,borderWidth:1,borderRadius:14,backgroundColor:'white',marginVertical:14},button:{minHeight:48,padding:14,borderRadius:12,alignItems:'center',marginTop:12},buttonText:{fontSize:14,fontWeight:'700'},web:{height:480,borderRadius:16,overflow:'hidden',marginTop:16},toolbar:{position:'absolute',width:46,borderRadius:14,backgroundColor:'#003F69',borderWidth:1,borderColor:'#54B9E9',overflow:'hidden',elevation:6,zIndex:100},toolbarButton:{width:44,height:48,alignItems:'center',justifyContent:'center'},toolbarDivider:{borderTopWidth:1,borderTopColor:'#54B9E9'},guide:{position:'absolute',left:8,right:8,top:'50%',height:2,backgroundColor:'#0066BE',opacity:0.7},modalHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingVertical:12},modalTitle:{fontSize:23,fontWeight:'700',color:'white'}});
