import {Ionicons} from '@expo/vector-icons';
import {StyleSheet,Text,TouchableOpacity,View,useWindowDimensions} from 'react-native';
import {useTheme} from 'styled-components/native';
import {usePlanengenStyle} from '../layout/PlanengenScreen';

// Same indicator composition as the original Client panel: icon + value, then labels.
export function HomeIndicators({metrics, onNavigate}) {
  const theme=useTheme();
  const {width,fontScale}=useWindowDimensions();
  const {colors,text}=usePlanengenStyle();
  const stacked=fontScale*(theme.fontScale||1)>1.3;
  if(!metrics.length)return null;
  return <View testID="home-indicators" style={[styles.card,stacked&&styles.stack,{borderColor:colors.border}]}>
    {metrics.map((metric,index)=>{
      const Component=onNavigate?TouchableOpacity:View;
      return <Component key={metric.id||metric.label} accessible accessibilityRole={onNavigate?'button':undefined} accessibilityLabel={`${metric.label}: ${metric.value}. ${metric.detail||''}`}
        onPress={onNavigate?()=>onNavigate(metric):undefined} style={[styles.metric,index>0&&(stacked?styles.topBorder:styles.leftBorder),stacked&&styles.wide]}>
        <View style={styles.top}><View style={[styles.icon,width<350&&!stacked&&styles.smallIcon]}><Ionicons name={metric.icon||'bar-chart-outline'} size={width<350?23:28} color={colors.blue}/></View><Text style={text(styles.value,colors.navy)}>{metric.value}</Text></View>
        <View><Text style={text(styles.label,colors.navy)}>{metric.label}</Text><Text style={text(styles.detail,colors.muted)}>{metric.detail||'da obra atual'}</Text></View>
      </Component>;
    })}
  </View>;
}
const styles=StyleSheet.create({
  card:{backgroundColor:'#F9FBFF',borderWidth:1,borderRadius:17,paddingVertical:12,flexDirection:'row',shadowColor:'#174A83',shadowOpacity:0.15,shadowRadius:12,shadowOffset:{width:0,height:7},elevation:3},
  stack:{flexDirection:'column',alignItems:'stretch'},metric:{flex:1,minWidth:0,paddingHorizontal:8,gap:5},wide:{paddingVertical:10,flex:0},leftBorder:{borderLeftWidth:1,borderColor:'#D4E1F4'},topBorder:{borderTopWidth:1,borderColor:'#D4E1F4'},
  top:{flexDirection:'row',alignItems:'center',gap:6,flexWrap:'wrap'},icon:{width:37,height:42,borderRadius:12,backgroundColor:'#E1F1FF',alignItems:'center',justifyContent:'center'},smallIcon:{width:26,height:36},value:{fontSize:23,fontWeight:'800',flexShrink:1},label:{fontSize:10,fontWeight:'700',marginTop:1},detail:{fontSize:10,marginTop:1},
});
