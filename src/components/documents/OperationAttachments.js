import {useEffect,useRef,useState} from 'react';
import {Alert} from 'react-native';
import {AccessibleView as View,AccessibleTouchableOpacity as Button} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useInventoryTheme} from '../layout/InventoryScreen';
import {useApp} from '../../contexts/AppContext';
import {canUploadAttachment} from '../../utils/operationAttachments';
import {listOperationAttachments,pickOperationAttachment,openOperationAttachment} from '../../services/operationAttachmentService';
export function OperationAttachments({kind,entityId,projectId}){
 const {currentUser}=useApp(),theme=useInventoryTheme();
 const [expanded,setExpanded]=useState(false),[rows,setRows]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const generation=useRef(0);
 async function refresh(){const token=++generation.current;try{const data=await listOperationAttachments(kind,entityId);if(token===generation.current){setRows(data);setError('');}}catch(e){if(token===generation.current)setError(e.message);}}
 useEffect(()=>{setExpanded(false);setRows([]);return()=>{generation.current++;};},[kind,entityId]);
 async function upload(){if(busy)return;setBusy(true);try{await pickOperationAttachment({companyId:currentUser.companyId,projectId,kind,entityId});await refresh();}catch(e){Alert.alert('Não foi possível anexar',e.message);}finally{setBusy(false);}}
 const text={color:theme.colors.text,fontSize:13},button={padding:13,borderRadius:10,backgroundColor:theme.colors.primarySoft,minHeight:46,marginTop:8};
 if(!entityId)return null;
 return <View style={{marginTop:12}}><Button accessibilityRole="button" accessibilityState={{expanded}} style={button} onPress={()=>{if(!expanded)refresh();setExpanded(v=>!v);}}><Text style={[text,{fontWeight:'700'}]}>Anexos privados {expanded?'▴':'▾'}</Text></Button>
 {expanded&&<><Text style={[text,{marginTop:8}]}>PDF, JPG ou PNG, até 10 MB. Disponível somente para perfis autorizados da empresa.</Text>
 {!!error&&<Button accessibilityRole="button" style={button} onPress={refresh}><Text style={text}>Falha ao carregar: {error}. Tentar novamente.</Text></Button>}
 {!error&&!rows.length&&<Text style={text}>Nenhum arquivo listado.</Text>}
 {rows.map(item=><Button key={item.id} accessibilityRole="button" style={button} onPress={()=>openOperationAttachment(item).catch(e=>Alert.alert('Erro ao abrir anexo',e.message))}><Text style={text}>{item.filename} · {Math.ceil(item.size_bytes/1024)} KB</Text><Text style={text}>Abrir arquivo</Text></Button>)}
 {canUploadAttachment(currentUser?.role,kind)&&<Button accessibilityRole="button" disabled={busy} style={button} onPress={upload}><Text style={text}>{busy?'Enviando…':'Adicionar arquivo'}</Text></Button>}</>}
 </View>;
}
