import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { scannerStyles as styles } from './scannerStyles';
import { theme } from '../../theme';

export function ScannerActions({
  hasPermission,
  primaryLabel,
  onPrimaryAction,
  onManualCode,
}) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryAction}>
        <Ionicons
          name={hasPermission ? 'scan' : 'camera'}
          size={22}
          color={theme.colors.primaryDark}
        />
        <Text style={styles.primaryText}>{primaryLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onManualCode}>
        <Ionicons name="keypad-outline" size={21} color={theme.colors.primary} />
        <Text style={styles.secondaryText}>Digitar código manualmente</Text>
      </TouchableOpacity>
    </View>
  );
}
