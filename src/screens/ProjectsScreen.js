import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { SearchBar } from '../components/common/SearchBar';
import { Content, Screen, Scroll, SectionTitle } from '../components/ui/primitives';
import { projects } from '../data/mockData';

const Header = styled.View`padding: 52px 20px 25px; background-color: ${({ theme }) => theme.colors.primary};`;
const Title = styled.Text`font-size: 28px; color: white; font-weight: 900; margin-bottom: 22px;`;
const Card = styled.TouchableOpacity`background-color: white; border-radius: 20px; padding: 18px; margin-top: 14px; border: 1px solid ${({ theme }) => theme.colors.border};`;
const CardTop = styled.View`flex-direction: row; justify-content: space-between; align-items: flex-start;`;
const Icon = styled.View`width: 48px; height: 48px; border-radius: 15px; background-color: ${({ background, theme }) => background || theme.colors.primarySoft}; align-items: center; justify-content: center;`;
const Copy = styled.View`flex: 1; margin-left: 13px;`;
const Name = styled.Text`font-size: 16px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const Meta = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 4px;`;
const Track = styled.View`height: 7px; background-color: #E7ECF4; border-radius: 5px; margin-top: 18px; overflow: hidden;`;
const Fill = styled.View`height: 100%; width: ${({ progress }) => progress}%; background-color: ${({ theme }) => theme.colors.accent};`;
const Footer = styled.View`flex-direction: row; justify-content: space-between; margin-top: 9px;`;
const Small = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;

export function ProjectsScreen() {
  const colors = [['#5A1B73', '#EDE6F1'], ['#E0A526', '#FFF4D6'], ['#2F9E7A', '#E5F5EF']];
  return <Screen><Scroll><Header><Title>Minhas obras</Title><SearchBar placeholder="Buscar obra ou endereço" /></Header><Content><SectionTitle style={{ marginTop: 24 }}>{projects.length} obras vinculadas</SectionTitle>{projects.map((project, index) => { const [color, background] = colors[index % colors.length]; return <Card key={project.id}><CardTop><Icon background={background}><Ionicons name="business" size={25} color={color} /></Icon><Copy><Name>{project.name}</Name><Meta>{project.city}</Meta></Copy><Ionicons name="chevron-forward" size={21} color="#756D7A" /></CardTop><Track><Fill progress={project.progress} /></Track><Footer><Small>{project.status}</Small><Small>{project.progress}% concluída</Small></Footer></Card>; })}</Content></Scroll></Screen>;
}
