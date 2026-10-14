import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'styled-components/native';
import { SearchBar } from '../components/common/SearchBar';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
import { SCREENS } from '../navigation/routes';

const stockRoles = new Set([USER_ROLES.MASTER, USER_ROLES.PURCHASING]);

export function MaterialsScreen() {
  const theme = useTheme();
  const { currentUser, openScreen, stock, selectedProject } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const visibleMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return stock;
    return stock.filter((item) => `${item.code} ${item.name} ${item.location || ''}`.toLowerCase().includes(q));
  }, [searchQuery, stock]);

  return (
    <Screen>
      <Scroll>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}> 
          <Text style={styles.title}>Materiais</Text>
          <Text style={styles.subtitle}>{selectedProject.name}</Text>
          <View style={styles.search}><SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Código ou descrição" /></View>
        </View>
        <Content>
          {stockRoles.has(currentUser?.role) && (
            <View style={styles.actions}>
              <TouchableOpacity accessibilityRole="button" style={[styles.action, { backgroundColor: theme.colors.primarySoft }]} onPress={() => openScreen(SCREENS.STOCK)}><Ionicons name="cube-outline" size={23} color={theme.colors.primary}/><Text style={[styles.actionText,{color:theme.colors.text}]}>Gerenciar estoque</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" style={[styles.action, { backgroundColor: theme.colors.accentSoft }]} onPress={() => openScreen(SCREENS.LABEL)}><Ionicons name="qr-code-outline" size={23} color={theme.colors.accent}/><Text style={[styles.actionText,{color:theme.colors.text}]}>Etiquetas QR</Text></TouchableOpacity>
            </View>
          )}
          <View style={styles.listHeader}><Text style={[styles.count,{color:theme.colors.text}]}>{visibleMaterials.length} insumos</Text><Text style={[styles.caption,{color:theme.colors.textMuted}]}>dados demonstrativos</Text></View>
          {!visibleMaterials.length && <View style={[styles.empty,{backgroundColor:theme.colors.surface,borderColor:theme.colors.border}]}><Ionicons name="cube-outline" size={34} color={theme.colors.primary}/><Text style={[styles.emptyTitle,{color:theme.colors.text}]}>Estoque vazio</Text><Text style={[styles.emptyText,{color:theme.colors.textMuted}]}>Registre um recebimento ou entrada para disponibilizar materiais.</Text></View>}
          {visibleMaterials.map((material,index)=><View key={material.id} accessible accessibilityLabel={`${material.name}. ${material.quantity} ${material.unit}. ${material.location || ''}`} style={[styles.card,{backgroundColor:theme.colors.surface,borderColor:theme.colors.border}]}><View style={[styles.icon,{backgroundColor:index%2?theme.colors.primarySoft:theme.colors.accentSoft}]}><Ionicons name="cube-outline" size={23} color={index%2?theme.colors.primary:theme.colors.accent}/></View><View style={styles.info}><Text style={[styles.code,{color:theme.colors.primary}]}>{material.code}</Text><Text style={[styles.name,{color:theme.colors.text}]}>{material.name}</Text><Text style={[styles.meta,{color:theme.colors.textMuted}]}>{material.location || 'Local não informado'} • atualizado {new Date(material.updated_at || Date.now()).toLocaleDateString('pt-BR')}</Text></View><View style={styles.qtyBlock}><Text style={[styles.qty,{color:theme.colors.text}]}>{Number(material.quantity).toLocaleString('pt-BR')}</Text><Text style={[styles.unit,{color:theme.colors.textMuted}]}>{material.unit}</Text></View></View>)}
        </Content>
      </Scroll>
    </Screen>
  );
}
const styles=StyleSheet.create({header:{paddingBottom:22,paddingHorizontal:20,paddingTop:58},title:{color:'#FFF',fontSize:28,fontWeight:'900'},subtitle:{color:'rgba(255,255,255,.72)',fontSize:12,marginTop:4},search:{marginTop:16},actions:{flexDirection:'row',gap:10,marginTop:18},action:{alignItems:'center',borderRadius:17,flex:1,padding:14},actionText:{fontSize:11,fontWeight:'900',marginTop:7,textAlign:'center'},listHeader:{alignItems:'center',flexDirection:'row',justifyContent:'space-between',marginTop:22},count:{fontSize:18,fontWeight:'900'},caption:{fontSize:11},empty:{alignItems:'center',borderRadius:18,borderWidth:1,marginTop:14,padding:24},emptyTitle:{fontSize:16,fontWeight:'900',marginTop:8},emptyText:{fontSize:12,lineHeight:18,marginTop:4,textAlign:'center'},card:{alignItems:'center',borderRadius:17,borderWidth:1,flexDirection:'row',marginTop:10,padding:13},icon:{alignItems:'center',borderRadius:13,height:46,justifyContent:'center',width:46},info:{flex:1,marginLeft:11},code:{fontSize:10,fontWeight:'900'},name:{fontSize:14,fontWeight:'900',marginTop:2},meta:{fontSize:10,lineHeight:15,marginTop:3},qtyBlock:{alignItems:'flex-end'},qty:{fontSize:17,fontWeight:'900'},unit:{fontSize:10,marginTop:2}});
