import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { SearchBar } from '../components/common/SearchBar';
import { Content, Screen, Scroll, SectionTitle } from '../components/ui/primitives';
import { projects } from '../data/mockData';
import { useApp } from '../contexts/AppContext';

const Header = styled.View`padding: 52px 20px 25px; background-color: ${({ theme }) => theme.colors.primary};`;
const Title = styled.Text`font-size: 28px; color: white; font-weight: 900; margin-bottom: 6px;`;
const Subtitle = styled.Text`font-size: 13px; color: rgba(255,255,255,.76); margin-bottom: 22px;`;
const Card = styled.TouchableOpacity`background-color: white; border-radius: 20px; padding: 18px; margin-top: 14px; border: ${({ active, theme }) => active ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`};`;
const CardTop = styled.View`flex-direction: row; justify-content: space-between; align-items: flex-start;`;
const Icon = styled.View`width: 48px; height: 48px; border-radius: 15px; background-color: ${({ background, theme }) => background || theme.colors.primarySoft}; align-items: center; justify-content: center;`;
const Copy = styled.View`flex: 1; margin-left: 13px;`;
const Name = styled.Text`font-size: 16px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const Meta = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 4px;`;
const Active = styled.View`padding: 5px 8px; border-radius: 999px; background-color: ${({ theme }) => theme.colors.successSoft}; flex-direction: row; align-items: center;`;
const ActiveText = styled.Text`font-size: 10px; font-weight: 900; color: ${({ theme }) => theme.colors.success}; margin-left: 4px;`;
const Track = styled.View`height: 7px; background-color: #E7ECF4; border-radius: 5px; margin-top: 18px; overflow: hidden;`;
const Fill = styled.View`height: 100%; width: ${({ progress }) => progress}%; background-color: ${({ theme }) => theme.colors.accent};`;
const Footer = styled.View`flex-direction: row; justify-content: space-between; margin-top: 9px;`;
const Small = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;
const NewButton = styled.TouchableOpacity`height: 54px; border-radius: 16px; margin: 20px 0 6px; align-items: center; justify-content: center; flex-direction: row; border: 1px dashed ${({ theme }) => theme.colors.primary}; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const NewText = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.primary}; font-weight: 900; margin-left: 7px;`;
const Empty = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.textMuted}; text-align: center; margin-top: 30px;`;

export function ProjectsScreen() {
  const [query, setQuery] = useState('');
  const { selectedProject, selectProject } = useApp();
  const colors = [['#5A1B73', '#EDE6F1'], ['#E0A526', '#FFF4D6'], ['#2F9E7A', '#E5F5EF']];
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((project) => [project.name, project.client, project.city, project.address].some((value) => value?.toLowerCase().includes(term)));
  }, [query]);

  return <Screen><Scroll><Header><Title>Selecionar obra</Title><Subtitle>Escolha onde você vai trabalhar agora.</Subtitle><SearchBar value={query} onChangeText={setQuery} placeholder="Nome, cliente ou endereço" /></Header><Content><SectionTitle style={{ marginTop: 24 }}>{filtered.length} obra(s) disponível(is)</SectionTitle>{filtered.map((project, index) => { const [color, background] = colors[index % colors.length]; const active = selectedProject.id === project.id; return <Card active={active} key={project.id} onPress={() => selectProject(project)}><CardTop><Icon background={background}><Ionicons name="business" size={25} color={color} /></Icon><Copy><Name>{project.name}</Name><Meta>{project.city} • {project.client}</Meta></Copy>{active ? <Active><Ionicons name="checkmark-circle" size={15} color="#2F9E7A" /><ActiveText>ATIVA</ActiveText></Active> : <Ionicons name="chevron-forward" size={21} color="#756D7A" />}</CardTop><Track><Fill progress={project.progress} /></Track><Footer><Small>{project.status}</Small><Small>{project.progress}% concluída</Small></Footer></Card>; })}{!filtered.length && <Empty>Nenhuma obra encontrada.</Empty>}<NewButton onPress={() => Alert.alert('Cadastro de obra', 'Este atalho é destinado a usuários autorizados com perfil gestor/master.')}><Ionicons name="add-circle-outline" size={22} color="#5A1B73" /><NewText>Cadastrar nova obra</NewText></NewButton></Content></Scroll></Screen>;
}
