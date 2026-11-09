import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

const BUILDINGS = [
  { x: 16, y: 52, height: 51, color: '#1F6AA5', windows: [60, 76] },
  { x: 48, y: 32, height: 71, color: '#0084F4', windows: [42, 58, 74] },
  { x: 80, y: 12, height: 91, color: '#64BAFF', windows: [22, 38, 54] },
];

export function SplashScreen({ ready, onFinish, reduceMotion = false }) {
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [markFinished, setMarkFinished] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const buildings = useRef(BUILDINGS.map(() => new Animated.Value(0))).current;
  const check = useRef(new Animated.Value(0)).current;
  const reducedMotion = reduceMotion || systemReducedMotion;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!mounted) return;
      setSystemReducedMotion(reduced);
      setMotionReady(true);
    }).catch(() => { if (mounted) setMotionReady(true); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReducedMotion);
    const timer = setTimeout(() => setMinimumElapsed(true), 1600);
    return () => { mounted = false; clearTimeout(timer); subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!motionReady) return;
    const entrance = Animated.timing(opacity, { toValue: 1, duration: reducedMotion ? 0 : 650, useNativeDriver: true });
    entrance.start();
    pulse.setValue(0);
    const animation = reducedMotion ? null : Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 850, useNativeDriver: true, isInteraction: false }),
    ]));
    animation?.start();
    return () => { entrance.stop(); animation?.stop(); };
  }, [motionReady, reducedMotion, opacity, pulse]);

  useEffect(() => {
    if (!motionReady) return;
    setMarkFinished(false);
    if (reducedMotion) {
      buildings.forEach(value => value.setValue(1));
      check.setValue(1);
      setMarkFinished(true);
      return;
    }
    buildings.forEach(value => value.setValue(0));
    check.setValue(0);
    const construction = Animated.sequence([
      Animated.delay(180),
      ...buildings.map(value => Animated.timing(value, { toValue: 1, duration: 240, useNativeDriver: true })),
      Animated.timing(check, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.delay(350),
    ]);
    construction.start(({ finished }) => { if (finished) setMarkFinished(true); });
    return () => construction.stop();
  }, [motionReady, reducedMotion, buildings, check]);

  useEffect(() => {
    if (!ready || !minimumElapsed || !motionReady || !markFinished) return;
    const exit = Animated.timing(exitOpacity, { toValue: 0, duration: reducedMotion ? 0 : 350, useNativeDriver: true });
    exit.start(({ finished }) => { if (finished) onFinish(); });
    return () => exit.stop();
  }, [ready, minimumElapsed, motionReady, markFinished, reducedMotion, exitOpacity, onFinish]);

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity }]}>
    <LinearGradient colors={['#010028', '#071C40', '#010028']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View pointerEvents="none" accessible={false} style={styles.blueprint}>
          <Svg width="320" height="440" viewBox="0 0 320 440">
            <Path d="M20 440V210L100 160V440M100 160L180 205V440M180 440V80L270 30V440M270 30L315 58V440M0 395H320M0 360H320M0 15H300" stroke="#0084F4" strokeWidth="1" fill="none" />
          </Svg>
        </View>
        <Animated.View style={[styles.content, { opacity }]}>
          <View accessible={false} style={styles.mark}>
            <View style={styles.buildingClip}>
              {BUILDINGS.map((building, index) => (
                <Animated.View key={building.x} style={[styles.markLayer, {
                  opacity: buildings[index],
                  transform: [{ translateY: buildings[index].interpolate({ inputRange: [0, 1], outputRange: [building.height * 112 / 120, 0] }) }],
                }]}>
                  <Svg width="112" height="112" viewBox="0 0 120 120">
                    <Rect x={building.x} y={building.y} width="23" height={building.height} rx="5" fill={building.color} />
                    {building.windows.map(y => <Rect key={y} x={building.x + 7} y={y} width="9" height="7" rx="1" fill="white" />)}
                  </Svg>
                </Animated.View>
              ))}
            </View>
            <Svg style={styles.markLayer} width="112" height="112" viewBox="0 0 120 120">
              <Path d="M12 105H105" stroke="#0084F4" strokeWidth="7" strokeLinecap="round" />
            </Svg>
            <Animated.View style={[styles.markLayer, { opacity: check, transform: [{ scale: check.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0.75, 1.04, 1] }) }] }]}>
              <Svg width="112" height="112" viewBox="0 0 120 120">
                <Path d="M83 84L94 95L113 72" stroke="#F47C20" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Animated.View>
          </View>
          <Text accessibilityRole="header" style={styles.title}>Obra<Text style={styles.sync}>Sync</Text></Text>
          <View accessible={false} style={styles.accentTrack}>
            <Animated.View style={[styles.accent, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }), transform: [{ scaleX: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.65] }) }] }]} />
          </View>
          <Text style={styles.tagline}>Sua obra, em sintonia.</Text>
          <Text accessibilityRole="progressbar" accessibilityLiveRegion="polite" style={styles.loading}>Preparando seu espaço…</Text>
        </Animated.View>
        <View style={styles.footer}>
          <Image source={require('../assets/brand/planengen-light.png')} resizeMode="contain" style={styles.logo} accessibilityLabel="Planengen" />
          <Text style={styles.signature}>GESTÃO QUE CONSTRÓI RESULTADOS</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 200, backgroundColor: '#010028' },
  gradient: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 28 },
  blueprint: { position: 'absolute', right: -100, bottom: 80, opacity: 0.12 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 24 },
  mark: { width: 112, height: 112, marginBottom: 10 },
  buildingClip: { position: 'absolute', top: 0, left: 0, right: 0, height: 98, overflow: 'hidden' },
  markLayer: { position: 'absolute', top: 0, left: 0, width: 112, height: 112 },
  title: { color: '#FFFFFF', fontSize: 42, fontWeight: '700', letterSpacing: -1.5, textAlign: 'center' },
  sync: { color: '#64BAFF' },
  accentTrack: { width: 72, height: 3, alignItems: 'center', marginVertical: 22 },
  accent: { width: 36, height: 3, backgroundColor: '#F47C20', borderRadius: 2 },
  tagline: { color: '#DAE4F2', fontSize: 16, textAlign: 'center' },
  loading: { color: '#94A9C4', fontSize: 12, marginTop: 42, textAlign: 'center' },
  footer: { alignItems: 'center', paddingTop: 16, paddingBottom: 24, gap: 12 },
  logo: { width: 184, height: 52 },
  signature: { color: '#BDCADC', fontSize: 10, lineHeight: 16, letterSpacing: 1.2, textAlign: 'center' },
});
