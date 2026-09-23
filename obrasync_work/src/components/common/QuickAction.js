import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const Pressable = styled.TouchableOpacity`width: 48%; min-height: 112px; border-radius: 20px; padding: 16px; margin-bottom: 12px; background-color: ${({ background }) => background}; justify-content: space-between; border: 1px solid ${({ border }) => border};`;
const IconTile = styled.View`width: 40px; height: 40px; border-radius: 13px; background-color: ${({ color }) => color}; align-items: center; justify-content: center;`;
const Label = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 15px; line-height: 20px; font-weight: 800; max-width: 125px;`;
const Arrow = styled.View`position: absolute; right: 13px; bottom: 13px; width: 30px; height: 30px; border-radius: 15px; background-color: rgba(38,13,53,.06); align-items: center; justify-content: center;`;

export function QuickAction({ icon, label, color, background, onPress }) {
  return <Pressable background={background} border={`${color}28`} onPress={onPress}><IconTile color={color}><Ionicons name={icon} size={23} color="white" /></IconTile><Label>{label}</Label><Arrow><Ionicons name="arrow-forward" size={17} color="#5A1B73" /></Arrow></Pressable>;
}
