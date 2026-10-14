import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const Row = styled.TouchableOpacity`
  min-height: 62px;
  margin-top: 12px;
  padding: 0 15px;
  flex-direction: row;
  align-items: center;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
`;

const IconBox = styled.View`
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: 12px;
`;

const Label = styled.Text`
  flex: 1;
  margin-left: 12px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 700;
`;

export function ProfileMenuItem({ icon, iconColor, label, right, ...touchableProps }) {
  return (
    <Row {...touchableProps}>
      <IconBox>
        <Ionicons name={icon} size={21} color={iconColor} />
      </IconBox>
      <Label>{label}</Label>
      {right ?? <Ionicons name="chevron-forward" size={20} color="#756D7A" />}
    </Row>
  );
}
