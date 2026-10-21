import { Ionicons } from '@expo/vector-icons';
import { ProjectSelector } from '../components/budget/ProjectSelector';
import { useState } from 'react';
import { Alert,StyleSheet,Text,TouchableOpacity,View } from 'react-native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { SCREENS,TABS } from '../navigation/routes';
import { exportDocument } from '../services/documentExportService';
import { theme } from '../theme';
import { formatCurrency } from '../utils/currency';
import { getProjectQuotes } from '../utils/quotes';

export function QuotesScreen(){
 const {openScreen,quotes,removeQuote,selectedProject,selectTab,currentUser}=useApp();
 const [busy,setBusy]=useState('');
 const canManage=[USER_ROLES.MASTER,USER_ROLES.ENGINEERING,USER_ROLES.PURCHASING].includes(currentUser?.role);
 const projectQuotes=getProjectQuotes(quotes,selectedProject?.id);
 async function generate(quote,format){
  if(busy)return;setBusy(`${quote.id}-${format}`);
  try{await exportDocument(quote,selectedProject,format,'Cotação');}
  catch(e){Alert.alert('Erro ao exportar cotação',e?.message||'Falha ao gerar o arquivo.');}
  finally{setBusy('');}
 }
 function confirmRemove(quote){Alert.alert('Excluir cotação',`Excluir ${quote.number}?`,[
   {text:'Cancelar',style:'cancel'},
   {text:'Excluir',style:'destructive',onPress:()=>removeQuote(quote.id).catch(e=>Alert.alert('Erro ao excluir',e?.message||'Falha no Supabase'))},
 ]);}
 return <Screen><ScreenHeader title="Cotações"/><Scroll><Content>
  <View style={styles.hero}><Ionicons name="document-text-outline" size={25} color="#FFF"/><View style={{flex:1,marginLeft:12}}><Text style={styles.heroTitle}>Cotações da obra</Text><Text style={styles.heroSubtitle}>{selectedProject?.name||'Nenhuma obra selecionada'}</Text></View></View>
  <ProjectSelector label="OBRA DAS COTAÇÕES"/>
  {!selectedProject&&<View style={styles.emptyCard}><Text style={styles.emptyTitle}>Escolha uma obra</Text><Text style={styles.emptyText}>Selecione uma obra antes de cadastrar ou consultar cotações.</Text>
  <TouchableOpacity style={styles.createButton} onPress={()=>selectTab(TABS.PROJECTS)}><Text style={styles.createText}>Selecionar obra</Text></TouchableOpacity></View>}
  {selectedProject&&canManage&&<TouchableOpacity style={styles.createButton} onPress={()=>openScreen(SCREENS.CREATE_QUOTE)}><Ionicons name="add-circle" size={22} color="#FFF"/><Text style={styles.createText}>Nova cotação / Modelo-base</Text></TouchableOpacity>}
  <Text style={styles.sectionTitle}>Cotações cadastradas</Text>
  {selectedProject&&!projectQuotes.length&&<View style={styles.emptyCard}><Ionicons name="documents-outline" size={34} color={theme.colors.primary}/><Text style={styles.emptyTitle}>Nenhuma cotação cadastrada</Text><Text style={styles.emptyText}>Crie uma cotação e informe fornecedor, cliente, validade e itens.</Text></View>}
  {projectQuotes.map(quote=><View key={quote.id} style={styles.card}><View style={{flexDirection:'row',alignItems:'flex-start'}}><View style={{flex:1}}><Text style={styles.number}>{quote.number}</Text><Text style={styles.title}>{quote.title}</Text></View>
  {canManage&&<TouchableOpacity accessibilityLabel={`Excluir ${quote.number}`} onPress={()=>confirmRemove(quote)}><Ionicons name="trash-outline" color={theme.colors.danger} size={19}/></TouchableOpacity>}</View>
  <Text style={styles.meta}>Cliente: {quote.clientName||'Não informado'}</Text><Text style={styles.meta}>Fornecedor: {quote.supplierName||'Não informado'}</Text>
  <Text style={styles.meta}>{quote.items?.length||0} itens • válida até {quote.validUntil||'não informada'}</Text>
  <Text style={styles.total}>Total: {formatCurrency(Number(quote.total||0))}</Text>
  <View style={styles.actions}><TouchableOpacity disabled={!!busy} style={styles.docButton} onPress={()=>generate(quote,'pdf')}><Ionicons name="document-outline" size={16} color={theme.colors.primary}/><Text style={styles.docText}>PDF</Text></TouchableOpacity>
  <TouchableOpacity disabled={!!busy} style={styles.docButton} onPress={()=>generate(quote,'excel')}><Ionicons name="grid-outline" size={16} color={theme.colors.primary}/><Text style={styles.docText}>Excel</Text></TouchableOpacity></View></View>)}
  <View style={{height:60}}/></Content></Scroll></Screen>;
}
const styles=StyleSheet.create({hero:{backgroundColor:theme.colors.primaryDark,borderRadius:18,marginTop:20,padding:18,flexDirection:'row',alignItems:'center'},heroTitle:{color:'#FFF',fontSize:18,fontWeight:'900'},heroSubtitle:{color:'#D6E1F0',fontSize:12,marginTop:4},createButton:{backgroundColor:theme.colors.primary,borderRadius:14,marginTop:15,minHeight:52,alignItems:'center',justifyContent:'center',flexDirection:'row'},createText:{color:'#FFF',fontWeight:'900',fontSize:14,marginLeft:7},sectionTitle:{color:theme.colors.text,fontWeight:'900',fontSize:19,marginTop:24,marginBottom:14},emptyCard:{backgroundColor:'#FFF',borderColor:theme.colors.border,borderWidth:1,borderRadius:16,padding:22,marginTop:12,alignItems:'center'},emptyTitle:{color:theme.colors.text,fontWeight:'900',fontSize:15,marginTop:8},emptyText:{color:theme.colors.textMuted,fontSize:12,textAlign:'center',marginTop:6},card:{backgroundColor:'#FFF',borderColor:theme.colors.border,borderWidth:1,borderRadius:16,padding:16,marginTop:12},number:{color:theme.colors.primary,fontSize:11,fontWeight:'900'},title:{color:theme.colors.text,fontSize:16,fontWeight:'900',marginTop:4},meta:{color:theme.colors.textMuted,fontSize:11,marginTop:6},total:{color:theme.colors.primaryDark,fontWeight:'900',fontSize:17,marginTop:12},actions:{flexDirection:'row',gap:10,marginTop:12},docButton:{alignItems:'center',justifyContent:'center',flexDirection:'row',backgroundColor:theme.colors.primarySoft,paddingHorizontal:20,paddingVertical:12,borderRadius:11,gap:6},docText:{color:theme.colors.primary,fontSize:12,fontWeight:'900'}});
