import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingIllustration } from '../components/OnboardingIllustration';
import { ReadableText as Text } from '../components/accessibility/ReadableText';
import { AccessibleTouchableOpacity as TouchableOpacity } from '../components/accessibility/AccessibleNative';
import { colors as loginColors } from './LoginScreen.styles';

const SLIDES = [
  { eyebrow: 'ORGANIZE', title: 'Todas as suas obras\nem um só lugar.', description: 'Conecte equipe, materiais e planejamento. Sua próxima etapa começa com tudo organizado.' },
  { eyebrow: 'PLANEJE', title: 'Seu orçamento\nsob controle.', description: 'Organize compras e acompanhe os custos para decidir com mais segurança.' },
  { eyebrow: 'ACOMPANHE', title: 'Cada etapa, mais perto\ndo resultado.', description: 'Veja o andamento das obras e mantenha sua equipe em sintonia, do início à entrega.' },
];

function SlideContent({ slide, page, active, reducedMotion, compact }) {
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reducedMotion) { entrance.setValue(1); return; }
    if (!active) { entrance.setValue(0); return; }
    entrance.setValue(0);
    const animation = Animated.timing(entrance, { toValue: 1, duration: 850, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [active, reducedMotion, entrance]);
  return <Animated.View style={[styles.slideContent, { opacity: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }), transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
    <View style={[styles.artContainer, compact && styles.compactArt]}><OnboardingIllustration index={page} /></View>
    <View style={styles.copy}>
      <View style={styles.eyebrowRow}><View style={styles.accent} /><Text style={styles.eyebrow}>{slide.eyebrow}</Text></View>
      <Text accessibilityRole="header" style={[styles.title, compact && styles.compactTitle]}>{slide.title}</Text>
      <Text style={styles.description}>{slide.description}</Text>
    </View>
  </Animated.View>;
}

export function OnboardingScreen({ onFinish, reduceMotion = false, visible = true }) {
  const { width, height } = useWindowDimensions();
  const pager = useRef(null);
  const [index, setIndex] = useState(0);
  const currentIndex = useRef(index);
  currentIndex.current = index;
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setSystemReducedMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReducedMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    pager.current?.scrollTo({ x: currentIndex.current * width, animated: false });
  }, [width]);
  const goTo = next => {
    setIndex(next);
    pager.current?.scrollTo({ x: next * width, animated: !reduceMotion && !systemReducedMotion });
  };
  const compact = height < 740;
  const finish = () => onFinish(reduceMotion || systemReducedMotion);

  return (
    <LinearGradient colors={[loginColors.navy, '#10103C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.root}>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.brand}>Obra<Text style={styles.brandAccent}>Sync</Text></Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Pular apresentação e ir para o login" onPress={finish} style={styles.skip}><Text style={styles.skipText}>Pular</Text></TouchableOpacity>
        </View>
        <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.pager}
          onMomentumScrollEnd={event => setIndex(Math.max(0, Math.min(SLIDES.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))))}>
          {SLIDES.map((slide, page) => <ScrollView key={slide.eyebrow} style={{ width }} contentContainerStyle={[styles.page, compact && styles.compactPage]}
            accessibilityElementsHidden={page !== index} importantForAccessibility={page === index ? 'auto' : 'no-hide-descendants'}>
            <SlideContent slide={slide} page={page} active={visible && page === index} reducedMotion={reduceMotion || systemReducedMotion} compact={compact} />
          </ScrollView>)}
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((slide, page) => <TouchableOpacity key={slide.eyebrow} accessibilityRole="button" accessibilityLabel={`Ir para tela ${page + 1} de ${SLIDES.length}`} accessibilityState={{ selected: page === index }} onPress={() => goTo(page)} style={styles.dotTarget}>
              <View style={[styles.dot, page === index && styles.activeDot]} />
            </TouchableOpacity>)}
          </View>
          <Text accessibilityLiveRegion="polite" style={styles.counter}>{index + 1} de {SLIDES.length}</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => index === SLIDES.length - 1 ? finish() : goTo(index + 1)} style={styles.next}>
            <Text style={styles.nextText}>{index === SLIDES.length - 1 ? 'Acessar ObraSync' : 'Próximo'}</Text><Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 26, paddingTop: 8 },
  brand: { fontSize: 25, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 }, brandAccent: { color: loginColors.blue },
  skip: { minHeight: 48, minWidth: 60, justifyContent: 'center', alignItems: 'center' }, skipText: { fontSize: 15, fontWeight: '600', color: '#B5C8E6' },
  pager: { flex: 1 }, page: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 20 }, compactPage: { paddingVertical: 8 },
  slideContent: { width: '100%', alignItems: 'center', maxWidth: 480 },
  artContainer: { width: '100%', maxWidth: 400, height: 300, marginBottom: 28 }, compactArt: { height: 210, marginBottom: 18 },
  art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  copy: { width: '100%', alignItems: 'center', minHeight: 184 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 15 },
  accent: { width: 16, height: 3, borderRadius: 2, backgroundColor: '#F47C20' },
  eyebrow: { color: '#B5C8E6', fontWeight: '800', fontSize: 11, letterSpacing: 2.3, textAlign: 'center' },
  title: { color: '#FFFFFF', fontSize: 31, lineHeight: 39, letterSpacing: -1, fontWeight: '800', textAlign: 'center', maxWidth: 440 }, compactTitle: { fontSize: 26, lineHeight: 33 },
  description: { fontSize: 15, lineHeight: 24, color: '#BBC2D5', textAlign: 'center', marginTop: 16, maxWidth: 330 },
  footer: { paddingHorizontal: 26, paddingBottom: 20, paddingTop: 8, width: '100%', maxWidth: 560, alignSelf: 'center', alignItems: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center' }, dotTarget: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#FFFFFF30' }, activeDot: { width: 29, backgroundColor: loginColors.blue },
  counter: { fontSize: 11, color: '#BBC2D5', marginBottom: 12 }, next: { backgroundColor: loginColors.blue, borderRadius: 18, minHeight: 58, paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, width: '100%' }, nextText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
