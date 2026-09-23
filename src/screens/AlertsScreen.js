import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { alerts } from '../data/mockData';

const Header = styled.View`padding: 52px 20px 24px; background-color: ${({ theme }) => theme.colors.primary}; flex-direction: row; align-items: center; justify-content: space-between;`;
const Title = styled.Text`font-size: 28px; color: white; font-weight: 900;`;
const Mark = styled.TouchableOpacity`padding: 10px;`;
const FilterRow = styled.ScrollView.attrs({ horizontal: true, showsHorizontalScrollIndicator: false })`margin: 20px -20px 6px; padding-left: 20px;`;
const Chip = styled.TouchableOpacity`height: 38px; padding: 0 16px; border-radius: 20px; align-items: center; justify-content: center; margin-right: 8px; background-color: ${({ active, theme }) => active ? theme.colors.primary : 'white'}; border: 1px solid ${({ theme }) => theme.colors.border};`;
const ChipText = styled.Text`font-size: 13px; font-weight: 800; color: ${({ active, theme }) => active ? 'white' : theme.colors.textMuted};`;
const Card = styled.TouchableOpacity`background-color: white; border-radius: 18px; padding: 16px; margin-top: 12px; border: 1px solid ${({ theme }) => theme.colors.border}; flex-direction: row; align-items: center;`;
const Icon = styled.View`width: 46px; height: 46px; border-radius: 15px; align-items: center; justify-content: center; background-color: ${({ bg }) => bg};`;
const Copy = styled.View`flex: 1; margin-left: 12px;`;
const AlertTitle = styled.Text`font-size: 15px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const Description = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 4px; line-height: 17px;`;
const Time = styled.Text`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted};`;

export function AlertsScreen() {
  const palette = { danger: ['#FBE9E7', '#B5473E'], warning: ['#FFF4D6', '#B8810D'], info: ['#EDE6F1', '#5A1B73'] };
  return <Screen><Scroll><Header><Title>Alertas</Title><Mark><Ionicons name="checkmark-done" size={25} color="white" /></Mark></Header><Content><FilterRow>{['Todos', 'Custos', 'Prazos', 'Aprovações'].map((label, index) => <Chip key={label} active={index === 0}><ChipText active={index === 0}>{label}</ChipText></Chip>)}</FilterRow>{alerts.map((item) => { const [bg, color] = palette[item.type]; return <Card key={item.id}><Icon bg={bg}><Ionicons name={item.icon} size={23} color={color} /></Icon><Copy><AlertTitle>{item.title}</AlertTitle><Description>{item.description}</Description></Copy><Time>{item.time}</Time></Card>; })}</Content></Scroll></Screen>;
}
