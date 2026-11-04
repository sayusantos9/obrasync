import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PlanengenScreen, usePlanengenStyle } from '../components/layout/PlanengenScreen';
import { ProjectSelector } from '../components/budget/ProjectSelector';
import { useApp } from '../contexts/AppContext';
import { compareInputs } from '../utils/comparison';
import { formatCurrency } from '../utils/currency';
import { exportReport } from '../services/reportService';
import {SCREENS} from '../navigation/routes';
export function ComparisonScreen() {
  const { budgetDocuments, orders, selectedProject,openScreen }=useApp();
  const {colors}=usePlanengenStyle();
  const [selected,setSelected]=useState('');
  const [tolerance,setTolerance]=useState('5');
  const [exporting,setExporting]=useState(false);
  const budgets=budgetDocuments.filter(b=>b.projectId===selectedProject?.id);
  const baseline=budgets.find(b=>b.id===selected);
  const parsedTolerance=Number(tolerance.replace(',','.'));
  const validTolerance=Number.isFinite(parsedTolerance) && parsedTolerance>=0 && parsedTolerance<=100;
  const rows=compareInputs(baseline,orders,selectedProject?.id,validTolerance?parsedTolerance:5);
  async function exportComparison(format) {
    if(exporting) return;
    setExporting(true);
    try {
      await exportReport({comparison:{title:'Previsto e compra real',headers:['Insumo','Unidade','Qtd prevista','Qtd comprada','PP','PR médio','Desvio %','Impacto preço','Saldo','Projeção'],rows:rows.map(r=>[r.description,r.unit,r.plannedQuantity,r.purchasedQuantity,r.pp??'',r.pr??'',r.percent??'',r.impact??'',r.remaining,r.projection])}},'comparison',selectedProject,format);
    } catch(error) { Alert.alert('Erro ao exportar',error.message); }
    finally { setExporting(false); }
  }
  return <PlanengenScreen title="Previsto × compra">
    <ProjectSelector/>
    <TouchableOpacity accessibilityRole="button" onPress={()=>openScreen(SCREENS.MARKET_PRICES)} style={{padding:16,backgroundColor:colors.navy,borderRadius:12,marginTop:16}}><Text style={{color:'white'}}>Pesquisar preços de mercado</Text></TouchableOpacity>
    <Text style={{color:colors.text,marginVertical:12}}>Selecione um orçamento-base. Valores sem BDI; compras confirmadas incluem frete, tributos não recuperáveis e descontos rateados pelo valor dos itens.</Text>
    {budgets.map(b=><TouchableOpacity accessibilityRole="radio" accessibilityState={{checked:baseline?.id===b.id}} key={b.id} onPress={()=>setSelected(b.id)} style={{padding:14,backgroundColor:baseline?.id===b.id?'#DCEEFF':'white',marginBottom:8,borderRadius:12}}><Text>{b.title} · {formatCurrency(b.total)}</Text></TouchableOpacity>)}
    {!baseline?<Text style={{color:colors.muted}}>Crie ou selecione um orçamento para comparar. Orçamentos diferentes não são somados.</Text>:<>
      <Text style={{color:colors.muted,marginVertical:12}}>Tolerância de atenção (% acima do previsto)</Text>
      <TextInput accessibilityLabel="Tolerância percentual" keyboardType="decimal-pad" value={tolerance} onChangeText={setTolerance} style={{padding:12,borderWidth:1,borderColor:colors.border,borderRadius:12,color:colors.text}}/>
      {!validTolerance && <Text accessibilityRole="alert">Informe de 0 a 100. Aplicando 5% enquanto o valor for inválido.</Text>}
      <Text style={{color:colors.muted,marginVertical:12}}>A quantidade excedente é mostrada separadamente. O saldo não desconta reservas de estoque; projeção usa o preço médio ponderado.</Text>
      <View style={{flexDirection:'row',gap:12,marginBottom:16}}>{['pdf','excel'].map(format=><TouchableOpacity key={format} accessibilityRole="button" disabled={exporting} onPress={()=>exportComparison(format)} style={{padding:14,backgroundColor:colors.navy,borderRadius:12}}><Text style={{color:'white'}}>Exportar {format.toUpperCase()}</Text></TouchableOpacity>)}</View>
      {rows.map((r,i)=><View key={r.id+'-'+i} style={{backgroundColor:'white',borderRadius:14,padding:16,marginBottom:12,borderLeftWidth:4,borderLeftColor:({'Dentro/abaixo':'#187548','Atenção':'#946000','Acima':'#B42318','Sem compra':'#0066BE'})[r.status]||'#666'}}>
        <Text style={{fontSize:16,fontWeight:'700'}}>{r.description}</Text><Text>{r.status}</Text>
        <Text>Previsto: {r.pp===null?'—':formatCurrency(r.pp)} / {r.unit}</Text><Text>Média real: {r.pr===null?'—':formatCurrency(r.pr)} / {r.unit}</Text>
        <Text>Variação: {r.percent===null?'Não comparável':r.percent.toFixed(2)+'%'} · Impacto: {r.impact===null?'—':formatCurrency(r.impact)}</Text>
        <Text>Planejado: {r.plannedQuantity} · Comprado: {r.purchasedQuantity} · Saldo: {r.remaining} {r.unit}</Text>
        <Text>Quantidade excedente: {r.excessQuantity} {r.unit}</Text><Text>Projeção: {formatCurrency(r.projection)}</Text>
      </View>)}
    </>}
  </PlanengenScreen>;
}
