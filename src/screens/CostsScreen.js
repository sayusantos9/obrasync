import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { SCREENS } from '../navigation/routes';
import { formatCompactCurrency, formatCurrency } from '../utils/currency';

const writable = new Set([USER_ROLES.MASTER, USER_ROLES.ENGINEERING]);

export function CostsScreen() {
  const theme = useTheme();
  const { currentUser, dashboard, extraExpenses, openScreen, selectedProject } = useApp();
  const budget = Number(dashboard?.budget || selectedProject?.budget || 0);
  const realized = Number(dashboard?.realized || 0);
  const balance = budget - realized;
  const usage = budget > 0 ? Math.min(100, realized / budget * 100) : 0;
  const over = balance < 0;
  const canWrite = writable.has(currentUser?.role);

  return (
    <Screen><Scroll>
      <View style={[styles.header,{backgroundColor:theme.colors.primary}]}><Text style={styles.title}>Custos da obra</Text><Text style={styles.subtitle}>{selectedProject.name}</Text></View>
      <Content>
        <View style={[styles.totalCard,{backgroundColor:theme.colors.surface,borderColor:theme.colors.border}]}><Text style={[styles.label,{color:theme.colors.textMuted}]}>TOTAL REALIZADO</Text><Text style={[styles.total,{color:theme.colors.text}]}>{formatCompactCurrency(realized)}</Text><View style={[styles.track,{backgroundColor:theme.colors.primarySoft}]}><View style={[styles.fill,{backgroundColor:over?theme.colors.danger:theme.colors.accent,width:`${usage}%`}]} /></View><View style={styles.footer}><Text style={[styles.small,{color:theme.colors.textMuted}]}>{usage.toFixed(1).replace('.',',')}% do orçamento</Text><Text style={[styles.small,{color:theme.colors.textMuted}]}>Previsto {formatCompactCurrency(budget)}</Text></View></View>
        <View style={styles.summaryRow}><Summary title={over?'Acima do orçamento':'Disponível'} value={formatCompactCurrency(Math.abs(balance))} icon={over?'warning-outline':'wallet-outline'} color={over?theme.colors.danger:theme.colors.success} bg={over?theme.colors.dangerSoft:theme.colors.successSoft}/><Summary title="Desvio" value={`${Number(dashboard?.deviation||0)>0?'+':''}${Number(dashboard?.deviation||0).toFixed(1).replace('.',',')}%`} icon="trending-up-outline" color={Number(dashboard?.deviation||0)>0?theme.colors.danger:theme.colors.success} bg={theme.colors.primarySoft}/></View>
        <View style={styles.sectionRow}><Text style={[styles.section,{color:theme.colors.text}]}>Últimas despesas</Text><Text style={[styles.count,{color:theme.colors.primary}]}>{extraExpenses.length} registros</Text></View>
        {!extraExpenses.length&&<Text style={[styles.empty,{color:theme.colors.textMuted}]}>Nenhuma despesa cadastrada nesta obra.</Text>}
        {extraExpenses.slice(0,20).map((expense)=><View key={expense.id} style={[styles.expense,{backgroundColor:theme.colors.surface,borderColor:theme.colors.border}]}><View style={[styles.icon,{backgroundColor:theme.colors.dangerSoft}]}><Ionicons name="receipt-outline" size={21} color={theme.colors.danger}/></View><View style={styles.info}><Text style={[styles.name,{color:theme.colors.text}]}>{expense.name}</Text><Text style={[styles.meta,{color:theme.colors.textMuted}]}>{expense.expense_date||expense.expenseDate||'-'} • {expense.category}</Text></View><Text style={[styles.amount,{color:theme.colors.danger}]}>{formatCurrency(Number(expense.amount||0))}</Text></View>)}
        {canWrite&&<TouchableOpacity accessibilityRole="button" style={[styles.button,{backgroundColor:theme.colors.accent}]} onPress={()=>openScreen(SCREENS.ADD_EXPENSE)}><Ionicons name="add-circle" size={21} color="#FFF"/><Text style={styles.buttonText}>Adicionar despesa</Text></TouchableOpacity>}
      </Content>
    </Scroll></Screen>
  );
}
function Summary({title,value,icon,color,bg}){const theme=useTheme();return <View style={[styles.summary,{backgroundColor:theme.colors.surface,borderColor:theme.colors.border}]}><View style={[styles.icon,{backgroundColor:bg}]}><Ionicons name={icon} size={21} color={color}/></View><Text style={[styles.summaryTitle,{color:theme.colors.textMuted}]}>{title}</Text><Text style={[styles.summaryValue,{color}]}>{value}</Text></View>}
const styles=StyleSheet.create({header:{paddingBottom:36,paddingHorizontal:20,paddingTop:58},title:{color:'#FFF',fontSize:28,fontWeight:'900'},subtitle:{color:'rgba(255,255,255,.72)',fontSize:12,marginTop:4},totalCard:{borderRadius:20,borderWidth:1,marginTop:-18,padding:18},label:{fontSize:10,fontWeight:'900'},total:{fontSize:28,fontWeight:'900',marginTop:7},track:{borderRadius:4,height:7,marginTop:14,overflow:'hidden'},fill:{borderRadius:4,height:7},footer:{flexDirection:'row',justifyContent:'space-between',marginTop:8},small:{fontSize:10},summaryRow:{flexDirection:'row',gap:10,marginTop:12},summary:{borderRadius:18,borderWidth:1,flex:1,padding:14},icon:{alignItems:'center',borderRadius:12,height:42,justifyContent:'center',width:42},summaryTitle:{fontSize:10,fontWeight:'800',marginTop:10},summaryValue:{fontSize:17,fontWeight:'900',marginTop:4},sectionRow:{alignItems:'center',flexDirection:'row',justifyContent:'space-between',marginTop:24},section:{fontSize:19,fontWeight:'900'},count:{fontSize:11,fontWeight:'900'},empty:{fontSize:13,marginTop:14},expense:{alignItems:'center',borderRadius:17,borderWidth:1,flexDirection:'row',marginTop:10,padding:13},info:{flex:1,marginLeft:10},name:{fontSize:13,fontWeight:'900'},meta:{fontSize:10,marginTop:4},amount:{fontSize:12,fontWeight:'900'},button:{alignItems:'center',borderRadius:15,flexDirection:'row',justifyContent:'center',marginBottom:20,marginTop:18,minHeight:54},buttonText:{color:'#FFF',fontSize:14,fontWeight:'900',marginLeft:7}});
