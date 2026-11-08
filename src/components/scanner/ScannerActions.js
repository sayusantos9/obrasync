import {AccessibleIonicons as Ionicons} from '../accessibility/AccessibleNative';
import {AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../accessibility/AccessibleNative';
import {ReadableText as Text} from '../accessibility/ReadableText';


import { scannerStyles as styles } from './scannerStyles';
import {useInventoryTheme} from '../layout/InventoryScreen';

export function ScannerActions({
  hasPermission,
  primaryLabel,
  onPrimaryAction,
  onManualCode,
}) {
  const theme=useInventoryTheme();
  return (
    <View style={styles.actions}>
      <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={onPrimaryAction}>
        <Ionicons
          name={hasPermission ? 'scan' : 'camera'}
          size={22}
          color="#FFFFFF"
        />
        <Text style={styles.primaryText}>{primaryLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={onManualCode}>
        <Ionicons name="keypad-outline" size={21} color={theme.colors.primary} />
        <Text style={styles.secondaryText}>Digitar código manualmente</Text>
      </TouchableOpacity>
    </View>
  );
}
