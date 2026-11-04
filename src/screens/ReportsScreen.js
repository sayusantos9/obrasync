import { Ionicons } from '@expo/vector-icons';
import { ProjectSelector } from '../components/budget/ProjectSelector';
import { useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlanengenScreen, usePlanengenStyle } from '../components/layout/PlanengenScreen';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { SCREENS, TABS } from '../navigation/routes';
import { exportDocument } from '../services/documentExportService';
import { buildReports, exportReport } from '../services/reportService';
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
  const lock=useRef(false);
  const {colors,text}=usePlanengenStyle();
  const [showProjects,setShowProjects]=useState(false);
  const isClient = currentUser?.role === USER_ROLES.CLIENT;
  const reports = useMemo(() => buildReports({budgetDocuments,quotes:isClient?[]:quotes,extraExpenses:isClient?[]:extraExpenses,
    requests:isClient?[]:requests,orders:isClient?[]:orders,receipts:isClient?[]:receipts},selectedProject?.id),
    [budgetDocuments,quotes,extraExpenses,requests,orders,receipts,selectedProject?.id,isClient]);
  const available = isClient ? REPORTS.filter(item=>item.id==='budgets') : REPORTS;

  async function generate(reportId,format){
    if(lock.current || !selectedProject?.id) return;
    lock.current=true;
    setLoading(`${reportId}-${format}`);
    try{await exportReport(reports,reportId,selectedProject,format);}
    catch(error){Alert.alert('Erro ao gerar relatório',error?.message||'Não foi possível exportar o arquivo.');}
    finally{lock.current=false;setLoading('');}
  }
  async function exportBudget(doc,format){
    if(lock.current || !selectedProject?.id)return;
    lock.current=true;
    setLoading(`${doc.id}-${format}`);
    try{await exportDocument(doc,selectedProject,format,'Orçamento');}
    catch(error){Alert.alert('Erro de exportação',error?.message||'Não foi possível gerar o arquivo.');}
    finally{lock.current=false;setLoading('');}
  }
  const documents=budgetDocuments.filter(doc=>doc.projectId===selectedProject?.id);
  const count=available.reduce((sum,item)=>sum+reports[item.id].rows.length,0);
  const cardStyle=[styles.card,{borderColor:colors.border}];
  return <PlanengenScreen title="Relatórios" bottomTabs>
    <View style={[styles.hero,{backgroundColor:colors.navy}]}>
      <Ionicons name="bar-chart-outline" size={27} color="#70BFFF"/>
      <Text style={text(styles.heroTitle,'#FFFFFF')}>Da obra para a decisão.</Text>
      <Text style={text(styles.body,'#D5E6FF')}>Consulte os registros e compartilhe seus relatórios em PDF ou Excel.</Text>
    </View>
    <TouchableOpacity accessibilityRole="button" accessibilityState={{expanded:showProjects}} onPress={()=>setShowProjects(v=>!v)} style={[styles.project,{borderColor:colors.border}]}>
      <View style={styles.icon}><Ionicons name="business-outline" size={22} color={colors.blue}/></View>
      <View style={{flex:1}}><Text style={text(styles.label,colors.muted)}>OBRA DOS RELATÓRIOS</Text><Text style={text(styles.cardTitle)}>{selectedProject?.name||'Selecione uma obra'}</Text></View>
      <Ionicons name={showProjects?'chevron-up':'chevron-down'} size={20} color={colors.blue}/>
    </TouchableOpacity>
    {(showProjects||!selectedProject)&&<ProjectSelector label="ESCOLHER OBRA"/>}
    {!selectedProject ? <View style={cardStyle}>
      <Ionicons name="folder-open-outline" size={30} color={colors.blue}/>
      <Text style={text(styles.heading)}>Escolha a obra para começar</Text><Text style={text(styles.body,colors.muted)}>Os relatórios serão organizados pelos registros da obra selecionada.</Text>
      <TouchableOpacity accessibilityRole="button" onPress={()=>selectTab(TABS.PROJECTS)} style={[styles.primary,{backgroundColor:colors.navy}]}><Text style={text(styles.actionText,'#FFFFFF')}>Selecionar obra</Text></TouchableOpacity>
    </View> : <>
      <View style={styles.kpis}>{[[String(available.length),'Tipos de relatório'],[String(count),'Registros disponíveis']].map(([value,label])=><View key={label} style={[styles.kpi,{borderColor:colors.border}]}><Text style={text(styles.value,colors.navy)}>{value}</Text><Text style={text(styles.small,colors.muted)}>{label}</Text></View>)}</View>
      {!!loading&&<View accessibilityLiveRegion="polite" style={styles.notice}><Text style={text(styles.body,colors.blue)}>Preparando arquivo para compartilhar…</Text></View>}
      <Text accessibilityRole="header" style={text(styles.heading)}>Exportar relatórios</Text>
      {!isClient&&<View style={[...cardStyle,{borderColor:colors.blue}]}>
        <View style={styles.cardHeading}><View style={styles.icon}><Ionicons name="layers-outline" size={24} color={colors.blue}/></View><View style={{flex:1}}><Text style={text(styles.cardTitle)}>Relatório consolidado</Text><Text style={text(styles.small,colors.muted)}>Todos os módulos disponíveis em um arquivo.</Text></View></View>
        <View style={styles.actions}><Action label="PDF" context="Relatório consolidado" disabled={!!loading} onPress={()=>generate('all','pdf')}/><Action label="Excel" context="Relatório consolidado" disabled={!!loading} onPress={()=>generate('all','excel')}/></View>
      </View>}
      {available.map(item=><View key={item.id} style={cardStyle}>
        <View style={styles.cardHeading}><View style={styles.icon}><Ionicons name={item.icon} size={23} color={colors.blue}/></View><View style={{flex:1}}><Text style={text(styles.cardTitle)}>{item.title}</Text><Text style={text(styles.small,colors.muted)}>{reports[item.id].rows.length} registro(s)</Text></View></View>
        {reports[item.id].total!==undefined&&<View style={[styles.total,{borderColor:colors.border}]}><Text style={text(styles.small,colors.muted)}>Soma dos registros</Text><Text style={text(styles.amount,colors.navy)}>{formatCurrency(reports[item.id].total)}</Text></View>}
        <View style={styles.actions}><Action label="PDF" context={item.title} disabled={!!loading} onPress={()=>generate(item.id,'pdf')}/><Action label="Excel" context={item.title} disabled={!!loading} onPress={()=>generate(item.id,'excel')}/></View>
      </View>)}
      <Text accessibilityRole="header" style={text(styles.heading)}>Documentos de orçamento</Text>
      {!documents.length&&<View style={cardStyle}><Text style={text(styles.body,colors.muted)}>Nenhum orçamento disponível para esta obra.</Text></View>}
      {documents.map(doc=><View key={doc.id} style={cardStyle}>
        <Text style={text(styles.label,colors.blue)}>{doc.number}</Text><Text style={text(styles.cardTitle)}>{doc.title}</Text><Text style={text(styles.small,colors.muted)}>{doc.items?.length||0} itens · {formatCurrency(doc.total)}</Text>
        <View style={styles.actions}><Action label="PDF" context={doc.number} disabled={!!loading} onPress={()=>exportBudget(doc,'pdf')}/><Action label="Excel" context={doc.number} disabled={!!loading} onPress={()=>exportBudget(doc,'excel')}/></View>
      </View>)}
      {currentUser?.role===USER_ROLES.ENGINEERING&&<TouchableOpacity accessibilityRole="button" onPress={()=>openScreen(SCREENS.QUOTES)} style={styles.link}><Text style={text(styles.actionText,colors.blue)}>Consultar cotações →</Text></TouchableOpacity>}
      <View style={styles.notice}><Ionicons name="information-circle-outline" size={22} color={colors.blue}/><Text style={[text(styles.small,colors.muted),{flex:1}]}>Os arquivos refletem os dados carregados e as permissões do seu perfil. A soma de orçamentos pode incluir alternativas; não representa uma única previsão da obra. Pedidos não equivalem automaticamente a compras realizadas.</Text></View>
    </>}
  </PlanengenScreen>;
}
function Action({label,context,onPress,disabled}) {
 const {colors,text}=usePlanengenStyle();
 return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Exportar ${context} em ${label}`} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[styles.action,{borderColor:colors.border,opacity:disabled?.5:1}]}><Ionicons name={label==='PDF'?'document-text-outline':'grid-outline'} size={20} color={colors.blue}/><Text style={text(styles.actionText,colors.blue)}>{label}</Text></TouchableOpacity>;
}
const styles=StyleSheet.create({
 hero:{borderRadius:20,padding:22,gap:10},heroTitle:{fontSize:25,fontWeight:'700',letterSpacing:-.5},body:{fontSize:14,lineHeight:22},
 project:{backgroundColor:'#FFFFFF',borderWidth:1,borderRadius:16,padding:16,marginTop:18,flexDirection:'row',alignItems:'center',gap:12},
 label:{fontSize:11,fontWeight:'700',marginBottom:6},heading:{fontSize:20,fontWeight:'700',marginTop:26,marginBottom:8},cardTitle:{fontSize:16,fontWeight:'600',lineHeight:23},small:{fontSize:12,lineHeight:19,marginTop:4},
 card:{backgroundColor:'#FFFFFF',borderWidth:1,borderRadius:18,padding:18,marginTop:12},cardHeading:{flexDirection:'row',alignItems:'center',gap:12},icon:{width:44,height:44,borderRadius:13,backgroundColor:'#E7F2FE',alignItems:'center',justifyContent:'center'},
 kpis:{flexDirection:'row',gap:12,marginTop:18},kpi:{flex:1,backgroundColor:'#FFFFFF',borderWidth:1,borderRadius:16,padding:16},value:{fontSize:28,fontWeight:'700'},
 total:{marginTop:16,paddingTop:12,borderTopWidth:1},amount:{fontSize:22,fontWeight:'700',marginTop:4},actions:{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:18},
 action:{flexGrow:1,flexBasis:90,minHeight:48,padding:12,borderRadius:12,borderWidth:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,backgroundColor:'#F3F8FE'},actionText:{fontSize:14,fontWeight:'600'},
 primary:{minHeight:48,borderRadius:12,padding:14,alignItems:'center',marginTop:18},notice:{marginTop:22,flexDirection:'row',gap:10},link:{paddingVertical:18,minHeight:48,marginTop:12},
});
