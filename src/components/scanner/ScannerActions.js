import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
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
