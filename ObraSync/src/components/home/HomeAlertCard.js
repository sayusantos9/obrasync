import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const Card = styled.TouchableOpacity`
  margin-bottom: 10px;
  padding: 14px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border: 1px solid ${({ $borderColor }) => $borderColor};
  border-radius: 16px;
`;

const IconBox = styled.View`
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $color }) => $color};
  border-radius: 14px;
`;

const Copy = styled.View`
  flex: 1;
  margin-left: 12px;
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

export function HomeAlertCard({ alert, onPress }) {
  return (
    <Card
      $backgroundColor={alert.backgroundColor}
      $borderColor={alert.borderColor}
      onPress={onPress}
    >
      <IconBox $color={alert.color}>
        <Ionicons name={alert.icon} size={22} color="white" />
      </IconBox>
      <Copy>
        <Title>{alert.title}</Title>
        <Description>{alert.description}</Description>
      </Copy>
      <Ionicons name="chevron-forward" size={20} color="#756D7A" />
    </Card>
  );
}
