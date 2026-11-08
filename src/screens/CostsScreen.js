import {AccessibleIonicons as Ionicons} from '../components/accessibility/AccessibleNative';
import {AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';

import { StyleSheet, useWindowDimensions } from 'react-native';
import { InventoryScreen, useInventoryTheme, useInventoryStyles } from '../components/layout/InventoryScreen';
import { useApp } from '../contexts/AppContext';
import { SCREENS, TABS } from '../navigation/routes';
import { canPerform } from '../utils/permissions';
import { formatCurrency } from '../utils/currency';

export function CostsScreen() {
 const theme=useInventoryTheme();
 const styles=useInventoryStyles(makeStyles(theme));
 const {width,fontScale}=useWindowDimensions();
 const compact=width<360 || fontScale*(theme.fontScale||1)>1.2;
 const {currentUser,dashboard,extraExpenses=[],openScreen,selectedProject,selectTab}=useApp();
 const expenses=extraExpenses.filter(e=>e.projectId===selectedProject?.id);
 const budget=Number(dashboard?.budget ?? selectedProject?.budget ?? 0);
 const realized=Number(dashboard?.realized || 0);
 const balance=budget-realized;
 const usage=budget>0?Math.max(0,realized/budget*100):null;
 const over=balance<0;
 const canWrite=canPerform(currentUser?.role,'writeExpense');
 const sorted=[...expenses].sort((a,b)=>String(b.expense_date||b.expenseDate||'').localeCompare(String(a.expense_date||a.expenseDate||'')));
 const expenseTotal=expenses.reduce((n,e)=>n+Number(e.amount||0),0);
 function date(value){if(!value)return 'Data não informada';const v=String(value).slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(v)?v.split('-').reverse().join('/'):v;}
 function link(title,description,icon,route){return <TouchableOpacity key={route} accessibilityRole="button" accessibilityLabel={title} onPress={()=>openScreen(route)} style={styles.action}><View style={styles.icon}><Ionicons name={icon} size={23} color={theme.colors.accent}/></View><View style={styles.flex}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.description}>{description}</Text></View><Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted}/></TouchableOpacity>;}
 return <InventoryScreen title="Custos da obra">
  {!selectedProject ? <View style={styles.card}><Text style={styles.heading}>Escolha uma obra</Text><Text style={styles.description}>Selecione uma obra para acompanhar os custos.</Text><TouchableOpacity accessibilityRole="button" onPress={()=>selectTab(TABS.PROJECTS)} style={styles.button}><Text style={styles.buttonText}>Selecionar obra</Text></TouchableOpacity></View> : <>
   <TouchableOpacity accessibilityRole="button" accessibilityLabel="Consultar ou trocar obra" onPress={()=>selectTab(TABS.PROJECTS)} style={styles.project}><Ionicons name="construct-outline" size={23} color={theme.colors.accent}/><View style={styles.flex}><Text style={styles.label}>OBRA SELECIONADA</Text><Text style={styles.actionTitle}>{selectedProject.name}</Text></View><Ionicons name="chevron-forward" size={18} color={theme.colors.accent}/></TouchableOpacity>
   <View style={styles.hero}><Text style={styles.heroLabel}>TOTAL REALIZADO</Text><Text style={styles.total}>{formatCurrency(realized)}</Text><Text style={styles.heroDescription}>Compras confirmadas e despesas adicionais da obra.</Text>
    <View accessibilityRole="progressbar" accessibilityLabel="Consumo do orçamento" accessibilityValue={usage===null?{text:'Sem orçamento de referência'}:{min:0,max:100,now:Math.min(100,usage),text:usage.toFixed(1)+'% do orçamento'}} style={styles.track}><View style={[styles.fill,{width:(usage===null?0:Math.min(100,usage))+'%',backgroundColor:over?'#FFB7B7':'#8DCBFF'}]}/></View>
    <Text style={styles.heroDescription}>{usage===null?'Sem orçamento de referência':usage.toFixed(1).replace('.',',')+'% do orçamento utilizado'}</Text>
   </View>
   <View style={[styles.summaryRow,compact&&styles.stack]}><View style={[styles.card,styles.flex]}><Text style={styles.label}>ORÇAMENTO PREVISTO</Text><Text style={styles.value}>{formatCurrency(budget)}</Text></View><View style={[styles.card,styles.flex]}><Text style={styles.label}>{over?'ACIMA DO ORÇAMENTO':'SALDO DO ORÇAMENTO'}</Text><Text style={[styles.value,over&&{color:theme.colors.danger}]}>{formatCurrency(Math.abs(balance))}</Text></View></View>
   <Text style={styles.heading}>Controle financeiro</Text><Text style={styles.description}>Consulte as diferenças e planeje as próximas aquisições.</Text>
   <View style={styles.modules}>
    {canPerform(currentUser?.role,'writeBudget')&&link('Comparar orçamento e compras','Preços, quantidades e impacto no custo.','git-compare-outline',SCREENS.COMPARISON)}
    {canPerform(currentUser?.role,'writeQuote')&&link('Pesquisa de preços','Consulte e registre preços de fornecedores.','search-outline',SCREENS.MARKET_PRICES)}
    {link('Relatórios da obra','Consulte e exporte os registros.','bar-chart-outline',SCREENS.REPORTS)}
   </View>
   <View style={styles.sectionRow}><Text style={[styles.heading,styles.flex]}>Despesas adicionais</Text><Text style={styles.count}>{expenses.length} registro(s)</Text></View>
   <Text style={styles.description}>Total: {formatCurrency(expenseTotal)}. Evite repetir valores já registrados nas compras.</Text>
   {canWrite&&<TouchableOpacity accessibilityRole="button" onPress={()=>openScreen(SCREENS.ADD_EXPENSE)} style={styles.button}><Ionicons name="add-circle-outline" size={22} color="#FFFFFF"/><Text style={styles.buttonText}>Adicionar despesa</Text></TouchableOpacity>}
   {!sorted.length&&<View style={styles.empty}><Ionicons name="receipt-outline" size={30} color={theme.colors.accent}/><Text style={styles.actionTitle}>Nenhuma despesa adicional</Text><Text style={styles.description}>Os lançamentos desta obra aparecerão aqui.</Text></View>}
   {sorted.map(expense=><View key={expense.id} style={styles.expense}><View style={styles.expenseTop}><View style={styles.icon}><Ionicons name="receipt-outline" size={22} color={theme.colors.accent}/></View><View style={styles.flex}><Text style={styles.actionTitle}>{expense.name}</Text><Text style={styles.description}>{date(expense.expense_date||expense.expenseDate)}{expense.category?' · '+expense.category:''}</Text></View></View><Text style={styles.amount}>{formatCurrency(Number(expense.amount||0))}</Text></View>)}
   <Text style={styles.footer}>PLANENGEN · OBRASYNC</Text>
  </>}
 </InventoryScreen>;
}
const makeStyles=theme=>StyleSheet.create({
 flex:{flex:1},project:{flexDirection:'row',alignItems:'center',gap:12,padding:16,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:theme.colors.border,borderRadius:16,marginBottom:16},label:{fontSize:10,fontWeight:'700',letterSpacing:.5,color:theme.colors.textMuted},hero:{padding:22,backgroundColor:theme.colors.primary,borderRadius:20},heroLabel:{fontSize:10,fontWeight:'700',letterSpacing:1,color:'#8DCBFF'},total:{fontSize:32,fontWeight:'700',letterSpacing:-.8,color:'#FFFFFF',marginTop:12},heroDescription:{fontSize:12,color:'#DCE4F0',marginTop:10},track:{height:6,backgroundColor:'#333258',borderRadius:4,overflow:'hidden',marginTop:24},fill:{height:'100%',borderRadius:4},summaryRow:{flexDirection:'row',gap:12,marginTop:14},stack:{flexDirection:'column'},card:{padding:16,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:theme.colors.border,borderRadius:16},value:{fontSize:19,fontWeight:'700',color:theme.colors.primary,marginTop:10},heading:{fontSize:21,fontWeight:'700',color:theme.colors.primary,letterSpacing:-.4,marginTop:24},description:{fontSize:12,color:theme.colors.textMuted,marginTop:6},modules:{backgroundColor:'#FFFFFF',borderRadius:18,borderWidth:1,borderColor:theme.colors.border,overflow:'hidden',marginTop:16},action:{flexDirection:'row',alignItems:'center',gap:12,padding:16,borderBottomWidth:1,borderColor:theme.colors.border},icon:{width:42,height:42,borderRadius:12,backgroundColor:theme.colors.primarySoft,alignItems:'center',justifyContent:'center'},actionTitle:{fontSize:15,fontWeight:'600',color:theme.colors.primary},sectionRow:{flexDirection:'row',alignItems:'baseline',gap:10},count:{fontSize:11,color:theme.colors.accent,fontWeight:'600'},button:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,padding:16,minHeight:54,backgroundColor:theme.colors.accent,borderRadius:14,marginTop:18,marginBottom:8},buttonText:{fontSize:14,fontWeight:'700',color:'#FFFFFF',flexShrink:1,textAlign:'center'},expense:{backgroundColor:'#FFFFFF',borderRadius:16,borderWidth:1,borderColor:theme.colors.border,padding:16,marginTop:10},expenseTop:{flexDirection:'row',alignItems:'center',gap:12},amount:{fontSize:20,fontWeight:'700',color:theme.colors.primary,marginTop:14,textAlign:'right'},empty:{alignItems:'center',gap:8,padding:24,borderWidth:1,borderColor:theme.colors.border,borderRadius:18,backgroundColor:'#FFFFFF',marginTop:14},footer:{fontSize:9,fontWeight:'600',letterSpacing:1.5,color:theme.colors.textMuted,textAlign:'center',marginTop:28}
});
