import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { inventoryLabels } from '../data/mockData';
import { labelApi } from '../services/labelApi';
import { printMaterialLabel, shareMaterialLabel } from '../services/labelService';
import { labelStyles as S } from './LabelScreen.styles';

export function LabelScreen() {
  const { selectedProject } = useApp();
  const [selectedMaterialId, setSelectedMaterialId] = useState(inventoryLabels[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedLabel, setGeneratedLabel] = useState(null);
  const selectedMaterial = inventoryLabels.find(
    (entry) => entry.id === selectedMaterialId,
  ) ?? inventoryLabels[0];

  function handleSelectMaterial(materialId) {
    setSelectedMaterialId(materialId);
    setGeneratedLabel(null);
  }

  async function handleGenerateLabel() {
    setIsProcessing(true);

    try {
      const result = await labelApi.create(selectedMaterial, selectedProject.name);
      setGeneratedLabel(result);
    } catch (error) {
      Alert.alert('Não foi possível gerar', error.message);
    } finally {
      setIsProcessing(false);
    }
  }

  function getGeneratedQrBase64() {
    const qrDataUrl = generatedLabel?.qr?.dataUrl;

    if (!qrDataUrl) {
      throw new Error('Gere a etiqueta pelo servidor antes de continuar.');
    }

    return qrDataUrl.replace(/^data:image\/png;base64,/, '');
  }

  function getPrintableLabelData() {
    return {
      ...selectedMaterial,
      projectName: selectedProject.name,
      labelId: generatedLabel.label.id,
    };
  }

  async function handlePrintLabel() {
    setIsProcessing(true);

    try {
      await printMaterialLabel(
        getPrintableLabelData(),
        getGeneratedQrBase64(),
      );
    } catch (error) {
      Alert.alert('Não foi possível imprimir', error.message);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleShareLabel() {
    setIsProcessing(true);

    try {
      const wasShared = await shareMaterialLabel(
        getPrintableLabelData(),
        getGeneratedQrBase64(),
      );

      if (!wasShared) {
        Alert.alert(
          'Compartilhamento indisponível',
          'Salve ou imprima a etiqueta neste dispositivo.',
        );
      }
    } catch (error) {
      Alert.alert('Não foi possível compartilhar', error.message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Gerar etiqueta" />
      <Scroll>
        <Content>
          <S.Intro>
            Selecione o material. O servidor criará um registro único e devolverá
            o QR Code da etiqueta.
          </S.Intro>

          <S.Selector>
            {inventoryLabels.map((entry) => {
              const isSelected = entry.id === selectedMaterialId;

              return (
                <S.Chip
                  key={entry.id}
                  $isActive={isSelected}
                  onPress={() => handleSelectMaterial(entry.id)}
                >
                  <S.ChipText $isActive={isSelected}>{entry.id}</S.ChipText>
                </S.Chip>
              );
            })}
          </S.Selector>

          <S.LabelCard>
            <S.BrandRow>
              <S.Brand>
                Obra<S.BrandAccent>Sync</S.BrandAccent>
              </S.Brand>
              <S.Status>
                <S.StatusText>
                  {generatedLabel ? 'GERADA NO SERVIDOR' : 'AGUARDANDO'}
                </S.StatusText>
              </S.Status>
            </S.BrandRow>

            <S.QrShell>
              {generatedLabel ? (
                <S.QrImage source={{ uri: generatedLabel.qr.dataUrl }} />
              ) : (
                <S.QrPlaceholder>
                  <Ionicons name="qr-code-outline" size={62} color="#5A1B73" />
                  <S.PlaceholderText>
                    Toque em “Gerar QR Code” para criar a etiqueta
                  </S.PlaceholderText>
                </S.QrPlaceholder>
              )}
            </S.QrShell>

            <S.MaterialName>{selectedMaterial.name}</S.MaterialName>
            <S.MaterialCode>{selectedMaterial.id}</S.MaterialCode>
            <S.Divider />

            <S.InfoRow>
              <S.InfoLabel>Registro da etiqueta</S.InfoLabel>
              <S.InfoValue>
                {generatedLabel?.label.id || 'Será criado pelo servidor'}
              </S.InfoValue>
            </S.InfoRow>
            <S.InfoRow>
              <S.InfoLabel>Lote</S.InfoLabel>
              <S.InfoValue>{selectedMaterial.lot}</S.InfoValue>
            </S.InfoRow>
            <S.InfoRow>
              <S.InfoLabel>Unidade</S.InfoLabel>
              <S.InfoValue>{selectedMaterial.unit}</S.InfoValue>
            </S.InfoRow>
            <S.InfoRow>
              <S.InfoLabel>Local do estoque</S.InfoLabel>
              <S.InfoValue>{selectedMaterial.location}</S.InfoValue>
            </S.InfoRow>
            <S.InfoRow>
              <S.InfoLabel>Recebido em</S.InfoLabel>
              <S.InfoValue>{selectedMaterial.receivedAt}</S.InfoValue>
            </S.InfoRow>
          </S.LabelCard>

          <S.Hint>
            <Ionicons name="information-circle" size={21} color="#9B6B08" />
            <S.HintText>
              O QR Code aponta para o registro salvo no backend. Depois de impresso,
              o scanner consulta os dados pelo identificador único.
            </S.HintText>
          </S.Hint>

          <S.GenerateButton disabled={isProcessing} onPress={handleGenerateLabel}>
            <Ionicons name="server-outline" size={21} color="white" />
            <S.GenerateText>
              {isProcessing ? 'Gerando no servidor...' : 'Gerar QR Code'}
            </S.GenerateText>
          </S.GenerateButton>

          <S.ButtonRow>
            <S.Button
              disabled={isProcessing || !generatedLabel}
              onPress={handlePrintLabel}
            >
              <Ionicons name="print" size={20} color="#260D35" />
              <S.ButtonText>
                {isProcessing ? 'Aguarde...' : 'Imprimir'}
              </S.ButtonText>
            </S.Button>

            <S.Button
              $secondary
              disabled={isProcessing || !generatedLabel}
              onPress={handleShareLabel}
            >
              <Ionicons name="share-outline" size={20} color="#5A1B73" />
              <S.ButtonText $secondary>Compartilhar PDF</S.ButtonText>
            </S.Button>
          </S.ButtonRow>
        </Content>
      </Scroll>
    </Screen>
  );
}
