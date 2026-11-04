import {ThemeProvider,useTheme} from 'styled-components/native';
import {PlanengenScreen,usePlanengenStyle} from './PlanengenScreen';

export function useInventoryStyles(base) {
 const {fontScale=1}=useTheme();
 return Object.fromEntries(Object.entries(base).map(([key,value])=>[key,{...value,...(value.fontSize?{fontSize:value.fontSize*fontScale}:{}),...(value.lineHeight?{lineHeight:value.lineHeight*fontScale}:{})}]));
}

export function useInventoryTheme() {
 const base=useTheme();const {colors}=usePlanengenStyle();
 return {...base,colors:{...base.colors,primary:colors.navy,primaryDark:colors.navy,primarySoft:'#E7F2FE',accent:colors.blue,accentSoft:'#E7F2FE',background:colors.background,surface:'#FFFFFF',border:colors.border,text:colors.text,textMuted:colors.muted}};
}
export function InventoryScreen({children,...props}) {
 const theme=useInventoryTheme();
 return <ThemeProvider theme={theme}><PlanengenScreen bottomTabs {...props}>{children}</PlanengenScreen></ThemeProvider>;
}
