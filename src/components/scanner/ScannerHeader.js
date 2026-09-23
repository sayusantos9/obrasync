import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
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
