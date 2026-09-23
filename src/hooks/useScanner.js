import { useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert } from 'react-native';
import { labelApi } from '../services/labelApi';
import {
  findMaterialFromCode,
  formatScannerDetails,
  getScannerActionLabel,
} from '../utils/scanner';

export function useScanner() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const hasCameraPermission = Boolean(cameraPermission?.granted);

  function resetScanner() {
    setIsScanned(false);
  }

  function showResult(title, message, buttonLabel = 'Concluir') {
    Alert.alert(title, message, [{ text: buttonLabel, onPress: resetScanner }]);
  }

  async function handleBarcodeScanned({ data, type }) {
    setIsScanned(true);

    const labelId = labelApi.getIdFromQr(data);
    if (labelId) {
      try {
        const { label } = await labelApi.getById(labelId);
        showResult('Etiqueta localizada', formatScannerDetails(label));
      } catch (error) {
        showResult('Não foi possível consultar', error.message, 'Tentar novamente');
      }
      return;
    }

    const material = findMaterialFromCode(data);
    if (material) {
      showResult('Material identificado', formatScannerDetails(material));
      return;
    }

    showResult(
      'Código lido',
      `Tipo: ${type}\nConteúdo: ${data}`,
      'Escanear novamente',
    );
  }

  async function handlePrimaryAction() {
    if (!hasCameraPermission) {
      await requestCameraPermission();
      return;
    }

    resetScanner();
  }

  function handleHelp() {
    Alert.alert(
      'Como usar',
      'Centralize a etiqueta ObraSync, QR Code ou código de barras dentro da moldura.',
    );
  }

  function handleManualCode() {
    Alert.alert(
      'Digitar código',
      'A entrada manual aceita códigos internos como ACO-014 e códigos do fornecedor.',
    );
  }

  return {
    handleBarcodeScanned,
    handleHelp,
    handleManualCode,
    handlePrimaryAction,
    hasCameraPermission,
    isFlashEnabled,
    isScanned,
    primaryActionLabel: getScannerActionLabel(hasCameraPermission, isScanned),
    toggleFlash: () => setIsFlashEnabled((currentValue) => !currentValue),
  };
}
