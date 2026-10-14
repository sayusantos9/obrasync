import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { Text, TouchableOpacity, View } from 'react-native';
import { scannerStyles as styles } from './scannerStyles';
import { theme } from '../../theme';
import { BARCODE_TYPES } from '../../utils/scanner';

export function ScannerCameraPanel({
  hasPermission,
  isFlashEnabled,
  isScanned,
  onBarcodeScanned,
  onToggleFlash,
}) {
  if (!hasPermission) {
    return (
      <View style={styles.cameraArea}>
        <View style={styles.permissionPanel}>
          <Ionicons name="camera-outline" size={62} color={theme.colors.accent} />
          <Text style={styles.permissionTitle}>A câmera é necessária</Text>
          <Text style={styles.permissionText}>
            O ObraSync usa a câmera somente para identificar materiais, pedidos e
            movimentações do estoque.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cameraArea}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={isFlashEnabled}
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={isScanned ? undefined : onBarcodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <View style={styles.scanLine} />
        </View>

        <Text style={styles.cameraHint}>
          {isScanned ? 'Código identificado' : 'Posicione o código dentro da área'}
        </Text>
        <Text style={styles.cameraSubtext}>QR Code e códigos de barras compatíveis</Text>

        <TouchableOpacity style={styles.flashButton} onPress={onToggleFlash}>
          <Ionicons
            name={isFlashEnabled ? 'flash' : 'flash-outline'}
            size={23}
            color={isFlashEnabled ? theme.colors.accent : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
