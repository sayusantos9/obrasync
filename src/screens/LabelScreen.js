import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { inventoryLabels } from '../data/mockData';
import { labelApi } from '../services/labelApi';
import { printMaterialLabel, shareMaterialLabel } from '../services/labelService';

const Intro = styled.Text`font-size: 14px; line-height: 21px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 18px;`;
const Selector = styled.ScrollView.attrs({ horizontal: true, showsHorizontalScrollIndicator: false })`margin: 16px -20px 0; padding-left: 20px;`;
const Chip = styled.TouchableOpacity`height: 40px; padding: 0 15px; border-radius: 20px; align-items: center; justify-content: center; margin-right: 8px; background-color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface}; border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};`;
const ChipText = styled.Text`font-size: 12px; font-weight: 800; color: ${({ active, theme }) => active ? 'white' : theme.colors.textMuted};`;
const LabelCard = styled.View`background-color: white; border-radius: 24px; border: 1px solid ${({ theme }) => theme.colors.border}; margin-top: 18px; padding: 20px; align-items: center;`;
const BrandRow = styled.View`align-self: stretch; flex-direction: row; align-items: center; justify-content: space-between;`;
const Brand = styled.Text`font-size: 20px; color: ${({ theme }) => theme.colors.primaryDark}; font-weight: 900;`;
const BrandAccent = styled.Text`color: ${({ theme }) => theme.colors.primary};`;
const Status = styled.View`padding: 6px 9px; border-radius: 14px; background-color: ${({ theme }) => theme.colors.successSoft};`;
const StatusText = styled.Text`font-size: 10px; color: ${({ theme }) => theme.colors.success}; font-weight: 900;`;
const QrShell = styled.View`padding: 15px; border-radius: 18px; background-color: white; border: 1px solid ${({ theme }) => theme.colors.primarySoft}; margin: 18px 0 12px;`;
const QrImage = styled.Image`width: 188px; height: 188px;`;
const QrPlaceholder = styled.View`width: 188px; height: 188px; border-radius: 16px; background-color: ${({ theme }) => theme.colors.primarySoft}; align-items: center; justify-content: center; padding: 20px;`;
const PlaceholderText = styled.Text`font-size: 12px; line-height: 17px; color: ${({ theme }) => theme.colors.primary}; font-weight: 800; text-align: center; margin-top: 10px;`;
const MaterialName = styled.Text`font-size: 19px; color: ${({ theme }) => theme.colors.text}; font-weight: 900; text-align: center;`;
const MaterialCode = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.primary}; font-weight: 800; margin-top: 4px;`;
const Divider = styled.View`height: 1px; align-self: stretch; background-color: ${({ theme }) => theme.colors.border}; margin: 17px 0;`;
const InfoRow = styled.View`align-self: stretch; flex-direction: row; justify-content: space-between; margin-bottom: 9px;`;
const InfoLabel = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;
const InfoValue = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.text}; font-weight: 800; max-width: 62%; text-align: right;`;
const Hint = styled.View`flex-direction: row; align-items: center; background-color: ${({ theme }) => theme.colors.accentSoft}; border-radius: 14px; padding: 11px; margin-top: 14px;`;
const HintText = styled.Text`flex: 1; margin-left: 8px; font-size: 11px; line-height: 16px; color: #71540D;`;
const GenerateButton = styled.TouchableOpacity`height: 56px; border-radius: 17px; background-color: ${({ theme }) => theme.colors.primary}; flex-direction: row; align-items: center; justify-content: center; margin-top: 16px; opacity: ${({ disabled }) => disabled ? .6 : 1};`;
const GenerateText = styled.Text`font-size: 15px; color: white; font-weight: 900; margin-left: 8px;`;
const ButtonRow = styled.View`flex-direction: row; justify-content: space-between; margin: 16px 0 24px;`;
const Button = styled.TouchableOpacity`width: 48.5%; height: 54px; border-radius: 17px; flex-direction: row; align-items: center; justify-content: center; background-color: ${({ secondary, theme }) => secondary ? theme.colors.surface : theme.colors.accent}; border: 1px solid ${({ secondary, theme }) => secondary ? theme.colors.primary : theme.colors.accent}; opacity: ${({ disabled }) => disabled ? .55 : 1};`;
const ButtonText = styled.Text`font-size: 13px; font-weight: 900; margin-left: 7px; color: ${({ secondary, theme }) => secondary ? theme.colors.primary : theme.colors.primaryDark};`;

