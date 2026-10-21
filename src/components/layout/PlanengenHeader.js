import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

const LOGO = require('../../assets/logo cinza claro.png');

// A separate row keeps the brand clear of each screen's navigation controls.
export function PlanengenHeader() {
  const theme = useTheme();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.content}>
        <Image
          accessible
          accessibilityLabel="Logo da Planengen"
          resizeMode="contain"
          source={LOGO}
          style={styles.logo}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexShrink: 0 },
  content: { height: 56, justifyContent: 'center', paddingHorizontal: 20 },
  logo: { alignSelf: 'flex-start', width: 120, height: 34.5, maxWidth: '100%' },
});
