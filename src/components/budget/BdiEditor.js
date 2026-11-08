import {useState} from 'react';
import {Switch,useWindowDimensions} from 'react-native';
import {AccessibleTextInput as Input,AccessibleTouchableOpacity as Button,AccessibleView as View} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {BDI_FIELDS,calculateBdi,roundMoney} from '../../utils/bdi';
import {formatCurrency} from '../../utils/currency';
import {useInventoryTheme} from '../layout/InventoryScreen';
const numberText=v=>String(v??'').replace('.',',');
export function BdiEditor({value,onChange,subtotal=0,disabled=false,applyLabel='Aplicar BDI neste orçamento'}){
 const theme=useInventoryTheme(),{width,fontScale}=useWindowDimensions(),[advanced,setAdvanced]=useState(false);
 const compact=width<360||fontScale*(theme.fontScale||1)>1.2,enabled=value?.enabled!==false,mode=value?.mode||'COMPONENTS';
 let result=null,error='';try{result=calculateBdi(value);}catch(e){error=e.message;}
 const text={color:theme.colors.text,fontSize:15,lineHeight:23},card={marginTop:18,padding:18,borderWidth:1,borderColor:theme.colors.border,borderRadius:18,backgroundColor:theme.colors.surface},button={padding:14,minHeight:48,marginTop:10,borderRadius:12,backgroundColor:theme.colors.primarySoft},input={...text,padding:12,minHeight:48,borderWidth:1,borderColor:theme.colors.border,borderRadius:12,marginTop:7};
 function change(patch){onChange({...value,schemaVersion:2,enabled,mode,...patch});}
 const amount=result?roundMoney(subtotal*result.rate/100):null;
 return <View style={card}><Text accessibilityRole="header" style={{...text,fontWeight:'700',fontSize:20}}>BDI do orçamento</Text><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12}}><Text style={[text,{flex:1}]}>{applyLabel}</Text><Switch accessibilityLabel={applyLabel} disabled={disabled} value={enabled} trackColor={{false:theme.colors.border,true:theme.colors.accent}} onValueChange={v=>change({enabled:v})}/></View>
 <Text style={text}>{enabled?'Percentual adicional sobre o subtotal dos insumos.':'BDI não aplicado: o total será igual ao subtotal dos insumos.'}</Text>
 <Text style={{...text,marginTop:12,fontWeight:'700'}}>Percentual de BDI (%)</Text>{mode==='PERCENT'?<Input accessibilityLabel="Percentual de BDI" keyboardType="decimal-pad" editable={!disabled&&enabled} value={numberText(value?.rate??0)} onChangeText={v=>change({rate:v})} style={input}/>:<Text style={{...text,fontSize:22,fontWeight:'700'}}>{result?numberText(result.rate.toFixed(2))+'%':'Revise os componentes'}</Text>}
 {result&&<View style={[card,{backgroundColor:theme.colors.primarySoft}]}><Text style={text}>BDI aplicado: {numberText(result.rate.toFixed(2))}%</Text><Text style={{...text,fontSize:21,fontWeight:'700'}}>Acréscimo: {formatCurrency(amount)}</Text><Text style={text}>Total: {formatCurrency(roundMoney(subtotal+amount))}</Text></View>}
 {!!error&&<Text accessibilityRole="alert" style={{...text,color:theme.colors.danger}}>{error}</Text>}
 <Button accessibilityRole="button" accessibilityState={{expanded:advanced}} disabled={disabled} style={button} onPress={()=>setAdvanced(v=>!v)}><Text style={text}>{advanced?'Recolher configuração avançada do BDI':'Configuração avançada do BDI'}</Text></Button>
 {advanced&&<><Text style={text}>Escolha um percentual direto ou calcule pelos componentes definidos pela empresa. Esses parâmetros não são determinados automaticamente pelo app.</Text>{[['PERCENT','Percentual direto'],['COMPONENTS','Calcular pelos componentes']].map(([v,label])=><Button key={v} accessibilityRole="radio" accessibilityState={{checked:mode===v}} disabled={disabled} style={button} onPress={()=>change({mode:v,rate:result?.rate??value.rate??0})}><Text style={text}>{mode===v?'● ':'○ '}{label}</Text></Button>)}
 {mode==='COMPONENTS'&&<><Text style={text}>Modelo sem desoneração: ((1+AC+SG+R) × (1+DF) × (1+L) ÷ (1−CP−ISS))−1. ISS efetivo = base × alíquota ÷ 100. Configure os tributos conforme a finalidade do orçamento.</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{BDI_FIELDS.map(field=><View key={field.key} style={{width:compact?'100%':'47%',marginTop:12}}><Text style={text}>{field.label}</Text><Input accessibilityLabel={field.label} value={numberText(value?.[field.key]??0)} onChangeText={v=>change({[field.key]:v})} editable={!disabled} keyboardType="decimal-pad" style={input}/></View>)}</View>{result&&enabled&&<Text style={text}>ISS efetivo: {numberText(result.issEffective.toFixed(2))}%</Text>}</>}
 </>}
 </View>;
}