export function LabelScreen() {
  const [selectedId, setSelectedId] = useState(inventoryLabels[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generated, setGenerated] = useState(null);
  const item = useMemo(() => inventoryLabels.find((entry) => entry.id === selectedId) || inventoryLabels[0], [selectedId]);

  const selectItem = (id) => {
    setSelectedId(id);
    setGenerated(null);
  };

  const generateLabel = async () => {
    setIsProcessing(true);
    try {
      setGenerated(await labelApi.create(item));
    } catch (error) {
      Alert.alert('Não foi possível gerar', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getQrBase64 = () => {
    if (!generated?.qr?.dataUrl) throw new Error('Gere a etiqueta pelo servidor antes de continuar.');
    return generated.qr.dataUrl.replace(/^data:image\/png;base64,/, '');
  };

  const printLabel = async () => {
    setIsProcessing(true);
    try {
      const qrBase64 = getQrBase64();
      await printMaterialLabel({ ...item, labelId: generated.label.id }, qrBase64);
    } catch (error) {
      Alert.alert('Não foi possível imprimir', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const shareLabel = async () => {
    setIsProcessing(true);
    try {
      const qrBase64 = getQrBase64();
      const shared = await shareMaterialLabel({ ...item, labelId: generated.label.id }, qrBase64);
      if (!shared) Alert.alert('Compartilhamento indisponível', 'Salve ou imprima a etiqueta neste dispositivo.');
    } catch (error) {
      Alert.alert('Não foi possível compartilhar', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return <Screen><ScreenHeader title="Gerar etiqueta" /><Scroll><Content><Intro>Selecione o material. O servidor criará um registro único e devolverá o QR Code da etiqueta.</Intro><Selector>{inventoryLabels.map((entry) => <Chip key={entry.id} active={entry.id === selectedId} onPress={() => selectItem(entry.id)}><ChipText active={entry.id === selectedId}>{entry.id}</ChipText></Chip>)}</Selector>
    <LabelCard><BrandRow><Brand>Obra<BrandAccent>Sync</BrandAccent></Brand><Status><StatusText>{generated ? 'GERADA NO SERVIDOR' : 'AGUARDANDO'}</StatusText></Status></BrandRow><QrShell>{generated ? <QrImage source={{ uri: generated.qr.dataUrl }} /> : <QrPlaceholder><Ionicons name="qr-code-outline" size={62} color="#5A1B73" /><PlaceholderText>Toque em “Gerar QR Code” para criar a etiqueta</PlaceholderText></QrPlaceholder>}</QrShell><MaterialName>{item.name}</MaterialName><MaterialCode>{item.id}</MaterialCode><Divider /><InfoRow><InfoLabel>Registro da etiqueta</InfoLabel><InfoValue>{generated?.label.id || 'Será criado pelo servidor'}</InfoValue></InfoRow><InfoRow><InfoLabel>Lote</InfoLabel><InfoValue>{item.lot}</InfoValue></InfoRow><InfoRow><InfoLabel>Unidade</InfoLabel><InfoValue>{item.unit}</InfoValue></InfoRow><InfoRow><InfoLabel>Local do estoque</InfoLabel><InfoValue>{item.location}</InfoValue></InfoRow><InfoRow><InfoLabel>Recebido em</InfoLabel><InfoValue>{item.receivedAt}</InfoValue></InfoRow></LabelCard>
    <Hint><Ionicons name="information-circle" size={21} color="#9B6B08" /><HintText>O QR Code aponta para o registro salvo no backend. Depois de impresso, o scanner consulta os dados pelo identificador único.</HintText></Hint><GenerateButton disabled={isProcessing} onPress={generateLabel}><Ionicons name="server-outline" size={21} color="white" /><GenerateText>{isProcessing ? 'Gerando no servidor...' : 'Gerar QR Code'}</GenerateText></GenerateButton><ButtonRow><Button disabled={isProcessing || !generated} onPress={printLabel}><Ionicons name="print" size={20} color="#260D35" /><ButtonText>{isProcessing ? 'Aguarde...' : 'Imprimir'}</ButtonText></Button><Button secondary disabled={isProcessing || !generated} onPress={shareLabel}><Ionicons name="share-outline" size={20} color="#5A1B73" /><ButtonText secondary>Compartilhar PDF</ButtonText></Button></ButtonRow>
  </Content></Scroll></Screen>;
}
