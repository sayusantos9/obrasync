import { KeyboardScrollView } from './KeyboardScrollView';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';

export function usePlanengenStyle() {
  const theme = useTheme();
  const { accessibilitySettings } = useApp();
  const highContrast = accessibilitySettings?.highContrast;
  const colors = { navy: '#010028', blue: highContrast ? '#003F85' : '#0066BE', text: highContrast ? '#000000' : '#202020', muted: highContrast ? '#343434' : '#575D6B', border: highContrast ? '#707070' : '#DFE3EA', background: highContrast ? '#FFFFFF' : '#EEF0F2' };
  const text = (style, color = colors.text) => [style, { color, fontSize: style.fontSize * (theme.fontScale || 1) }];
  return { colors, text };
}
export function PlanengenScreen({ title, children, bottomTabs = false, scroll = true }) {
  const { goBack, accessibilitySettings } = useApp();
  const scrollRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { colors, text } = usePlanengenStyle();
  const insets = useSafeAreaInsets();
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
    <View style={styles.brand}><Image source={require('../../assets/brand/planengen-light.png')} resizeMode="contain" accessibilityLabel="Planengen" style={styles.logo}/><Text style={text(styles.brandText, '#B8C9E4')}>OBRASYNC</Text></View>
    <View style={styles.header}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={styles.back}><Ionicons name="arrow-back" size={23} color="#FFFFFF"/></TouchableOpacity><Text accessibilityRole="header" style={text(styles.title, '#FFFFFF')}>{title}</Text></View>
    {scroll ? <KeyboardScrollView ref={scrollRef} onScroll={({nativeEvent}) => setShowScrollTop(nativeEvent.contentOffset.y > 200)} scrollEventThrottle={16} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={[styles.body, { backgroundColor: colors.background }]} contentContainerStyle={{ padding: 20, paddingBottom: (bottomTabs ? 110 : 28) + insets.bottom }}>{children}</KeyboardScrollView> : <View style={[styles.body,{backgroundColor:colors.background,overflow:'hidden'}]}>{children}</View>}
    {scroll && showScrollTop && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar ao topo" style={[styles.scrollTop,{backgroundColor:colors.navy,bottom:(bottomTabs?92:20)+insets.bottom}]} onPress={()=>{scrollRef.current?.scrollTo({y:0,animated:!accessibilitySettings?.reduceMotion});setShowScrollTop(false);}}><Ionicons name="arrow-up" size={23} color="#FFFFFF"/></TouchableOpacity>}
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  scrollTop: { position:'absolute',right:20,width:48,height:48,borderRadius:24,alignItems:'center',justifyContent:'center',elevation:4,shadowColor:'#010028',shadowOpacity:0.18,shadowRadius:8,shadowOffset:{width:0,height:4} },
  screen: { flex: 1, backgroundColor: '#010028' }, brand: { paddingHorizontal: 22, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  logo: { width: 126, height: 36, flexShrink: 1 }, brandText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 18 }, back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', flex: 1, letterSpacing: -0.5 }, body: { flex: 1, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
});
