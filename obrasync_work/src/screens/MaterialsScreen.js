import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { SearchBar } from '../components/common/SearchBar';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { materials } from '../data/mockData';

const Header = styled.View`padding: 52px 20px 25px; background-color: ${({ theme }) => theme.colors.primary};`;
const Title = styled.Text`font-size: 28px; color: white; font-weight: 900; margin-bottom: 22px;`;
const ListHeader = styled.View`flex-direction: row; align-items: center; justify-content: space-between; margin: 24px 0 2px;`;
const Count = styled.Text`font-size: 17px; color: ${({ theme }) => theme.colors.text}; font-weight: 800;`;
const Caption = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;
const Card = styled.TouchableOpacity`background-color: white; border-radius: 18px; padding: 16px; margin-top: 12px; border: 1px solid ${({ theme }) => theme.colors.border}; flex-direction: row; align-items: center;`;
const MaterialIcon = styled.View`width: 48px; height: 48px; border-radius: 15px; background-color: ${({ bg }) => bg}; align-items: center; justify-content: center;`;
const Copy = styled.View`flex: 1; margin-left: 13px;`;
const Code = styled.Text`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 700;`;
const Name = styled.Text`font-size: 15px; color: ${({ theme }) => theme.colors.text}; font-weight: 800; margin-top: 2px;`;
const Meta = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 5px;`;
const Variation = styled.Text`font-size: 13px; color: ${({ color }) => color}; font-weight: 900;`;

export function MaterialsScreen() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => materials.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <Screen><Scroll><Header><Title>Materiais</Title><SearchBar value={query} onChangeText={setQuery} placeholder="Código ou descrição" /></Header><Content><ListHeader><Count>{filtered.length} insumos</Count><Caption>Consulta de insumos</Caption></ListHeader>{filtered.map((item, index) => { const danger = item.variation > 5; const color = danger ? '#B5473E' : item.variation > 0 ? '#E0A526' : '#2F9E7A'; const backgrounds = ['#FFF4D6', '#EDE6F1', '#E5F5EF', '#F3EAF6']; return <Card key={item.id}><MaterialIcon bg={danger ? '#FBE9E7' : backgrounds[index % backgrounds.length]}><Ionicons name="cube-outline" size={24} color={color} /></MaterialIcon><Copy><Code>{item.code}</Code><Name>{item.name}</Name><Meta>{item.purchased} de {item.planned} {item.unit}</Meta></Copy><Variation color={color}>{item.variation > 0 ? '+' : ''}{item.variation}%</Variation></Card>; })}</Content></Scroll></Screen>;
}
