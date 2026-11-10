import {useEffect,useState} from 'react';
import {Alert,AppState} from 'react-native';
import {FinancialComparisonContent} from './FinancialComparisonContent';
import {useApp} from '../contexts/AppContext';
import {SCREENS} from '../navigation/routes';
import {fetchFinancialComparison} from '../services/financialComparisonService';
import {buildFinancialComparison,financialComparisonSheets} from '../utils/financialComparison';
import {shareWorkbook,sharePdf,safe} from '../services/documentExportService';
const decimal=v=>String(v).trim()===''?null:Number(String(v).replace(',','.'));
export function FinancialComparisonScreen(){
 const {selectedProject,budgetDocuments,openScreen,orders=[],stock=[]}=useApp();
 const sourceVersion=JSON.stringify([orders.map(o=>[o.id,o.total,o.purchased_at,o.status,o.updated_at]),stock.map(s=>[s.id,s.quantity,s.updated_at])]);
 const [selected,setSelected]=useState(''),[snapshot,setSnapshot]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[revision,setRevision]=useState(0),[tolerance,setTolerance]=useState('5'),[mode,setMode]=useState('average'),[scenarios,setScenarios]=useState({}),[query,setQuery]=useState(''),[limit,setLimit]=useState(20),[exporting,setExporting]=useState(false);
 useEffect(()=>{setSelected('');setScenarios({});setLimit(20);setQuery('');},[selectedProject?.id]);
 useEffect(()=>{let live=true;setSnapshot(null);setError('');if(!selectedProject?.id){setLoading(false);return;}setLoading(true);fetchFinancialComparison(selectedProject.id,selected).then(v=>{if(live)setSnapshot(v);}).catch(e=>{if(live)setError(e.message);}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[selectedProject?.id,selectedProject?.baselineBudgetId,selected,revision,sourceVersion]);
 useEffect(()=>{const sub=AppState.addEventListener('change',state=>{if(state==='active')setRevision(v=>v+1);});return()=>sub.remove();},[]);
 const parsedScenarios=mode==='scenario'?Object.fromEntries(Object.entries(scenarios).map(([k,v])=>[k,{...v,price:decimal(v.price??''),quantity:decimal(v.quantity??'')}])):{};
 let report=null,validation='';
 try{if(snapshot)report=buildFinancialComparison(snapshot,{tolerance:decimal(tolerance)??NaN,mode,scenarios:parsedScenarios});}
 catch(e){validation=e.message;if(snapshot){const t=decimal(tolerance);report=buildFinancialComparison(snapshot,{tolerance:Number.isFinite(t)&&t>=0&&t<=100?t:5,mode,scenarios:Object.fromEntries(Object.entries(parsedScenarios).map(([k,v])=>[k,{...v,price:Number.isFinite(v.price)&&v.price>=0?v.price:null,quantity:Number.isFinite(v.quantity)&&v.quantity>=0?v.quantity:null}]))});}}

 const budgets=budgetDocuments.filter(b=>b.projectId===selectedProject?.id),visible=report?.rows.filter(r=>r.description.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))||[];
 async function exportFile(format){if(!report||exporting||validation)return;setExporting(true);try{const sheets=financialComparisonSheets(report);if(format==='excel')await shareWorkbook(sheets,'Comparacao_financeira');else {
 const html='<html><head><meta charset="utf-8"><style>body{font-family:Arial;color:#010028;font-size:11px}h1,h2{color:#0066be}table{border-collapse:collapse;width:100%;margin-bottom:16px}td{border:1px solid #ccc;padding:5px;overflow-wrap:anywhere}tr{break-inside:avoid}h3{break-after:avoid}</style></head><body><h1>Comparação financeira — '+safe(report.project.name)+'</h1>'+sheets.map(sheet=>'<h2>'+safe(sheet.name)+'</h2>'+(sheet.name==='Resumo'?'<table>'+sheet.rows.map(r=>'<tr>'+r.map(v=>'<td>'+safe(v)+'</td>').join('')+'</tr>').join('')+'</table>':sheet.rows.slice(1).map((r,index)=>'<h3>Registro '+(index+1)+'</h3><table>'+r.map((v,i)=>'<tr><td>'+safe(sheet.rows[0][i])+'</td><td>'+safe(typeof v==='number'?Math.round(v*10000)/10000:v)+'</td></tr>').join('')+'</table>').join(''))).join('')+'</body></html>';await sharePdf(html,'Comparacao_financeira');}
 }catch(e){Alert.alert('Erro ao exportar',e.message);}finally{setExporting(false);}}
 return <FinancialComparisonContent
   selectedProject={selectedProject} budgets={budgets} selected={selected} setSelected={setSelected}
   report={report} loading={loading} error={error} refresh={()=>setRevision(n=>n+1)}
   tolerance={tolerance} setTolerance={setTolerance} mode={mode} setMode={setMode} validation={validation}
   exporting={exporting} exportFile={exportFile} query={query} setQuery={setQuery}
   visible={visible} limit={limit} setLimit={setLimit} scenarios={scenarios} setScenarios={setScenarios}
   openMarket={()=>openScreen(SCREENS.MARKET_PRICES)}
 />;
}
