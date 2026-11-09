// @refresh reset
import {AccessibilityToolsProvider} from './src/components/accessibility/AccessibilityTools';
import {ReauthenticationModal} from './src/components/security/ReauthenticationModal';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './src/constants/storageKeys';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { Animated, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components/native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { createTheme } from './src/theme';
import { USER_ROLES } from './src/data/authData';

function AppShell() {
  const { accessibilitySettings, currentUser, isAuthReady } = useApp();
  const [splashFinished, setSplashFinished] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE)
      .then(value => { if (mounted) setOnboardingComplete(value === 'true'); })
      .catch(() => { if (mounted) setOnboardingComplete(false); });
    return () => { mounted = false; };
  }, []);
  const [onboardingExiting, setOnboardingExiting] = useState(false);
  const onboardingOpacity = useRef(new Animated.Value(1)).current;
  const transitionStarted = useRef(false);
  const finishOnboarding = useCallback((reducedMotion = false) => {
    if (transitionStarted.current) return;
    transitionStarted.current = true;
    AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true').catch(() => {
      // Storage failure must not prevent access to the login screen.
    });
    if (reducedMotion) setOnboardingComplete(true);
    else setOnboardingExiting(true);
  }, []);
  useEffect(() => {
    if (!onboardingExiting) return;
    const fade = Animated.timing(onboardingOpacity, {
      toValue: 0, duration: 450, useNativeDriver: true,
    });
    fade.start(({ finished }) => { if (finished) setOnboardingComplete(true); });
    return () => fade.stop();
  }, [onboardingExiting, onboardingOpacity]);
  const finishSplash = useCallback(() => setSplashFinished(true), []);
  const purchasing = currentUser?.role === USER_ROLES.PURCHASING;
  const canShowApp = Boolean(currentUser) || onboardingComplete;
  const theme = useMemo(() => createTheme(accessibilitySettings, purchasing), [accessibilitySettings, purchasing]);

  return (
    <ThemeProvider theme={theme}>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: '#010028' }}>
      <View style={{ flex: 1 }} pointerEvents={splashFinished ? 'auto' : 'none'} accessibilityElementsHidden={!splashFinished} importantForAccessibility={splashFinished ? 'auto' : 'no-hide-descendants'}>
      {isAuthReady && onboardingComplete !== null && (
        <AccessibilityToolsProvider showToolbar={splashFinished && canShowApp}>
          {(canShowApp || onboardingExiting) && (
            <View style={{ flex: 1 }} pointerEvents={canShowApp ? 'auto' : 'none'} accessibilityElementsHidden={!canShowApp} importantForAccessibility={canShowApp ? 'auto' : 'no-hide-descendants'}>
              <AppNavigator />
              {canShowApp && <ReauthenticationModal />}
            </View>
          )}
          {!canShowApp && (
            <Animated.View pointerEvents={onboardingExiting ? 'none' : 'auto'} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: onboardingOpacity }}>
              <OnboardingScreen onFinish={finishOnboarding} visible={splashFinished} reduceMotion={Boolean(accessibilitySettings.reduceMotion)} />
            </Animated.View>
          )}
        </AccessibilityToolsProvider>
      )}
      </View>
      {!splashFinished && <SplashScreen ready={isAuthReady && onboardingComplete !== null} onFinish={finishSplash} reduceMotion={Boolean(accessibilitySettings.reduceMotion)} />}
      </View>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
// Participação: Jennyfer Karolyne — ObraSync
