import {AccessibleIonicons as Ionicons} from '../accessibility/AccessibleNative';
import {AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';
import {useEffect, useState} from 'react';

import { Keyboard, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';
import { getRoleTabs, SCREENS } from '../../navigation/routes';
import { usePlanengenStyle } from './PlanengenScreen';

export function BottomTabs() {
  const { activeTab, currentScreen, currentUser, openScreen, selectTab } = useApp();
  const items = getRoleTabs(currentUser?.role);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {width} = useWindowDimensions();
  const { colors } = usePlanengenStyle();
  const [keyboardVisible,setKeyboardVisible]=useState(()=>Keyboard.isVisible());
  useEffect(()=>{const show=Keyboard.addListener('keyboardDidShow',()=>setKeyboardVisible(true));const hide=Keyboard.addListener('keyboardDidHide',()=>setKeyboardVisible(false));return ()=>{show.remove();hide.remove();};},[]);
  const directScreen = items.some(item => item.screen === currentScreen);
  if(keyboardVisible)return null;
  return <View accessibilityRole="tablist" style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12), borderColor: colors.border }]}>
    {items.map(item => {
      const isMoreScreen = !directScreen && item.id === 'more' && [SCREENS.PROFILE, SCREENS.REPORTS, SCREENS.SETTINGS, SCREENS.COMPANY_PERMISSIONS].includes(currentScreen);
      const isStockFlow = item.id === 'stock' && [SCREENS.STOCK, SCREENS.LABEL, SCREENS.SCANNER, SCREENS.TRANSFERS].includes(currentScreen);
      const isPurchaseFlow = item.id === 'purchases' && [SCREENS.PURCHASES, SCREENS.RECEIPT].includes(currentScreen);
      const active = item.tab
        ? (currentScreen === SCREENS.TABS && activeTab === item.tab) || (item.id === 'home' && currentScreen === SCREENS.MASTER_PANEL)
        : currentScreen === item.screen || isMoreScreen || isStockFlow || isPurchaseFlow;
      return <TouchableOpacity key={item.id} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={item.label}
        onPress={() => item.tab ? selectTab(item.tab) : openScreen(item.screen)} style={styles.item}>
        <View style={[styles.icon, { backgroundColor: active ? '#E7F2FE' : 'transparent' }]}>
          <Ionicons name={active ? item.icon : `${item.icon}-outline`} size={22} color={active ? colors.blue : colors.muted}/>
        </View>
        <Text style={[styles.label, { fontSize: (width < 360 ? 10 : 11) * (theme.fontScale || 1), color: active ? colors.blue : colors.muted, fontWeight: active ? '700' : '500' }]}>{item.label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
}
const styles = StyleSheet.create({
  bar: { position: 'absolute', right: 0, bottom: 0, left: 0, paddingTop: 8, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'stretch', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  item: { flex: 1, minWidth: 0, minHeight: 58, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 42, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  label: { width: '100%', marginTop: 4, textAlign: 'center', flexShrink: 1 },
});
