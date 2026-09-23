import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { FEATURE_ROWS, FEATURE_SCREEN_CONFIG } from '../data/featureData';
import { SCREENS } from '../navigation/routes';
import {
  ActionButton,
  ActionRow,
  ActionText,
  Big,
  Card,
  Eyebrow,
  Flex,
  Icon,
  Muted,
  PrimaryButton,
  PrimaryButtonText,
  Row,
  Section,
  Summary,
  Title,
  Value,
} from './FeatureScreen.styles';

function ReceiptCards({ onGenerateLabel, onScan }) {
  return (
    <>
      <Card onPress={onScan}>
        <Row>
          <Icon>
            <Ionicons name="qr-code" size={23} color="#5A1B73" />
          </Icon>
          <Flex>
            <Title>Escanear material ou pedido</Title>
            <Muted>Leia o QR Code ou código de barras no recebimento.</Muted>
          </Flex>
          <Ionicons name="scan" size={22} color="#E0A526" />
        </Row>
      </Card>

      <Card>
        <Title>Resumo esperado</Title>
        <Muted>120 sacos • R$ 38,50 por unidade</Muted>
        <Muted>Local: Galpão A • Setor 03</Muted>
      </Card>

      <ActionRow>
        <FeatureAction
          icon="qr-code-outline"
          label="Gerar etiqueta"
          color="#9B6B08"
          backgroundColor="#FFF4D6"
          borderColor="#EFD58C"
          onPress={onGenerateLabel}
        />
        <FeatureAction
          icon="scan-outline"
          label="Escanear etiqueta"
          color="#2F9E7A"
          backgroundColor="#E5F5EF"
          borderColor="#BDE3D5"
          onPress={onScan}
        />
      </ActionRow>

      <PrimaryButton
        onPress={() => Alert.alert(
          'Recebimento salvo',
          'O registro foi adicionado à demonstração.',
        )}
      >
        <PrimaryButtonText>Registrar recebimento</PrimaryButtonText>
      </PrimaryButton>
    </>
  );
}

function FeatureAction({
  backgroundColor,
  borderColor,
  color,
  icon,
  label,
  onPress,
}) {
  return (
    <ActionButton
      $backgroundColor={backgroundColor}
      $borderColor={borderColor}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color={color} />
      <ActionText>{label}</ActionText>
    </ActionButton>
  );
}

function GenericCards({ type }) {
  const rows = FEATURE_ROWS[type] ?? [];

  return rows.map((item) => (
    <Card key={item.title}>
      <Row>
        <Icon $backgroundColor={`${item.color}18`}>
          <Ionicons name="cube" size={22} color={item.color} />
        </Icon>
        <Flex>
          <Title>{item.title}</Title>
          <Muted>{item.subtitle}</Muted>
        </Flex>
        <Value $color={item.color}>{item.value}</Value>
      </Row>
    </Card>
  ));
}

export function FeatureScreen({ type }) {
  const { openScreen, selectedProject } = useApp();
  const baseView = FEATURE_SCREEN_CONFIG[type] ?? FEATURE_SCREEN_CONFIG.stock;
  const screenView = type === 'stock'
    ? { ...baseView, eyebrow: selectedProject.name.toUpperCase() }
    : baseView;

  function openScanner() {
    openScreen(SCREENS.SCANNER);
  }

  function renderFeatureContent() {
    if (type === 'receipt') {
      return (
        <ReceiptCards
          onGenerateLabel={() => openScreen(SCREENS.LABEL)}
          onScan={openScanner}
        />
      );
    }

    return <GenericCards type={type} />;
  }

  return (
    <Screen>
      <ScreenHeader title={screenView.title} />
      <Scroll>
        <Content>
          <Summary>
            <Eyebrow>{screenView.eyebrow}</Eyebrow>
            <Big>{screenView.big}</Big>
          </Summary>
          <Section>{screenView.section}</Section>

          {renderFeatureContent()}

          {type === 'stock' && (
            <ActionRow>
              <FeatureAction
                icon="qr-code-outline"
                label="Gerar etiqueta"
                color="#9B6B08"
                backgroundColor="#FFF4D6"
                borderColor="#EFD58C"
                onPress={() => openScreen(SCREENS.LABEL)}
              />
              <FeatureAction
                icon="scan-outline"
                label="Movimentar por QR"
                color="#2F9E7A"
                backgroundColor="#E5F5EF"
                borderColor="#BDE3D5"
                onPress={openScanner}
              />
            </ActionRow>
          )}

          {type === 'approvals' && (
            <PrimaryButton
              onPress={() => Alert.alert(
                'Compra aprovada',
                'A decisão foi registrada na trilha de auditoria.',
              )}
            >
              <PrimaryButtonText>Aprovar selecionada</PrimaryButtonText>
            </PrimaryButton>
          )}
        </Content>
      </Scroll>
    </Screen>
  );
}
