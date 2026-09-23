import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const Pressable = styled.TouchableOpacity`
  width: 48%;
  min-height: 112px;
  margin-bottom: 12px;
  padding: 16px;
  justify-content: space-between;
  background-color: ${({ $background }) => $background};
  border: 1px solid ${({ $borderColor }) => $borderColor};
  border-radius: 20px;
`;

const IconTile = styled.View`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $color }) => $color};
  border-radius: 13px;
`;

const Label = styled.Text`
  max-width: 125px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px;
  font-weight: 800;
  line-height: 20px;
`;

const Arrow = styled.View`
  position: absolute;
  right: 13px;
  bottom: 13px;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  background-color: rgba(38, 13, 53, 0.06);
  border-radius: 15px;
`;

export function QuickAction({ icon, label, color, background, onPress }) {
  return (
    <Pressable
      $background={background}
      $borderColor={`${color}28`}
      onPress={onPress}
    >
      <IconTile $color={color}>
        <Ionicons name={icon} size={23} color="white" />
      </IconTile>
      <Label>{label}</Label>
      <Arrow>
        <Ionicons name="arrow-forward" size={17} color="#5A1B73" />
      </Arrow>
    </Pressable>
  );
}
