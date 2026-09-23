import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';
import { SCREENS } from '../../navigation/routes';

const Wrapper = styled(LinearGradient).attrs({ colors: ['#260D35', '#5A1B73'] })`padding: 14px 20px 24px;`;
const Top = styled.View`flex-direction: row; align-items: center; justify-content: space-between;`;
const Brand = styled.Text`font-size: 27px; color: white; font-weight: 900;`;
const Accent = styled.Text`color: ${({ theme }) => theme.colors.accent};`;
const Action = styled.TouchableOpacity`width: 44px; height: 44px; border-radius: 22px; background-color: rgba(255,255,255,.16); align-items: center; justify-content: center;`;
const Badge = styled.View`position: absolute; right: -2px; top: -2px; min-width: 20px; height: 20px; border-radius: 10px; padding: 0 5px; background-color: ${({ theme }) => theme.colors.danger}; align-items: center; justify-content: center;`;
const BadgeText = styled.Text`color: white; font-size: 11px; font-weight: 800;`;
const Hello = styled.Text`color: white; font-size: 26px; font-weight: 900; margin-top: 20px;`;
const Subtitle = styled.Text`color: rgba(255,255,255,.78); font-size: 14px; margin-top: 3px;`;
const Project = styled.TouchableOpacity`margin-top: 16px; height: 48px; border-radius: 15px; padding: 0 14px; background-color: rgba(255,255,255,.16); flex-direction: row; align-items: center;`;
const ProjectText = styled.Text`color: white; font-size: 15px; font-weight: 800; flex: 1; margin-left: 10px;`;

export function AppHeader() {
  const { openScreen } = useApp();
  return <Wrapper><Top><Brand>Obra<Accent>Sync</Accent></Brand><Action onPress={() => openScreen(SCREENS.ALERTS)}><Ionicons name="notifications-outline" size={25} color="white" /><Badge><BadgeText>3</BadgeText></Badge></Action></Top><Hello>Olá, Emelly</Hello><Subtitle>Vamos construir grandes resultados hoje!</Subtitle><Project onPress={() => openScreen(SCREENS.PROJECTS)}><Ionicons name="business-outline" size={21} color="white" /><ProjectText>Residencial Aurora</ProjectText><Ionicons name="chevron-down" size={20} color="white" /></Project></Wrapper>;
}
