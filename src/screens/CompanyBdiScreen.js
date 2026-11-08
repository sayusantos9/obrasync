import {useEffect,useRef,useState} from 'react';
import {Alert} from 'react-native';
import {AccessibleView as View,AccessibleTouchableOpacity as Button} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';
import {InventoryScreen,useInventoryTheme} from '../components/layout/InventoryScreen';
import {BdiEditor} from '../components/budget/BdiEditor';
import {useApp} from '../contexts/AppContext';
import {useCompanyBdi} from '../hooks/useCompanyBdi';
import {DEFAULT_COMPANY_BDI} from '../utils/bdi';
export function CompanyBdiScreen(){
 const {currentUser}=useApp(),settings=useCompanyBdi(currentUser?.companyId),theme=useInventoryTheme(),[config,setConfig]=useState({...DEFAULT_COMPANY_BDI}),lock=useRef(false);
 useEffect(()=>{if(settings.record)setConfig(settings.record.config);},[settings.record]);
 const text={fontSize:15,lineHeight:23,color:theme.colors.text},button={padding:15,minHeight:48,borderRadius:12,marginTop:12,backgroundColor:theme.colors.primarySoft};
 async function save(){if(lock.current)return;lock.current=true;try{await settings.save(config);Alert.alert('Padrão de BDI salvo','Será sugerido para novos orçamentos da empresa. Versões já salvas e revisões existentes mantêm a própria configuração.');}catch(e){Alert.alert('Não foi possível salvar',e.message);}finally{lock.current=false;}}
 return <InventoryScreen title="Padrão de BDI"><View style={{padding:20,borderRadius:18,backgroundColor:theme.colors.primary}}><Text style={{...text,color:'#FFF',fontSize:25,fontWeight:'700'}}>Configure uma vez.</Text><Text style={{...text,color:'#FFF'}}>Os próximos orçamentos recebem este padrão, com liberdade para ajustar cada versão.</Text></View>
 {settings.loading&&<Text style={text}>Carregando padrão da empresa…</Text>}{!!settings.error&&<Text accessibilityRole="alert" style={text}>{settings.error}</Text>}
 <Text style={text}>Exemplo de cálculo com subtotal de R$ 1.000,00.</Text><BdiEditor value={config} onChange={setConfig} subtotal={1000} disabled={settings.loading||settings.saving||!settings.record} applyLabel="Aplicar BDI por padrão"/>
 <Button accessibilityRole="button" style={button} disabled={settings.loading||settings.saving||!settings.record} onPress={save}><Text style={text}>{settings.saving?'Salvando…':'Salvar padrão da empresa'}</Text></Button><Button accessibilityRole="button" style={button} disabled={settings.loading||settings.saving} onPress={settings.reload}><Text style={text}>Recarregar padrão salvo</Text></Button><Text style={text}>Mudanças ficam registradas no histórico. O orçamento salva uma cópia completa da configuração utilizada.</Text>
 </InventoryScreen>;
}
