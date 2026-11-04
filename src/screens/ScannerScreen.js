import { ScannerActions } from '../components/scanner/ScannerActions';
import { ScannerCameraPanel } from '../components/scanner/ScannerCameraPanel';
import { InventoryScreen } from '../components/layout/InventoryScreen';
import {Text,TouchableOpacity} from 'react-native';
import { useScanner } from '../hooks/useScanner';

export function ScannerScreen() {
  const scanner = useScanner();

  return (
    <InventoryScreen title="Ler código">
      <TouchableOpacity accessibilityRole="button" onPress={scanner.handleHelp} style={{paddingVertical:14,minHeight:44}}><Text style={{color:'#0066BE'}}>Como identificar um insumo</Text></TouchableOpacity>

      <ScannerCameraPanel
        hasPermission={scanner.hasCameraPermission}
        isFlashEnabled={scanner.isFlashEnabled}
        isScanned={scanner.isScanned}
        onBarcodeScanned={scanner.handleBarcodeScanned}
        onToggleFlash={scanner.toggleFlash}
      />

      <ScannerActions
        hasPermission={scanner.hasCameraPermission}
        primaryLabel={scanner.primaryActionLabel}
        onPrimaryAction={scanner.handlePrimaryAction}
        onManualCode={scanner.handleManualCode}
      />
    </InventoryScreen>
  );
}
