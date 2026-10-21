import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../../contexts/AppContext';
import { USER_ROLES } from '../../data/authData';
import { TABS } from '../../navigation/routes';
import { theme } from '../../theme';

export function ProjectSelector({label='SELECIONE A OBRA'}) {
  const {projects=[],selectedProject,chooseProject,selectTab,currentUser,refreshCurrentProject}=useApp();
  const canCreate=[USER_ROLES.MASTER,USER_ROLES.ENGINEERING].includes(currentUser?.role);
  const visible=projects.filter(p=>!['CANCELED','CANCELLED','ARCHIVED'].includes(String(p.status).toUpperCase()));
  return <View style={styles.box}>
    <Text style={styles.label}>{label}</Text>
    {!visible.length ? <>
      <Text style={styles.empty}>Nenhuma obra disponível na empresa do seu usuário. Obras de outra empresa não aparecem por segurança.</Text>
      {canCreate&&<TouchableOpacity style={styles.action} onPress={()=>selectTab(TABS.PROJECTS)}><Ionicons name="add-circle-outline" color={theme.colors.primary} size={18}/><Text style={styles.link}>Cadastrar obra</Text></TouchableOpacity>}
      <TouchableOpacity style={styles.action} onPress={()=>refreshCurrentProject().catch(()=>{})}><Ionicons name="refresh-outline" color={theme.colors.primary} size={17}/><Text style={styles.link}>Atualizar lista</Text></TouchableOpacity>
    </> : <>
      <Text style={styles.hint}>Você pode selecionar obras planejadas ou em andamento.</Text>
      {visible.map(p=><TouchableOpacity key={p.id} accessibilityRole="button" style={[styles.option,selectedProject?.id===p.id&&styles.active]} onPress={()=>chooseProject(p)}>
        <Ionicons name={selectedProject?.id===p.id?'radio-button-on':'radio-button-off'} size={20} color={theme.colors.primary}/>
        <View style={styles.item}><Text style={styles.name}>{p.name}</Text><Text style={styles.status}>{String(p.status||'PLANNED')==='PLANNED'?'Planejada':p.status||'Em andamento'}</Text></View>
      </TouchableOpacity>)}
    </>}
  </View>;
}
const styles=StyleSheet.create({box:{backgroundColor:'#FFF',borderWidth:1,borderColor:theme.colors.border,borderRadius:16,padding:14,marginTop:16},label:{fontSize:12,fontWeight:'900',color:theme.colors.primaryDark,marginBottom:8},empty:{color:theme.colors.textMuted,fontSize:12,lineHeight:19},hint:{color:theme.colors.textMuted,fontSize:11,marginBottom:5},option:{padding:10,borderRadius:12,alignItems:'center',flexDirection:'row',gap:10,marginTop:6,borderWidth:1,borderColor:theme.colors.border},active:{backgroundColor:theme.colors.primarySoft,borderColor:theme.colors.primary},item:{flex:1},name:{color:theme.colors.text,fontWeight:'900',fontSize:13},status:{color:theme.colors.textMuted,fontSize:10,marginTop:2},action:{alignItems:'center',flexDirection:'row',gap:7,marginTop:12},link:{fontWeight:'800',color:theme.colors.primary,fontSize:12}});
