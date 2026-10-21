import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BDI_FIELDS, calculateBdi, parseDecimal } from '../../utils/bdi';
import { theme } from '../../theme';
const numberText=(n)=>String(n).replace('.',',');
export function BdiEditor({value,onChange}) {
  let result, error;
  try{result=calculateBdi(value);}catch(e){error=e.message;}
  return <View style={styles.card}>
    <Text style={styles.title}>Cálculo do BDI — sem desoneração</Text>
    <Text style={styles.subtitle}>Fórmula do modelo enviado • ISS efetivo = base × alíquota / 100.</Text>
    <View style={styles.grid}>{BDI_FIELDS.map(field=><View key={field.key} style={styles.field}>
      <Text style={styles.label}>{field.label}</Text>
      <TextInput accessibilityLabel={field.label} keyboardType="decimal-pad" value={value?.[field.key]===undefined?'':numberText(value[field.key])} onChangeText={text=>onChange({...value,[field.key]:text===''?Number.NaN:parseDecimal(text)})} style={styles.input}/>
    </View>)}</View>
    {!!error&&<Text style={styles.error}>{error}</Text>}
    {result&&<View style={styles.total}><Text style={styles.totalText}>ISS efetivo: {numberText(result.issEffective.toFixed(2))}%</Text><Text style={styles.totalBold}>BDI calculado: {numberText(result.rate.toFixed(2))}%</Text></View>}
  </View>;
}
const styles=StyleSheet.create({card:{marginTop:20,backgroundColor:'#FFF',borderWidth:1,borderColor:theme.colors.border,borderRadius:18,padding:15},title:{fontSize:17,fontWeight:'900',color:theme.colors.text},subtitle:{fontSize:11,color:theme.colors.textMuted,lineHeight:16,marginTop:5},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:8,marginTop:7},field:{width:'48%',marginTop:8},label:{fontSize:10,fontWeight:'800',color:theme.colors.textMuted,minHeight:28},input:{backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:10,paddingHorizontal:12,minHeight:44,color:theme.colors.text,fontSize:14},error:{color:theme.colors.danger,fontSize:12,marginTop:12},total:{marginTop:14,backgroundColor:theme.colors.primarySoft,padding:13,borderRadius:12},totalText:{color:theme.colors.primaryDark,fontSize:12},totalBold:{color:theme.colors.primaryDark,fontWeight:'900',fontSize:18,marginTop:4}});
