import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const Card = styled.TouchableOpacity`
  margin: 18px 0 4px;
  padding: 15px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: 18px;
`;

const IconBox = styled.View`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isOffline }) => ($isOffline ? '#FBE9E7' : '#FFFFFF')};
  border-radius: 14px;
`;

const Copy = styled.View`
  flex: 1;
  margin-left: 11px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 800;
`;

const Description = styled.Text`
  margin-top: 2px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

function getSyncTitle(isOffline, isSyncing) {
  if (isOffline) return 'Modo offline';
  if (isSyncing) return 'Sincronizando...';
  return 'Sincronizado';
}

function getSyncDescription(pendingCount) {
  return pendingCount
    ? `${pendingCount} registro(s) pendente(s)`
    : 'Dados atualizados recentemente';
}

export function SyncStatusCard({
  isOffline,
  isSyncing,
  pendingCount,
  onPress,
}) {
  const iconName = isOffline ? 'cloud-offline' : 'cloud-done';
  const iconColor = isOffline ? '#B5473E' : '#5A1B73';

  return (
    <Card onPress={onPress}>
      <IconBox $isOffline={isOffline}>
        <Ionicons name={iconName} size={25} color={iconColor} />
      </IconBox>
      <Copy>
        <Title>{getSyncTitle(isOffline, isSyncing)}</Title>
        <Description>{getSyncDescription(pendingCount)}</Description>
      </Copy>
      <Ionicons name="chevron-forward" size={20} color="#5A1B73" />
    </Card>
  );
}
