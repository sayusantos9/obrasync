import { useCameraPermissions } from 'expo-camera';
import { useEffect,useRef,useState } from 'react';
import { Alert,AppState,Linking } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { labelApi } from '../services/labelApi';
import {
  findStockMaterial,
  formatScannerDetails,
  getScannerActionLabel,
} from '../utils/scanner';

export function useScanner() {
  const { stock } = useApp();
  const [cameraPermission, requestCameraPermission,refreshCameraPermission] = useCameraPermissions();
  const scanLock=useRef(false);
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const hasCameraPermission = Boolean(cameraPermission?.granted);
  useEffect(()=>{const listener=AppState.addEventListener('change',state=>{setIsFlashEnabled(false);if(state==='active')refreshCameraPermission().catch(()=>{});});return()=>listener.remove();},[refreshCameraPermission]);

  function resetScanner() {
    scanLock.current=false;
    setIsScanned(false);
  }

  function showResult(title, message, buttonLabel = 'Concluir') {
    Alert.alert(title, message, [{ text: buttonLabel, onPress: resetScanner }],{cancelable:false});
  }

  async function handleBarcodeScanned({ data, type }) {
    if(scanLock.current)return;
    scanLock.current=true;
    setIsScanned(true);

    const labelId = labelApi.getIdFromQr(data);
    if (labelId) {
      try {
        const { label } = await labelApi.getById(labelId);
        showResult('Etiqueta localizada', formatScannerDetails(label));
      } catch (error) {
        const qrDetails = labelApi.getDetailsFromQr(data);
        const material = findStockMaterial(stock, qrDetails?.materialCode || '');

        if (qrDetails) {
          showResult(
            'Etiqueta lida',
            formatScannerDetails({
              ...material,
              id: qrDetails.labelId,
              materialCode: qrDetails.materialCode,
              name: material?.name || qrDetails.materialCode || 'Material identificado',
              lot: qrDetails.lot,
              location: qrDetails.location || qrDetails.project,
            }),
            'Escanear novamente',
          );
        } else {
          showResult('Não foi possível consultar', error.message, 'Tentar novamente');
        }
      }
      return;
    }

    const material = findStockMaterial(stock, data);
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
      try{
        if(cameraPermission?.canAskAgain===false)await Linking.openSettings();
        else await requestCameraPermission();
      }catch{Alert.alert('Permissão da câmera','Não foi possível solicitar acesso. Confira a permissão de câmera nas configurações do celular.');}
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
      'Entrada manual',
      'Use o campo de busca em Materiais ou Estoque para localizar códigos digitados manualmente.',
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
    primaryActionLabel: !hasCameraPermission&&cameraPermission?.canAskAgain===false?'Abrir configurações da câmera':getScannerActionLabel(hasCameraPermission, isScanned),
    toggleFlash: () => setIsFlashEnabled((currentValue) => !currentValue),
  };
}
