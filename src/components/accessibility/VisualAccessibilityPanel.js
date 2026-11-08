import {useState} from 'react';
import {StyleSheet,useWindowDimensions,Linking,View as NativeView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {AccessibleView as View,AccessibleTouchableOpacity as TouchableOpacity,AccessibleTextInput as TextInput} from './AccessibleNative';
import {ReadableText as Text} from './ReadableText';
import {useApp} from '../../contexts/AppContext';
import {ACCESSIBILITY_PRESETS} from '../../utils/accessibility';

const profiles=[['standard','Padrão','Configurações originais'],['senior','Pessoa idosa','Texto e botões maiores'],['lowVision','Baixa visão','Contraste, negrito e ampliação'],['colorVision','Percepção de cores','Contraste e destaques, sem depender apenas de cor'],['focus','Foco','Menos movimento e máscara de leitura'],['reading','Leitura / dislexia','Fonte do sistema e espaçamento ampliado'],['calm','Ambiente calmo','Menos cores, sons e movimento'],['cognitive','Leitura facilitada','Texto maior, espaço e links destacados'],['motor','Facilidade de toque','Alvos de toque maiores'],['sensitive','Sensibilidade visual','Movimento reduzido e cores suaves']];
const groups=[
 ['Texto e leitura',[
  ['fontLevel','text-outline','Tamanho do texto','Amplia a escrita sem ampliar imagens.',3],['spacingLevel','swap-horizontal-outline','Espaçamento','Aumenta o espaço entre letras.',3],['lineLevel','resize-outline','Altura das linhas','Mais espaço entre linhas de texto.',3],['boldText','text','Negrito','Reforça o peso da escrita.'],['readableFont','reader-outline','Fonte de leitura','Usa a fonte padrão do sistema.'],['highlightTitles','bookmark-outline','Destacar títulos','Sublinha e reforça os títulos.'],['highlightLinks','link-outline','Destacar links','Sublinha links identificados.']]],
 ['Foco e interação',[
  ['readingMask','albums-outline','Máscara de leitura','Escurece as áreas acima e abaixo da faixa central.'],['readingGuide','remove-outline','Guia de leitura','Linha central para acompanhar a leitura.'],['reduceMotion','pause-circle-outline','Reduzir movimento','Desativa animações e transições controladas pelo app.'],['buttonLevel','finger-print-outline','Tamanho dos botões','Amplia alvos e áreas de toque.',3],['imageCaptions','image-outline','Legendas de imagens','Exibe a descrição das imagens que possuem legenda.'],['muteSounds','volume-mute-outline','Silenciar avisos','Desativa avisos sonoros; a voz solicitada continua disponível.']]],
 ['Preferências',[
  ['accessibilityToolbar','accessibility-outline','Barra lateral','Mostra os atalhos durante a navegação.'],['slowSpeech','volume-low-outline','Voz mais lenta','Reduz a velocidade da leitura.'],['visualAlerts','notifications-outline','Avisos visuais','Mostra confirmações em tela.'],['vibrationAlerts','phone-portrait-outline','Vibração','Vibra nas confirmações compatíveis.'],['screenReaderOptimized','ear-outline','Leitor de tela','Anuncia confirmações ao TalkBack / VoiceOver.']]],
];
export function VisualAccessibilityPanel(){
 const {accessibilitySettings:s,updateAccessibility}=useApp(),{width}=useWindowDimensions();
 const [expanded,setExpanded]=useState(false),[colorTarget,setColorTarget]=useState('textColor'),[hex,setHex]=useState(''),[error,setError]=useState('');
 const update=patch=>updateAccessibility({...patch,profile:'custom'});
 const button=(label,press,selected=false)=> <TouchableOpacity key={label} accessibilityRole="button" accessibilityState={{selected}} onPress={press} style={[styles.choice,selected&&styles.active]}><Text style={styles.label}>{selected?'✓ ':''}{label}</Text></TouchableOpacity>;
 const selected=profiles.find(p=>p[0]===s.profile)?.[1]||'Personalizado';
 return <View>
  <Text accessibilityRole="header" style={styles.title}>Acessibilidade visual</Text>
  <TouchableOpacity accessibilityRole="button" accessibilityState={{expanded}} onPress={()=>setExpanded(!expanded)} style={styles.selector}><Text style={styles.label}>Perfil: {selected} {expanded?'⌃':'⌄'}</Text></TouchableOpacity>
  {expanded&&profiles.map(([key,label,description])=><TouchableOpacity key={key} accessibilityRole="button" accessibilityState={{selected:s.profile===key}} onPress={()=>{updateAccessibility(ACCESSIBILITY_PRESETS[key]);setExpanded(false);}} style={styles.profile}><Text style={styles.label}>{label}</Text><Text style={styles.description}>{description}</Text></TouchableOpacity>)}
  <Text style={styles.description}>Os perfis são pontos de partida ajustáveis. As preferências ficam salvas neste aparelho e valem durante a navegação.</Text>
  <Text accessibilityRole="header" style={styles.heading}>Cores e contraste</Text>
  <View style={styles.choices}>{[['original','Original'],['light','Contraste claro'],['dark','Contraste escuro'],['inverted','Cores invertidas']].map(([value,label])=>button(label,()=>update({contrast:value,highContrast:false}),s.contrast===value))}</View>
  <View style={styles.choices}>{[['original','Cores originais'],['high','Saturação alta'],['low','Saturação baixa'],['mono','Monocromático']].map(([value,label])=>button(label,()=>update({saturation:value}),s.saturation===value))}</View>
  <Text style={styles.description}>As cores da interface mudam; fotografias, logotipos e o avatar não recebem filtros.</Text>
  {groups.map(([category,items])=><View key={category}>
   <Text accessibilityRole="header" style={styles.heading}>{category}</Text>
   <View style={styles.grid}>{items.map(([key,icon,label,description,max])=>{
    const value=s[key]||0,enabled=!!value;
    return <View key={key} style={[styles.tile,{width:width<350?'100%':'48%'},enabled&&styles.active]}>
     <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected:enabled}} accessibilityHint={max?'Avança a intensidade; após o máximo, desativa.':description} onPress={()=>update({[key]:max?(value+1)%(max+1):!value})} style={styles.tileButton}>
      <Ionicons name={icon} size={27} color="#0066BE"/><Text style={styles.label}>{label}</Text><Text style={styles.description}>{description}</Text><Text style={styles.state}>{max?`Nível ${value} de ${max}`:enabled?'✓ Ativado':'Desativado'}</Text>
     </TouchableOpacity>
     {!!max&&<View style={styles.controls}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Diminuir ${label}`} disabled={!value} onPress={()=>update({[key]:Math.max(0,value-1)})} style={styles.step}><Text style={styles.label}>−</Text></TouchableOpacity>
      <Text style={styles.state}>{'●'.repeat(value)}{'○'.repeat(max-value)}</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Aumentar ${label}`} disabled={value===max} onPress={()=>update({[key]:Math.min(max,value+1)})} style={styles.step}><Text style={styles.label}>＋</Text></TouchableOpacity>
     </View>}
    </View>;
   })}</View>
  </View>)}
  <Text accessibilityRole="header" style={styles.heading}>Alinhamento do texto</Text>
  <View style={styles.choices}>{[['original','Original'],['left','Esquerda'],['center','Centro'],['right','Direita']].map(([value,label])=>button(label,()=>update({alignment:value}),s.alignment===value))}</View>
  <Text accessibilityRole="header" style={styles.heading}>Personalizar cores</Text>
  <View style={styles.choices}>{[['textColor','Texto'],['backgroundColor','Fundo'],['titleColor','Título']].map(([value,label])=>button(label,()=>{setColorTarget(value);setHex(s[value]||'');setError('');},colorTarget===value))}</View>
  <View style={styles.choices}>{['#000000','#FFFFFF','#10233F','#005A9C','#FFF4CF','#175C38','#80204A','#FFD700'].map(color=><TouchableOpacity key={color} accessibilityRole="button" accessibilityLabel={`Cor ${color}`} onPress={()=>{update({[colorTarget]:color});setHex(color);}} style={{minWidth:48,minHeight:48,padding:6,borderWidth:2,borderColor:'#667788',borderRadius:12}}><NativeView style={{width:32,height:32,borderRadius:6,backgroundColor:color}}/></TouchableOpacity>)}</View>
  <TextInput accessibilityLabel="Cor hexadecimal" value={hex} onChangeText={setHex} placeholder="#005A9C" maxLength={7} autoCapitalize="characters" style={styles.input}/>
  {button('Aplicar cor',()=>{if(!/^#[a-f0-9]{6}$/i.test(hex)){setError('Use # e seis caracteres, por exemplo #005A9C.');return;}setError('');update({[colorTarget]:hex});})}
  {!!error&&<Text accessibilityRole="alert" style={styles.description}>{error}</Text>}
  {button('Redefinir cores',()=>{update({textColor:'',backgroundColor:'',titleColor:'',contrast:'original',saturation:'original',highContrast:false});setHex('');})}
  <Text accessibilityRole="header" style={styles.heading}>Recursos do seu celular</Text>
  <Text style={styles.description}>Para explorar por toque com dois dedos e ativar opções com toque duplo, use TalkBack no Android ou VoiceOver no iPhone. Controle por voz, teclado externo e controles assistivos são configurados no sistema. O app não oferece navegação facial nem descrição de imagens por IA.</Text>
  {button('Abrir ajustes do aplicativo',()=>Linking.openSettings().catch(()=>setError('Abra as configurações de acessibilidade do celular.')))}
  {button('Restaurar todas as configurações',()=>{updateAccessibility(ACCESSIBILITY_PRESETS.standard);setHex('');setError('');})}
 </View>;
}
const styles=StyleSheet.create({title:{fontSize:23,fontWeight:'700',color:'#010028',marginVertical:18},heading:{fontSize:19,fontWeight:'700',color:'#010028',marginTop:24,marginBottom:12},selector:{padding:16,backgroundColor:'#E5F2FC',borderRadius:14,minHeight:52},profile:{padding:14,backgroundColor:'white',borderBottomWidth:1,borderColor:'#D7DFE8'},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},tile:{borderWidth:1,borderColor:'#D7DFE8',borderRadius:14,backgroundColor:'#FFFFFF',overflow:'hidden'},tileButton:{padding:12,gap:8,minHeight:160},label:{fontSize:14,fontWeight:'700',color:'#10233F'},description:{fontSize:13,lineHeight:20,color:'#475569',marginTop:6},state:{fontSize:12,fontWeight:'700',color:'#005A9C',marginTop:6},active:{backgroundColor:'#DCEFFC',borderColor:'#0066BE',borderWidth:2},choices:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:12},choice:{padding:12,minHeight:48,borderWidth:1,borderColor:'#A8BDCF',backgroundColor:'white',borderRadius:12,marginTop:8},controls:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},step:{minWidth:44,minHeight:44,alignItems:'center',justifyContent:'center'},input:{minHeight:48,borderWidth:1,borderColor:'#A8BDCF',borderRadius:10,padding:12,backgroundColor:'white',color:'#10233F',fontSize:16}});
