import { ScannerActions } from '../components/scanner/ScannerActions';
import { ScannerCameraPanel } from '../components/scanner/ScannerCameraPanel';
import { ScannerHeader } from '../components/scanner/ScannerHeader';
import { Screen } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { useScanner } from '../hooks/useScanner';

export function ScannerScreen() {
  const { goBack } = useApp();
  const scanner = useScanner();

  return (
    <Screen>
      <ScannerHeader onBack={goBack} onHelp={scanner.handleHelp} />

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
    </Screen>
  );
}
