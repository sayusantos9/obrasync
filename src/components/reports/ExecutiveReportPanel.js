import {useEffect,useRef,useState} from 'react';
import {Alert} from 'react-native';
import {AccessibleView as View,AccessibleTouchableOpacity as Button} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {usePlanengenStyle} from '../layout/PlanengenScreen';
import {fetchExecutiveReport,exportExecutiveReport} from '../../services/executiveReportService';
import {formatCurrency} from '../../utils/currency';
export function ExecutiveReportPanel({projectId}){
 const {colors,text}=usePlanengenStyle(),[report,setReport]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0),[exporting,setExporting]=useState('');const lock=useRef(false);
 useEffect(()=>{let live=true;setReport(null);setLoading(true);setError('');fetchExecutiveReport(projectId).then(r=>{if(live)setReport(r);}).catch(e=>{if(live)setError(e.message);}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[projectId,revision]);
 async function share(format){if(lock.current||!report||report.project.id!==projectId)return;lock.current=true;setExporting(format);try{await exportExecutiveReport(report,format);}catch(e){Alert.alert('Erro ao exportar executivo',e.message);}finally{lock.current=false;setExporting('');}}
 const body=text({fontSize:14,lineHeight:22}),small=text({fontSize:12,lineHeight:18},colors.muted),button={padding:14,minHeight:48,borderRadius:12,backgroundColor:'#E7F2FE',marginTop:10};
 return <View style={{marginTop:20,padding:18,borderRadius:20,borderWidth:1,borderColor:colors.blue,backgroundColor:colors.surface||'#FFF'}}><Text accessibilityRole="header" style={text({fontSize:23,fontWeight:'700'},colors.navy)}>Relatório executivo</Text>
 <Text style={small}>Valores acumulados da obra. Etapas se sobrepõem; não some comprometido, comprado, recebido e consumido.</Text>
 <Button accessibilityRole="button" disabled={loading||!!exporting} style={button} onPress={()=>setRevision(n=>n+1)}><Text style={body}>{loading?'Consultando o Supabase…':'Atualizar indicadores'}</Text></Button>
 {!!error&&<Text accessibilityRole="alert" style={body}>{error}</Text>}
 {report?.project.id===projectId&&!loading&&<><Text style={[small,{marginTop:12}]}>Base: {report.baseline?`${report.baseline.number} · revisão ${report.baseline.revision}`:'Não definida — selecione na tela de Orçamentos.'}</Text><Text style={small}>Consulta: {new Date(report.generatedAt).toLocaleString('pt-BR')}</Text>
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:10,marginTop:14}}>{report.definitions.map(([label,value,rule])=><View key={label} style={{flexGrow:1,flexBasis:230,backgroundColor:'#F3F8FE',padding:14,borderRadius:14}}><Text style={body}>{label}</Text><Text style={text({fontSize:23,fontWeight:'700',marginVertical:8},colors.navy)}>{value===null?'Não disponível':formatCurrency(value)}</Text><Text style={small}>{rule}</Text></View>)}</View>
 {report.warnings.map(w=><Text key={w} style={[body,{marginTop:12}]}>• {w}</Text>)}
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{[['pdf','PDF executivo'],['excel','Excel executivo']].map(([format,label])=><Button key={format} disabled={!!exporting} accessibilityRole="button" accessibilityLabel={`Exportar ${label}`} style={[button,{flexGrow:1}]} onPress={()=>share(format)}><Text style={body}>{exporting===format?'Preparando…':label}</Text></Button>)}</View>
 <Text style={[small,{marginTop:10}]}>Exportação inclui critérios, insumos, pedidos considerados, recebimentos, estoque, movimentos e despesas separadas, usando estes mesmos dados.</Text>
 </>}
 </View>;
}
