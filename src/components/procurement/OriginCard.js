import {AccessibleView as View} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useInventoryTheme} from '../layout/InventoryScreen';
import {budgetReferenceLabel} from '../../utils/procurementTrace';
import {formatCurrency} from '../../utils/currency';
export function OriginCard({origin={},traceVersion=0,items=[]}){
 const theme=useInventoryTheme(),txt={fontSize:13,lineHeight:20,color:theme.colors.text};
 return <View style={{padding:14,marginTop:12,borderRadius:14,backgroundColor:theme.colors.primarySoft}}><Text accessibilityRole="header" style={{...txt,fontWeight:'700'}}>Origem da aquisição</Text>
 <Text selectable style={txt}>Solicitação: {origin.request?.number||'Sem solicitação vinculada'}</Text>
 {!!origin.request?.notes&&<Text style={txt}>Necessidade: {origin.request.notes}</Text>}
 {!!origin.quote?.number&&<Text selectable style={txt}>Cotação: {origin.quote.number} · {origin.quote.roundTitle}</Text>}
 <Text selectable style={txt}>Orçamento: {budgetReferenceLabel(origin,traceVersion)}</Text>
 {items.map(i=><View key={i.id} style={{marginTop:8}}><Text style={txt}>{i.code||i.input_code||''} {i.description||i.name}</Text>
 {(i.budgetRefs||i.budget_refs||[]).length?(i.budgetRefs||i.budget_refs).map(b=><Text selectable key={b.id} style={txt}>Referência {b.code||b.id}: {b.quantity} {b.unit} × {formatCurrency(Number(b.unitPrice))} previsto, sem BDI.</Text>):<Text style={txt}>{traceVersion?'Item sem correspondência no orçamento de origem.':'Sem referência histórica registrada.'}</Text>}
 </View>)}
 <Text style={{...txt,marginTop:8}}>A versão de origem é preservada, mesmo quando a base atual da obra muda.</Text>
 </View>;
}
