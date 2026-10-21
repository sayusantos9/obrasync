import { Ionicons } from '@expo/vector-icons';
import { ProjectSelector } from '../components/budget/ProjectSelector';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { SCREENS, TABS } from '../navigation/routes';
import { exportDocument } from '../services/documentExportService';
import { buildReports, exportReport } from '../services/reportService';
import { theme } from '../theme';
import { formatCurrency } from '../utils/currency';

const REPORTS = [
  {id:'budgets',title:'Orçamentos',icon:'calculator-outline'},
  {id:'quotes',title:'Cotações',icon:'document-text-outline'},
  {id:'expenses',title:'Despesas',icon:'wallet-outline'},
  {id:'requests',title:'Solicitações',icon:'clipboard-outline'},
  {id:'orders',title:'Pedidos de compra',icon:'cart-outline'},
  {id:'receipts',title:'Recebimentos',icon:'archive-outline'},
];

export function ReportsScreen() {
  const {budgetDocuments, quotes, extraExpenses, requests, orders, receipts,
    selectedProject, currentUser, selectTab, openScreen} = useApp();
  const [loading,setLoading] = useState('');
  const isClient = currentUser?.role === USER_ROLES.CLIENT;
  const reports = useMemo(() => buildReports({budgetDocuments,quotes:isClient?[]:quotes,extraExpenses:isClient?[]:extraExpenses,
    requests:isClient?[]:requests,orders:isClient?[]:orders,receipts:isClient?[]:receipts},selectedProject?.id),
    [budgetDocuments,quotes,extraExpenses,requests,orders,receipts,selectedProject?.id,isClient]);
  const available = isClient ? REPORTS.filter(item=>item.id==='budgets') : REPORTS;

  async function generate(reportId,format){
    if(loading || !selectedProject?.id) return;
    setLoading(`${reportId}-${format}`);
    try{await exportReport(reports,reportId,selectedProject,format);}
    catch(error){Alert.alert('Erro ao gerar relatório',error?.message||'Não foi possível exportar o arquivo.');}
    finally{setLoading('');}
  }
  async function exportBudget(doc,format){
    if(loading)return;
    setLoading(`${doc.id}-${format}`);
    try{await exportDocument(doc,selectedProject,format,'Orçamento');}
    catch(error){Alert.alert('Erro de exportação',error?.message||'Não foi possível gerar o arquivo.');}
    finally{setLoading('');}
  }
  return (<Screen><ScreenHeader title="Relatórios"/><Scroll><Content>
    <ProjectSelector label="OBRA DOS RELATÓRIOS"/>
    <View style={styles.hero}><Text style={styles.kicker}>VISÃO GERENCIAL</Text>
    <Text style={styles.heroTitle}>{selectedProject?.name || 'Selecione uma obra'}</Text>
    <Text style={styles.heroMeta}>Relatórios gerados a partir dos dados disponíveis no aplicativo</Text></View>
    {!selectedProject ? <View style={styles.noProject}><Text style={styles.heading}>Nenhuma obra selecionada</Text><Text style={styles.desc}>Escolha uma obra para consultar e emitir seus documentos.</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={()=>selectTab(TABS.PROJECTS)}><Text style={styles.primaryText}>Selecionar obra</Text></TouchableOpacity></View> : <>
      <View style={styles.kpiRow}><View style={styles.kpi}><Text style={styles.kpiValue}>{reports.budgets.rows.length}</Text><Text style={styles.kpiLabel}>Orçamentos</Text></View>
      <View style={styles.kpi}><Text style={styles.kpiValue}>{reports.quotes.rows.length}</Text><Text style={styles.kpiLabel}>Cotações</Text></View></View>
      <Text style={styles.heading}>Exportar relatórios</Text>
      {!isClient&&<View style={styles.reportCard}><View style={{flex:1}}><Text style={styles.cardTitle}>Relatório consolidado</Text><Text style={styles.cardDesc}>Resumo de todos os módulos</Text></View>
      <Action label="PDF" icon="document-outline" disabled={!!loading} onPress={()=>generate('all','pdf')}/><Action label="Excel" icon="grid-outline" disabled={!!loading} onPress={()=>generate('all','excel')}/></View>}
      {available.map(item=><View key={item.id} style={styles.reportCard}><View style={styles.reportIcon}><Ionicons name={item.icon} size={21} color={theme.colors.primary}/></View>
      <View style={{flex:1}}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.cardDesc}>{reports[item.id].rows.length} registro(s){reports[item.id].total!==undefined?` • ${formatCurrency(reports[item.id].total)}`:''}</Text></View>
      <Action label="PDF" icon="document-outline" disabled={!!loading} onPress={()=>generate(item.id,'pdf')}/><Action label="Excel" icon="grid-outline" disabled={!!loading} onPress={()=>generate(item.id,'excel')}/></View>)}
      <Text style={styles.heading}>Documentos de orçamento</Text>
      {!reports.budgets.rows.length&&<Text style={styles.desc}>Ainda não há orçamentos cadastrados para esta obra.</Text>}
      {budgetDocuments.filter(doc=>doc.projectId===selectedProject.id).map(doc=><View key={doc.id} style={styles.docCard}>
        <Text style={styles.cardTitle}>{doc.number} • {doc.title}</Text><Text style={styles.cardDesc}>{doc.items?.length||0} itens • {formatCurrency(doc.total)}</Text>
        <View style={styles.docActions}><Action label="PDF" icon="document-outline" disabled={!!loading} onPress={()=>exportBudget(doc,'pdf')}/><Action label="Excel" icon="grid-outline" disabled={!!loading} onPress={()=>exportBudget(doc,'excel')}/></View></View>)}
      {currentUser?.role===USER_ROLES.ENGINEERING&&<TouchableOpacity onPress={()=>openScreen(SCREENS.QUOTES)} style={styles.link}><Text style={styles.linkText}>Ver cotações do Orçamentista →</Text></TouchableOpacity>}
      <Text style={styles.footer}>Observação: os módulos que ainda usam dados de demonstração não representam registros persistidos no Supabase.</Text>
    </>}
  </Content></Scroll></Screen>);
}
function Action({label,icon,onPress,disabled}){return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Gerar ${label}`} disabled={disabled} style={[styles.action,disabled&&{opacity:.5}]} onPress={onPress}><Ionicons name={icon} size={15} color={theme.colors.primary}/><Text style={styles.actionText}>{label}</Text></TouchableOpacity>}
const styles=StyleSheet.create({
  hero:{backgroundColor:theme.colors.primary,borderRadius:18,marginTop:18,padding:19},kicker:{color:'#C5D8F2',fontSize:10,fontWeight:'900',letterSpacing:1},heroTitle:{fontSize:22,color:'#FFF',fontWeight:'900',marginTop:8},heroMeta:{color:'#D0DAEA',fontSize:12,marginTop:5},
  noProject:{backgroundColor:'#FFF',borderColor:theme.colors.border,borderWidth:1,borderRadius:14,marginTop:18,padding:16},heading:{fontSize:18,fontWeight:'900',color:theme.colors.text,marginTop:22,marginBottom:9},desc:{fontSize:12,color:theme.colors.textMuted,marginTop:4},
  primaryButton:{marginTop:14,backgroundColor:theme.colors.primary,borderRadius:12,padding:12,alignItems:'center'},primaryText:{color:'#FFF',fontWeight:'900'},
  kpiRow:{flexDirection:'row',marginTop:14,gap:10},kpi:{flex:1,backgroundColor:'#FFF',borderColor:theme.colors.border,borderWidth:1,borderRadius:14,padding:14},kpiValue:{fontSize:23,fontWeight:'900',color:theme.colors.primary},kpiLabel:{fontSize:11,color:theme.colors.textMuted},
  reportCard:{backgroundColor:'#FFF',borderColor:theme.colors.border,borderWidth:1,borderRadius:14,flexDirection:'row',alignItems:'center',marginTop:10,padding:11,gap:7},reportIcon:{backgroundColor:theme.colors.primarySoft,borderRadius:12,padding:10},cardTitle:{fontSize:13,fontWeight:'900',color:theme.colors.text},cardDesc:{fontSize:10,color:theme.colors.textMuted,marginTop:5},
  action:{flexDirection:'row',alignItems:'center',borderColor:theme.colors.border,borderWidth:1,borderRadius:9,paddingHorizontal:9,paddingVertical:10,gap:4},actionText:{fontSize:10,fontWeight:'900',color:theme.colors.primary},
  docCard:{backgroundColor:'#FFF',borderColor:theme.colors.border,borderWidth:1,borderRadius:14,padding:14,marginTop:9},docActions:{flexDirection:'row',gap:8,marginTop:12},link:{marginTop:20,marginBottom:4},linkText:{color:theme.colors.primary,fontWeight:'800'},footer:{color:theme.colors.textMuted,fontSize:11,lineHeight:17,marginTop:18,marginBottom:34},
});
