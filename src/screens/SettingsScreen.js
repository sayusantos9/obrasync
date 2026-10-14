import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { SCREENS } from '../navigation/routes';

function Item({icon,title,subtitle,onPress,right}){const theme=useTheme();return <TouchableOpacity accessibilityRole={onPress?'button':undefined} disabled={!onPress} onPress={onPress} style={[styles.item,{backgroundColor:theme.colors.surface,borderColor:theme.colors.border}]}><View style={[styles.icon,{backgroundColor:theme.colors.primarySoft}]}><Ionicons name={icon} size={22} color={theme.colors.primary}/></View><View style={styles.info}><Text style={[styles.title,{color:theme.colors.text}]}>{title}</Text>{!!subtitle&&<Text style={[styles.subtitle,{color:theme.colors.textMuted}]}>{subtitle}</Text>}</View>{right||(onPress&&<Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted}/>)}</TouchableOpacity>}

export function SettingsScreen(){const theme=useTheme();const{isOffline,setIsOffline,openScreen,pendingRequests,syncPendingRequests}=useApp();return <Screen><ScreenHeader title="Configurações"/><Scroll><Content>
  <View style={[styles.demo,{backgroundColor:theme.colors.accentSoft}]}><Ionicons name="flask-outline" size={21} color={theme.colors.accent}/><View style={styles.demoInfo}><Text style={[styles.demoTitle,{color:theme.colors.text}]}>Versão demonstrativa</Text><Text style={[styles.demoBody,{color:theme.colors.textMuted}]}>Funciona localmente no Expo Go. Nenhum servidor, API ou banco de dados é necessário para a apresentação.</Text></View></View>
  <Text style={[styles.section,{color:theme.colors.text}]}>Aplicativo</Text>
  <Item icon="accessibility-outline" title="Acessibilidade" subtitle="Contraste, texto, leitor de tela, vibração e alertas visuais" onPress={()=>openScreen(SCREENS.ACCESSIBILITY)}/>
  <Item icon="book-outline" title="Cartilha de uso" subtitle="Como usar perfis, orçamento, compras, QR e permissões" onPress={()=>openScreen(SCREENS.GUIDE)}/>
  <Item icon="cloud-offline-outline" title="Simular modo offline" subtitle="Demonstra solicitações locais pendentes" right={<Switch value={isOffline} onValueChange={setIsOffline} trackColor={{false:'#D7DFEA',true:theme.colors.accent}} thumbColor="#FFF"/>}/>
  <Item icon="sync-outline" title={`Simular sincronização (${pendingRequests.length})`} subtitle="Move pendências para a lista local da demonstração" onPress={syncPendingRequests}/>
  <View style={[styles.security,{backgroundColor:theme.colors.primary}]}><Ionicons name="phone-portrait-outline" size={22} color="#FFF"/><View style={styles.securityText}><Text style={styles.securityTitle}>Dados locais de demonstração</Text><Text style={styles.securityBody}>Ao fechar ou recarregar o projeto, os dados podem voltar ao estado inicial. Esta versão foi feita apenas para apresentar o fluxo do ObraSync.</Text></View></View>
</Content></Scroll></Screen>}

const styles=StyleSheet.create({section:{fontSize:18,fontWeight:'900',marginBottom:4,marginTop:22},item:{alignItems:'center',borderRadius:18,borderWidth:1,flexDirection:'row',marginTop:10,padding:14},icon:{alignItems:'center',borderRadius:13,height:44,justifyContent:'center',width:44},info:{flex:1,marginHorizontal:12},title:{fontSize:14,fontWeight:'900'},subtitle:{fontSize:11,lineHeight:17,marginTop:3},demo:{alignItems:'flex-start',borderRadius:18,flexDirection:'row',marginTop:18,padding:15},demoInfo:{flex:1,marginLeft:10},demoTitle:{fontSize:14,fontWeight:'900'},demoBody:{fontSize:11,lineHeight:17,marginTop:3},security:{alignItems:'flex-start',borderRadius:18,flexDirection:'row',marginBottom:24,marginTop:20,padding:16},securityText:{flex:1,marginLeft:11},securityTitle:{color:'#FFF',fontSize:14,fontWeight:'900'},securityBody:{color:'rgba(255,255,255,.76)',fontSize:11,lineHeight:17,marginTop:4}});
