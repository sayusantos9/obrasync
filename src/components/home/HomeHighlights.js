import {AccessibleIonicons as Ionicons} from '../accessibility/AccessibleNative';
import {AccessibleImage as Image,AccessibleScrollView as ScrollView,AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';

import {LinearGradient} from 'expo-linear-gradient';
import {useRef,useState} from 'react';
import {StyleSheet,useWindowDimensions} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useApp} from '../../contexts/AppContext';
import {SCREENS,TABS} from '../../navigation/routes';
import {canAccessRoute,requiresProject} from '../../utils/permissions';
const BANNER=require('../../assets/brand/client-construction.png');
const BLUE='#0075E8';
const HIGHLIGHTS = {
  MASTER: [
    { title: 'Sua equipe,', accent: 'conectada', description: 'Cadastre as pessoas e organize os perfis de acesso.', icon: 'people-outline', screen: SCREENS.CREATE_MEMBER },
    { title: 'Cada obra,', accent: 'sob seu olhar.', description: 'Consulte os projetos e acompanhe o andamento.', icon: 'construct-outline', tab: TABS.PROJECTS },
    { title: 'Informação para', accent: 'decidir melhor.', description: 'Consulte e exporte os relatórios da obra.', icon: 'bar-chart-outline', screen: SCREENS.REPORTS },
  ],
  ENGINEERING: [
    { title: 'Planeje seus', accent: 'insumos', description: 'Defina quantidades, preços e BDI no orçamento.', icon: 'calculator-outline', screen: SCREENS.CREATE_BUDGET, needsProject: true },
    { title: 'Do previsto', accent: 'ao realizado.', description: 'Compare o orçamento com as compras confirmadas.', icon: 'git-compare-outline', screen: SCREENS.COMPARISON },
    { title: 'Preços para', accent: 'seu planejamento.', description: 'Consulte e registre referências dos fornecedores.', icon: 'search-outline', screen: SCREENS.MARKET_PRICES },
  ],
  PURCHASING: [
    { title: 'Organize as', accent: 'suas compras', description: 'Acompanhe solicitações e pedidos da obra.', icon: 'cart-outline', screen: SCREENS.PURCHASES },
    { title: 'Receba e confira', accent: 'cada entrega.', description: 'Registre os insumos recebidos, inclusive entregas parciais.', icon: 'cube-outline', screen: SCREENS.RECEIPT },
    { title: 'Compare os', accent: 'preços', description: 'Registre as ofertas e compare os fornecedores.', icon: 'search-outline', screen: SCREENS.MARKET_PRICES },
  ],
  REQUESTER: [
    { title: 'Solicite os', accent: 'insumos', description: 'Informe o que a equipe precisa e a data necessária.', icon: 'cart-outline', screen: SCREENS.REQUEST },
    { title: 'Consulte o', accent: 'estoque', description: 'Veja os saldos disponíveis na obra selecionada.', icon: 'cube-outline', screen: SCREENS.STOCK },
    { title: 'Registre o', accent: 'consumo', description: 'Mantenha os saldos atualizados com o uso dos insumos.', icon: 'swap-horizontal-outline', screen: SCREENS.TRANSFERS },
  ],
};


