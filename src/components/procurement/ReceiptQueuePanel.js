import {SCREENS} from '../../navigation/routes';
import {Alert,Switch} from 'react-native';
import {AccessibleView as View,AccessibleTouchableOpacity as Button} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useApp} from '../../contexts/AppContext';
import {useInventoryTheme} from '../layout/InventoryScreen';
export function ReceiptQueuePanel(){
 const {openScreen,pendingReceipts=[],isSyncingReceipts,isOffline,setIsOffline,syncPendingReceipts,discardPendingReceipt,receiptCacheDate,refreshCurrentProject,projects=[]}=useApp(),theme=useInventoryTheme();
 const text={color:theme.colors.text,fontSize:15,lineHeight:22},button={padding:14,minHeight:48,borderRadius:12,backgroundColor:theme.colors.primarySoft,marginTop:10};
 async function run(fn){try{await fn();}catch(e){Alert.alert('Recebimentos pendentes',e.message);}}
 return <View style={{padding:16,borderRadius:18,backgroundColor:theme.colors.surface,marginTop:16}}><Text accessibilityRole="header" style={{...text,fontWeight:'700',fontSize:20}}>Recebimento offline</Text>
 <Text style={text}>Guardar no aparelho sem enviar agora</Text><Switch accessibilityLabel="Guardar recebimentos offline" value={isOffline} onValueChange={setIsOffline} disabled={isSyncingReceipts}/>
 <Text style={text}>Sem conexão, o registro fica neste aparelho. O estoque só muda após confirmação do servidor. Ao voltar à internet, o app tenta enviar com a tela ativa a cada 30 segundos.</Text>
 <Text style={text}>A fila também guarda rejeições e devoluções. Confira o resultado antes de repetir uma entrega ou devolução.</Text>
 {!!receiptCacheDate&&<Text accessibilityRole="alert" style={text}>Dados locais de {new Date(receiptCacheDate).toLocaleString('pt-BR')}. Saldos e acessos serão revalidados na sincronização.</Text>}
 <Button accessibilityRole="button" style={button} disabled={isSyncingReceipts||isOffline} onPress={()=>run(()=>syncPendingReceipts(true))}><Text style={text}>{isSyncingReceipts?'Sincronizando…':`Sincronizar / revalidar (${pendingReceipts.length})`}</Text></Button>
 <Button accessibilityRole="button" style={button} disabled={isSyncingReceipts||isOffline} onPress={()=>run(refreshCurrentProject)}><Text style={text}>Atualizar pedidos e saldos</Text></Button>
 {pendingReceipts.map(r=><View key={r.id} style={{borderTopWidth:1,borderTopColor:theme.colors.border,marginTop:14,paddingTop:14}}><Text style={{...text,fontWeight:'700'}}>{r.action==='RETURN'?'Devolução':'Recebimento'} · {r.orderNumber} · {projects.find(p=>p.id===r.projectId)?.name||'Obra do registro'}</Text><Text style={text}>{r.state==='CONFLICT'?'Precisa de revisão':'Aguardando confirmação'} · {new Date(r.createdAt).toLocaleString('pt-BR')}</Text><Text style={text}>Referência: {r.data.reference}</Text><Text style={text}>{r.data.items?.length??1} item(ns) · chave {r.id}</Text>{!!r.error&&<Text accessibilityRole="alert" style={text}>{r.error}</Text>}
 {r.action==='RETURN'?<Text style={text}>Devolver: {r.data.quantity} · {r.data.reason}{r.data.nonconformity?` · ${r.data.nonconformity}`:''}</Text>:(r.data.items||[]).map(i=><Text key={i.id} style={text}>Item {i.id}: {i.quantity} aceita(s), {i.rejectedQuantity||0} rejeitada(s){i.reason?` · ${i.reason}`:''}{i.nonconformity?` · ${i.nonconformity}`:''}</Text>)}
 {r.error==='REAUTH_REQUIRED'||r.error==='MFA_REQUIRED'?<Button accessibilityRole="button" style={button} onPress={()=>openScreen(SCREENS.SECURITY)}><Text style={text}>Confirmar identidade para sincronizar</Text></Button>:null}
 {r.state==='CONFLICT'&&<Text style={text}>Confira o saldo atualizado. Um recebimento de outro usuário ou alteração de acesso pode impedir este envio. As quantidades não são reduzidas automaticamente.</Text>}
 {!r.uncertain&&(r.attempts===0||r.state==='CONFLICT')?<Button accessibilityRole="button" style={button} disabled={isSyncingReceipts} onPress={()=>Alert.alert('Descartar registro local?','O lançamento rejeitado ou ainda não enviado será removido somente deste aparelho.',[{text:'Manter',style:'cancel'},{text:'Descartar',style:'destructive',onPress:()=>run(()=>discardPendingReceipt(r.id))}])}><Text style={text}>Descartar registro local</Text></Button>:<Text style={text}>Envio já tentado: mantenha a mesma chave até confirmar o resultado, para não duplicar a entrada.</Text>}</View>)}
 </View>;
}
