import { Ionicons } from '@expo/vector-icons';
import { ProjectSelector } from '../components/budget/ProjectSelector';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { SCREENS, TABS } from '../navigation/routes';
import { exportDocument } from '../services/documentExportService';
import { theme } from '../theme';
import { formatCurrency } from '../utils/currency';

export function BudgetScreen() {
  const {budgetDocuments,currentUser,dashboard,openScreen,removeBudgetDocument,selectedProject,selectTab}=useApp();
  const [loading,setLoading]=useState('');
  const canWrite=[USER_ROLES.MASTER,USER_ROLES.ENGINEERING].includes(currentUser?.role);
  const documents=budgetDocuments.filter(doc=>selectedProject?.id && doc.projectId===selectedProject.id);
  async function exportBudget(doc, format){
    if(loading)return;setLoading(`${doc.id}-${format}`);
    try{await exportDocument({...doc,companyName:currentUser?.companyName||''},selectedProject,format,'Orçamento');}
    catch(e){Alert.alert(`Não foi possível gerar ${format==='pdf'?'PDF':'Excel'}`,e?.message||'Falha na exportação');}
    finally{setLoading('');}
  }
  function confirmDelete(doc){Alert.alert('Excluir orçamento',`Deseja excluir ${doc.number}?`,[
    {text:'Cancelar',style:'cancel'},
    {text:'Excluir',style:'destructive',onPress:()=>removeBudgetDocument(doc.id).catch(e=>Alert.alert('Erro',e.message))}
  ]);}
  return <Screen><Scroll><View style={styles.header}><Text style={styles.headerTitle}>Orçamento</Text><Text style={styles.headerSub}>{selectedProject?.name||'Nenhuma obra selecionada'}</Text></View><Content>
    <ProjectSelector label="SELECIONAR OBRA PARA ORÇAMENTO"/>
    {!selectedProject ? <View style={styles.empty}><Text style={styles.emptyTitle}>Escolha uma obra</Text><Text style={styles.emptyText}>Selecione uma obra para consultar, exportar ou criar orçamentos.</Text>
      <TouchableOpacity style={styles.createButton} onPress={()=>selectTab(TABS.PROJECTS)}><Text style={styles.createText}>Selecionar obra</Text></TouchableOpacity></View> : <>
      <View style={styles.summary}><Text style={styles.eyebrow}>ORÇAMENTO PREVISTO</Text>
        <Text style={styles.big}>{formatCurrency(Number(dashboard?.budget||selectedProject?.budget||0))}</Text>
        <Text style={styles.summarySub}>{documents.length} documento(s) • {formatCurrency(documents.reduce((n,b)=>n+Number(b.total||0),0))} em orçamentos</Text></View>
      {canWrite&&<TouchableOpacity style={styles.createButton} onPress={()=>openScreen(SCREENS.CREATE_BUDGET)}><Ionicons name="add-circle" color="#FFF" size={22}/><Text style={styles.createText}>Criar novo orçamento</Text></TouchableOpacity>}
      <Text style={styles.sectionTitle}>{currentUser?.role===USER_ROLES.CLIENT?'Meus orçamentos':'Orçamentos cadastrados'}</Text>
      {!documents.length&&<View style={styles.empty}><Ionicons name="calculator-outline" color={theme.colors.primary} size={30}/><Text style={styles.emptyTitle}>Nenhum orçamento para esta obra</Text><Text style={styles.emptyText}>Quando um orçamento for cadastrado, poderá ser compartilhado em PDF e Excel.</Text></View>}
      {documents.map(doc=><View key={doc.id} style={styles.card}><View style={styles.cardTop}><View style={{flex:1}}><Text style={styles.number}>{doc.number}</Text><Text style={styles.title}>{doc.title}</Text></View>
        {canWrite&&<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Excluir ${doc.number}`} onPress={()=>confirmDelete(doc)} style={styles.iconButton}><Ionicons name="trash-outline" color={theme.colors.danger} size={18}/></TouchableOpacity>}</View>
        <Text style={styles.meta}>Cliente: {doc.clientName||'Não informado'}</Text><Text style={styles.meta}>{doc.items?.length||0} item(ns) • validade {doc.validUntil||'não informada'}</Text>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.total}>{formatCurrency(Number(doc.total||0))}</Text></View>
        <View style={styles.exportRow}><TouchableOpacity accessibilityRole="button" disabled={!!loading} style={styles.exportButton} onPress={()=>exportBudget(doc,'pdf')}><Ionicons name="document-text-outline" size={18} color={theme.colors.primary}/><Text style={styles.exportText}>{loading===`${doc.id}-pdf`?'Gerando...':'Gerar PDF'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" disabled={!!loading} style={styles.exportButton} onPress={()=>exportBudget(doc,'excel')}><Ionicons name="grid-outline" size={18} color={theme.colors.primary}/><Text style={styles.exportText}>{loading===`${doc.id}-excel`?'Gerando...':'Gerar Excel'}</Text></TouchableOpacity></View>
      </View>)}
      <TouchableOpacity style={styles.reportsLink} onPress={()=>openScreen(SCREENS.REPORTS)}><Ionicons name="stats-chart-outline" size={20} color={theme.colors.primary}/><Text style={styles.reportsText}>Ver relatórios da obra</Text><Ionicons name="chevron-forward" size={18} color={theme.colors.primary}/></TouchableOpacity>
    </>}
    <View style={{height:85}}/></Content></Scroll></Screen>;
}
const styles=StyleSheet.create({header:{backgroundColor:theme.colors.primary,paddingHorizontal:20,paddingBottom:24,paddingTop:30},headerTitle:{color:'#FFF',fontSize:25,fontWeight:'900'},headerSub:{color:'rgba(255,255,255,.72)',fontSize:12,marginTop:4},summary:{backgroundColor:theme.colors.primary,borderRadius:22,marginTop:20,padding:18},eyebrow:{color:'#A8C6E9',fontSize:10,fontWeight:'900'},big:{color:'#FFF',fontSize:28,fontWeight:'900',marginTop:8},summarySub:{color:'rgba(255,255,255,.75)',fontSize:12,marginTop:6},createButton:{alignItems:'center',backgroundColor:theme.colors.accent,borderRadius:15,flexDirection:'row',justifyContent:'center',marginTop:16,minHeight:54},createText:{color:'#FFF',fontSize:14,fontWeight:'900',marginLeft:6},sectionTitle:{color:theme.colors.text,fontSize:19,fontWeight:'900',marginBottom:12,marginTop:24},empty:{alignItems:'center',backgroundColor:'#FFF',borderColor:theme.colors.border,borderRadius:18,borderWidth:1,padding:25,marginTop:16},emptyTitle:{color:theme.colors.text,fontSize:15,fontWeight:'900',marginTop:8},emptyText:{color:theme.colors.textMuted,fontSize:12,lineHeight:18,marginTop:4,textAlign:'center'},card:{backgroundColor:'#FFF',borderColor:theme.colors.border,borderRadius:18,borderWidth:1,marginBottom:12,padding:16},cardTop:{alignItems:'flex-start',flexDirection:'row'},number:{color:theme.colors.primary,fontSize:11,fontWeight:'900'},title:{color:theme.colors.text,fontSize:16,fontWeight:'900',marginTop:3},iconButton:{padding:6},meta:{color:theme.colors.textMuted,fontSize:11,marginTop:6},totalRow:{alignItems:'center',borderTopColor:theme.colors.border,borderTopWidth:1,flexDirection:'row',justifyContent:'space-between',marginTop:12,paddingTop:12},totalLabel:{color:theme.colors.textMuted,fontSize:11,fontWeight:'800'},total:{color:theme.colors.primaryDark,fontSize:18,fontWeight:'900'},exportRow:{flexDirection:'row',gap:10,marginTop:12},exportButton:{alignItems:'center',justifyContent:'center',flex:1,backgroundColor:theme.colors.primarySoft,borderRadius:10,paddingVertical:12,flexDirection:'row',gap:5},exportText:{fontSize:12,fontWeight:'900',color:theme.colors.primary},reportsLink:{alignItems:'center',backgroundColor:'#FFF',borderRadius:15,borderColor:theme.colors.border,borderWidth:1,padding:16,flexDirection:'row',gap:10,marginTop:15},reportsText:{color:theme.colors.primary,fontWeight:'900',flex:1}});