export function HomeHighlights(){
 const {currentUser,selectedProject,selectTab,openScreen,accessibilitySettings}=useApp();
 const theme=useTheme();
 const {width,fontScale}=useWindowDimensions();
 const scale=theme.fontScale||1;
 const largeText=fontScale*(theme.layoutFontScale||scale)>1.1;
 const text=(style,color='#010028')=>[style,{color,fontSize:style.fontSize*scale}];
 const slides=(HIGHLIGHTS[currentUser?.role]||[]).filter(item=>canAccessRoute(currentUser?.role,item.screen||SCREENS.TABS,item.tab));
 const carousel=useRef(null);
 const [slide,setSlide]=useState(0);
 const [carouselWidth,setCarouselWidth]=useState(0);
 const bannerHeight=Math.max(largeText?Math.ceil(240*fontScale*(theme.layoutFontScale||scale)/1.3):(width<350?180:148),(carouselWidth||Math.max(1,width-48))/2.45);
 function moveTo(index){const next=(index+slides.length)%slides.length;carousel.current?.scrollTo({x:next*carouselWidth,animated:!accessibilitySettings?.reduceMotion});setSlide(next);}
 function navigate(item){if(!selectedProject?.id&&(item.needsProject||requiresProject(item.screen,item.tab)))return selectTab(TABS.PROJECTS);item.tab?selectTab(item.tab):openScreen(item.screen);}
 if(!slides.length)return null;
 return <View style={{marginTop:16}}>
          <View style={styles.carouselArea} onLayout={({ nativeEvent }) => {
            const nextWidth = Math.max(1, nativeEvent.layout.width - 4);
            if (nextWidth !== carouselWidth) { setCarouselWidth(nextWidth); carousel.current?.scrollTo({ x: slide * nextWidth, animated: false }); }
          }}>
            <View style={styles.carouselFrame}>
              <ScrollView testID="home-highlights-carousel" ref={carousel} horizontal pagingEnabled style={{height:bannerHeight,flexGrow:0,flexShrink:0}} showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={({ nativeEvent }) => carouselWidth && setSlide(Math.round(nativeEvent.contentOffset.x / carouselWidth))}>
                {slides.map((item, index) => <TouchableOpacity key={item.accent} accessibilityRole="button"
                  accessibilityLabel={item.title + ' ' + item.accent + '. ' + item.description}
                  onPress={() => navigate(item)} activeOpacity={0.9} style={[styles.banner, { width: carouselWidth || Math.max(1, width - 48), height:bannerHeight,minHeight:bannerHeight }]}>
                  {index === 0 && <Image source={BANNER} style={styles.bannerPhoto} resizeMode="cover" accessible={false}/>}
                  <LinearGradient colors={index === 0 ? ['#00204A', '#00204AF5', '#00367400'] : ['#00204A', '#003566', '#04538A']} locations={[0, 0.57, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill}/>
                  <View style={[styles.bannerCopy, index > 0 && styles.bannerCopyFull]}>
                    <View style={styles.bannerTitleRow}><View style={styles.bannerIcon}><Ionicons name={item.icon} size={29} color="#9AEAFF"/></View><View style={{ flex: 1 }}><Text style={text(styles.bannerTitle, '#FFFFFF')}>{item.title}</Text><Text style={text(styles.bannerTitle, '#42D5FF')}>{item.accent}</Text></View></View>
                    <Text style={text(styles.bannerDescription, '#FFFFFF')}>{item.description}</Text>
                  </View>
                </TouchableOpacity>)}
              </ScrollView>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Banner anterior" onPress={() => moveTo(slide - 1)} style={[styles.carouselArrow, { left: -13 }]}><Ionicons name="chevron-back" size={25} color={BLUE}/></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Próximo banner" onPress={() => moveTo(slide + 1)} style={[styles.carouselArrow, { right: -13 }]}><Ionicons name="chevron-forward" size={25} color={BLUE}/></TouchableOpacity>
          </View>
          <View style={styles.dots}>{slides.map((item, index) => <TouchableOpacity key={item.accent} accessibilityRole="button" accessibilityLabel={'Ir ao banner ' + (index + 1)} accessibilityState={{ selected: slide === index }} onPress={() => moveTo(index)} style={styles.dotTouch}><View style={[styles.dot, slide === index && styles.activeDot]}/></TouchableOpacity>)}</View>

 </View>;
}
const styles=StyleSheet.create({
  carouselArea: { marginHorizontal: 7 },
  carouselFrame: { overflow: 'hidden', borderRadius: 18, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#00204A', shadowColor: '#15467B', shadowOpacity: 0.2, shadowRadius: 12 },
  banner: { aspectRatio: 2.45, overflow: 'hidden', justifyContent: 'center' },
  bannerPhoto: { position: 'absolute', right: 0, top: 0, width: '70%', height: '100%' },
  bannerCopy: { paddingVertical: 12, paddingLeft: 22, width: '77%' },
  bannerCopyFull: { width: '100%', paddingRight: 22 },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerIcon: { width: 45, height: 45, borderRadius: 12, borderColor: '#00BAFA', borderWidth: 1.5, backgroundColor: '#075180', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 21, fontWeight: '800', letterSpacing: -0.5 },
  bannerDescription: { fontSize: 11, marginTop: 9 },
  carouselArrow: { position: 'absolute', top: '50%', marginTop: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#164578', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 3 } },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 2 },
  dotTouch: { minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#80ADD9' },
  activeDot: { width: 14, backgroundColor: '#0085FB' },
});
