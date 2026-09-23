import { useState } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import styled from 'styled-components/native';
import { Screen } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { inventoryLabels } from '../data/mockData';
import { labelApi } from '../services/labelApi';

const Header = styled.View`padding: 48px 18px 14px; background-color: ${({ theme }) => theme.colors.surface}; flex-direction: row; align-items: center; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border};`;
const Back = styled.TouchableOpacity`width: 42px; height: 42px; border-radius: 14px; background-color: ${({ theme }) => theme.colors.primarySoft}; align-items: center; justify-content: center;`;
const HeaderCopy = styled.View`flex: 1; align-items: center;`;
const Title = styled.Text`font-size: 19px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const Subtitle = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px;`;
const Help = styled.TouchableOpacity`width: 42px; height: 42px; align-items: center; justify-content: center;`;
const CameraArea = styled.View`flex: 1; min-height: 350px; background-color: #17111B; overflow: hidden;`;
const Camera = styled(CameraView)`position: absolute; left: 0; right: 0; top: 0; bottom: 0;`;
const CameraOverlay = styled.View`flex: 1; align-items: center; justify-content: center; padding: 24px; background-color: rgba(23,17,27,.18);`;
const PermissionPanel = styled.View`flex: 1; align-items: center; justify-content: center; padding: 32px;`;
const PermissionTitle = styled.Text`font-size: 18px; color: white; font-weight: 900; text-align: center; margin-top: 14px;`;
const PermissionText = styled.Text`font-size: 13px; line-height: 19px; color: rgba(255,255,255,.68); text-align: center; margin-top: 7px;`;
const ScanFrame = styled.View`width: 250px; height: 250px; border-radius: 24px; border: 1px solid rgba(255,255,255,.28); align-items: center; justify-content: center; background-color: rgba(38,13,53,.08);`;
const Corner = styled.View`position: absolute; width: 42px; height: 42px; border-color: ${({ theme }) => theme.colors.accent};`;
const ScanLine = styled.View`position: absolute; left: 20px; right: 20px; top: 124px; height: 2px; background-color: ${({ theme }) => theme.colors.accent};`;
const CameraHint = styled.Text`color: white; font-size: 14px; font-weight: 800; margin-top: 22px; text-align: center;`;
const CameraSubtext = styled.Text`color: rgba(255,255,255,.72); font-size: 12px; margin-top: 5px; text-align: center;`;
const Flash = styled.TouchableOpacity`width: 48px; height: 48px; border-radius: 24px; background-color: rgba(255,255,255,.16); align-items: center; justify-content: center; margin-top: 18px;`;
const Actions = styled.View`background-color: ${({ theme }) => theme.colors.surface}; padding: 14px 20px 106px;`;
const Primary = styled.TouchableOpacity`height: 56px; border-radius: 17px; background-color: ${({ theme }) => theme.colors.accent}; flex-direction: row; align-items: center; justify-content: center;`;
const PrimaryText = styled.Text`font-size: 15px; color: ${({ theme }) => theme.colors.primaryDark}; font-weight: 900; margin-left: 8px;`;
const Secondary = styled.TouchableOpacity`height: 52px; border-radius: 17px; border: 1px solid ${({ theme }) => theme.colors.primary}; flex-direction: row; align-items: center; justify-content: center; margin-top: 10px;`;
const SecondaryText = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.primary}; font-weight: 800; margin-left: 8px;`;

const getMaterialFromCode = (data) => {
  const match = data.match(/^obrasync:\/\/material\/([^?]+)/i);
  if (!match) return null;
  return inventoryLabels.find((item) => item.id === decodeURIComponent(match[1])) || null;
};

export function ScannerScreen() {
  const { goBack } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = async ({ data, type }) => {
    setScanned(true);
    const labelId = labelApi.getIdFromQr(data);
    if (labelId) {
      try {
        const { label } = await labelApi.getById(labelId);
        Alert.alert('Etiqueta localizada', `${label.name}\nCódigo: ${label.materialCode}\nLote: ${label.lot}\nLocal: ${label.location}`, [{ text: 'Concluir', onPress: () => setScanned(false) }]);
      } catch (error) {
        Alert.alert('Não foi possível consultar', error.message, [{ text: 'Tentar novamente', onPress: () => setScanned(false) }]);
      }
      return;
    }
    const item = getMaterialFromCode(data);
    if (item) {
      Alert.alert('Material identificado', `${item.name}\nCódigo: ${item.id}\nLote: ${item.lot}\nLocal: ${item.location}`, [{ text: 'Concluir', onPress: () => setScanned(false) }]);
      return;
    }
    Alert.alert('Código lido', `Tipo: ${type}\nConteúdo: ${data}`, [{ text: 'Escanear novamente', onPress: () => setScanned(false) }]);
  };

  const handlePrimaryAction = async () => {
    if (!permission?.granted) {
      await requestPermission();
      return;
    }
    setScanned(false);
  };

  const actionLabel = !permission?.granted ? 'Permitir uso da câmera' : scanned ? 'Escanear novamente' : 'Câmera pronta';

  return <Screen><Header><Back onPress={goBack}><Ionicons name="arrow-back" size={22} color="#5A1B73" /></Back><HeaderCopy><Title>Scanner</Title><Subtitle>Recebimento e estoque</Subtitle></HeaderCopy><Help onPress={() => Alert.alert('Como usar', 'Centralize a etiqueta ObraSync, QR Code ou código de barras dentro da moldura.')}><Ionicons name="help-circle-outline" size={24} color="#5A1B73" /></Help></Header>
    <CameraArea>{permission?.granted ? <><Camera facing="back" enableTorch={flashEnabled} barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_a', 'upc_e'] }} onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} /><CameraOverlay><ScanFrame><Corner style={{ top: -2, left: -2, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 22 }} /><Corner style={{ top: -2, right: -2, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 22 }} /><Corner style={{ bottom: -2, left: -2, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 22 }} /><Corner style={{ bottom: -2, right: -2, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 22 }} /><ScanLine /></ScanFrame><CameraHint>{scanned ? 'Código identificado' : 'Posicione o código dentro da área'}</CameraHint><CameraSubtext>QR Code e códigos de barras compatíveis</CameraSubtext><Flash onPress={() => setFlashEnabled((value) => !value)}><Ionicons name={flashEnabled ? 'flash' : 'flash-outline'} size={23} color={flashEnabled ? '#E0A526' : 'white'} /></Flash></CameraOverlay></> : <PermissionPanel><Ionicons name="camera-outline" size={62} color="#E0A526" /><PermissionTitle>A câmera é necessária</PermissionTitle><PermissionText>O ObraSync usa a câmera somente para identificar materiais, pedidos e movimentações do estoque.</PermissionText></PermissionPanel>}</CameraArea>
    <Actions><Primary onPress={handlePrimaryAction}><Ionicons name={permission?.granted ? 'scan' : 'camera'} size={22} color="#260D35" /><PrimaryText>{actionLabel}</PrimaryText></Primary><Secondary onPress={() => Alert.alert('Digitar código', 'A entrada manual aceita códigos internos como ACO-014 e códigos do fornecedor.')}><Ionicons name="keypad-outline" size={21} color="#5A1B73" /><SecondaryText>Digitar código manualmente</SecondaryText></Secondary></Actions>
  </Screen>;
}
