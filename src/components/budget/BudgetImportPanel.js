import {useMemo,useState} from 'react';
import {Alert} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {File} from 'expo-file-system';
import {AccessibleTouchableOpacity as Button,AccessibleView as View,AccessibleTextInput as Input} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useApp} from '../../contexts/AppContext';
import {useInventoryTheme} from '../layout/InventoryScreen';
import {readBudgetWorkbook,sheetRows,cellText,guessMapping,validateImport,IMPORT_FIELDS} from '../../utils/budgetImport';
import {shareWorkbook} from '../../services/documentExportService';
import {formatCurrency} from '../../utils/currency';

export function BudgetImportPanel({onApply,disabled}){
 const {costInputs=[]}=useApp(),theme=useInventoryTheme();
 const [file,setFile]=useState(null),[sheet,setSheet]=useState(''),[header,setHeader]=useState('1'),[mapping,setMapping]=useState({}),[busy,setBusy]=useState(false),[expanded,setExpanded]=useState(false),[field,setField]=useState(null);
 const box={backgroundColor:theme.colors.surface||'#FFF',borderColor:theme.colors.border,borderWidth:1,borderRadius:16,padding:16,marginTop:16,gap:10};
 const button={backgroundColor:theme.colors.primarySoft,borderRadius:10,padding:14,minHeight:48};
 const text={color:theme.colors.text,fontSize:14};
 const rows=useMemo(()=>file?sheetRows(file.workbook,sheet):[],[file,sheet]);
 const headerIndex=Number(header)-1;
 const validHeader=Number.isInteger(headerIndex)&&headerIndex>=0&&headerIndex<rows.length;
 const result=useMemo(()=>validHeader?validateImport(rows,mapping,costInputs,headerIndex):{items:[],errors:[{row:0,message:'Informe a linha do cabeçalho.'}]},[rows,mapping,costInputs,headerIndex,validHeader]);
 async function pick(){
  setBusy(true);
  try{
   const picked=await DocumentPicker.getDocumentAsync({type:['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv','text/comma-separated-values','application/csv'],copyToCacheDirectory:true});
   if(picked.canceled)return;
   const asset=picked.assets[0];
   if(!/\.(xlsx|csv)$/i.test(asset.name)||asset.size>2*1024*1024)throw new Error('Selecione XLSX ou CSV de até 2 MB.');
   const base64=await new File(asset.uri).base64(),workbook=readBudgetWorkbook(base64),name=workbook.SheetNames[0],data=sheetRows(workbook,name);
   setFile({name:asset.name,base64,workbook});setSheet(name);setHeader('1');setMapping(guessMapping(data[0]||[]));setExpanded(true);
  }catch(e){Alert.alert('Não foi possível importar',e.message);}finally{setBusy(false);}
 }
 async function report(){try{await shareWorkbook([{name:'Erros',rows:[['Linha','Código','Problema'],...result.errors.map(e=>[e.row,e.code||'',e.message])]}],'Erros_importacao');}catch(e){Alert.alert('Erro',e.message);}}
 async function template(){try{await shareWorkbook([{name:'Orçamento',rows:[['Código','Base','Unidade','Quantidade','Preço unitário']]},{name:'Códigos para consulta',rows:[['Código completo','Base','Descrição','Unidade'],...costInputs.map(i=>[i.code,i.sourceBank||i.source,i.description,i.unit])]}],'Modelo_importacao_orcamento');}catch(e){Alert.alert('Erro',e.message);}}
 function apply(){
  Alert.alert('Usar itens da planilha?',`Os ${result.items.length} itens substituirão os itens atuais do rascunho. O catálogo não será alterado.`,[{text:'Cancelar',style:'cancel'},{text:'Usar itens',onPress:()=>{onApply(result.items,{name:file.name,base64:file.base64,metadata:{sheet,headerRow:headerIndex+1,mapping,rows:result.items.length,errors:result.errors}});setExpanded(false);}}]);
 }
 return <View style={box}><Text style={[text,{fontWeight:'700',fontSize:18}]}>Importar orçamento</Text><Text style={text}>XLSX ou CSV • até 2 MB / 2000 itens. Informe a data-base no formulário. O arquivo original será guardado ao salvar.</Text>
 <Button accessibilityRole="button" disabled={disabled||busy} style={button} onPress={pick}><Text style={text}>{busy?'Lendo arquivo…':'Selecionar planilha'}</Text></Button>
 <Button accessibilityRole="button" style={button} onPress={template}><Text style={text}>Baixar modelo e códigos do catálogo</Text></Button>
 {file&&<Button accessibilityRole="button" style={button} onPress={()=>setExpanded(v=>!v)}><Text style={text}>{file.name} · {expanded?'Recolher':'Revisar importação'}</Text></Button>}
 {expanded&&file&&<><Text style={text}>1. Selecione a aba</Text>{file.workbook.SheetNames.map(name=><Button key={name} accessibilityRole="radio" accessibilityState={{checked:sheet===name}} style={button} onPress={()=>{try{const data=sheetRows(file.workbook,name);setSheet(name);setHeader('1');setMapping(guessMapping(data[0]||[]));}catch(e){Alert.alert('Aba não suportada',e.message);}}}><Text style={text}>{sheet===name?'● ':'○ '}{name}</Text></Button>)}
 <Text style={text}>Linha do cabeçalho</Text><Input accessibilityLabel="Linha do cabeçalho" keyboardType="number-pad" value={header} onChangeText={v=>{setHeader(v);setMapping(guessMapping(rows[Number(v)-1]||[]));}} style={[button,text]}/>
 <Text style={text}>2. Mapeie as colunas</Text>{IMPORT_FIELDS.map(([key,label])=><View key={key}><Button accessibilityRole="button" style={button} onPress={()=>setField(field===key?null:key)}><Text style={text}>{label}: {mapping[key]>=0?`${mapping[key]+1} · ${cellText(rows[headerIndex]?.[mapping[key]])}`:'Não selecionada'} ▾</Text></Button>{field===key&&<View style={{padding:8,gap:8}}>{[['Não selecionada',-1],...(rows[headerIndex]||[]).map((h,i)=>[`${i+1} · ${cellText(h)}`,i])].map(([label,index])=><Button key={index} accessibilityRole="button" style={button} onPress={()=>{setMapping(m=>({...m,[key]:index}));setField(null);}}><Text style={text}>{label}</Text></Button>)}</View>}</View>)}
 <Text style={[text,{fontWeight:'700'}]}>3. Prévia: {result.items.length} itens válidos / {result.errors.length} erros</Text>
 {result.items.slice(0,10).map(i=><Text key={i.id} style={text}>{i.code} · {i.description}{'\n'}{i.quantity} {i.unit} × {formatCurrency(i.unitPrice)}</Text>)}
 {result.items.length>10&&<Text style={text}>Exibindo os primeiros 10. Todos serão incluídos na edição após confirmar.</Text>}
 {result.errors.slice(0,10).map((e,i)=><Text key={i} accessibilityRole="alert" style={[text,{color:theme.colors.danger}]}>Linha {e.row}: {e.message}</Text>)}
 {!!result.errors.length&&<Button accessibilityRole="button" style={button} onPress={report}><Text style={text}>Exportar todos os erros</Text></Button>}
 <Button accessibilityRole="button" disabled={!!result.errors.length||!result.items.length||disabled} style={[button,{opacity:result.errors.length?.4:1}]} onPress={apply}><Text style={text}>Conferi os itens — usar no orçamento</Text></Button>
 <Text style={text}>Corrija todos os erros na planilha e selecione o arquivo novamente. Nenhuma linha será descartada silenciosamente.</Text></>}
 </View>;
}
