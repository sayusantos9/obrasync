import {AccessibleIonicons as Ionicons} from '../accessibility/AccessibleNative';
import {AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';


import { theme } from '../../theme';
import { scannerStyles as styles } from './scannerStyles';

export function ScannerHeader({ onBack, onHelp }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.headerButton, styles.backButton]}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
      </TouchableOpacity>

      <View style={styles.headerCopy}>
        <Text style={styles.title}>Scanner</Text>
        <Text style={styles.subtitle}>Recebimento e estoque</Text>
      </View>

      <TouchableOpacity style={styles.headerButton} onPress={onHelp}>
        <Ionicons name="help-circle-outline" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
}
