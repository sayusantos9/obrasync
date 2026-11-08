import {useMemo,useState} from 'react';
import {AccessibleView as View,AccessibleTouchableOpacity as TouchableOpacity,AccessibleScrollView as ScrollView,AccessibleIonicons as Ionicons} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';
import {InventoryScreen} from '../components/layout/InventoryScreen';
import {ProjectSelector} from '../components/budget/ProjectSelector';
import {useApp} from '../contexts/AppContext';
import {buildAlerts} from '../utils/alerts';
import {operationsStyles as styles} from './Operations.styles';
const palette={danger:['#FDEBEC','#B42318'],warning:['#FFF5D9','#805C00'],info:['#E7F3FD','#0066BE'],success:['#E7F5EF','#187548']};
export function AlertsScreen(){
 const {dashboard,orders,requests,budgetDocuments,selectedProject}=useApp();
 const [filter,setFilter]=useState('Todos');
 const alerts=useMemo(()=>selectedProject?buildAlerts({dashboard,orders,requests,budgetDocuments:budgetDocuments.filter(b=>b.projectId===selectedProject.id)}):[],[dashboard,orders,requests,budgetDocuments,selectedProject?.id]);
 const visible=filter==='Todos'?alerts:alerts.filter(a=>a.category===filter);
 const pending=alerts.filter(a=>!['all-good','latest-budget'].includes(a.id)).length;
 return <InventoryScreen title="Alertas">
  <ProjectSelector label="OBRA DOS ALERTAS"/>
  <View style={styles.hero}><Text style={styles.eyebrow}>ATENÇÃO HOJE</Text><Text style={styles.big}>{pending} {pending===1?'ponto de atenção':'pontos de atenção'}</Text><Text style={styles.heroText}>Acompanhe custos, entregas e aprovações de {selectedProject?.name||'sua obra'}.</Text></View>
  <View style={styles.metrics}>{[['Custos','trending-up-outline'],['Prazos','time-outline'],['Aprovações','checkmark-done-outline']].map(([label,icon])=><TouchableOpacity key={label} accessibilityRole="button" accessibilityLabel={label} onPress={()=>setFilter(label)} style={styles.metric}><Ionicons name={icon} size={25} color="#0066BE"/><Text style={styles.metricValue}>{alerts.filter(a=>a.category===label).length}</Text><Text style={styles.metricLabel}>{label}</Text></TouchableOpacity>)}</View>
  <Text accessibilityRole="header" style={styles.section}>Atualizações da obra</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>{['Todos','Custos','Prazos','Aprovações'].map(label=><TouchableOpacity key={label} accessibilityRole="button" accessibilityState={{selected:label===filter}} onPress={()=>setFilter(label)} style={[styles.chip,filter===label&&{backgroundColor:'#010028'}]}><Text style={[styles.chipText,filter===label&&{color:'white'}]}>{label}</Text></TouchableOpacity>)}</ScrollView>
  {!visible.length&&<View style={styles.empty}><Ionicons name="notifications-outline" size={30} color="#0066BE"/><Text style={styles.name}>{selectedProject?'Nenhuma atualização nesta categoria':'Selecione uma obra'}</Text><Text style={styles.meta}>{selectedProject?'Escolha outra categoria para ver as demais atualizações.':'Os alertas correspondem à obra escolhida acima.'}</Text></View>}
  {visible.map(alert=>{const [background,color]=palette[alert.type]||palette.info;return <View key={alert.id} style={styles.card}><View style={styles.row}><View style={[styles.icon,{backgroundColor:background}]}><Ionicons name={alert.icon} size={24} color={color}/></View><View style={styles.info}><Text accessibilityRole="header" style={styles.name}>{alert.title}</Text><Text style={[styles.badgeText,{color,marginTop:4}]}>{alert.category==='Todos'?'Tudo em dia':alert.category}</Text></View></View><Text style={styles.meta}>{alert.description}</Text><Text style={[styles.meta,{fontSize:11}]}>{alert.time} · Calculado com os dados carregados da obra</Text></View>;})}
 </InventoryScreen>;
}
