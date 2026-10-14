import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';
import { ROLE_LABELS } from '../../data/authData';
import { SCREENS, TABS } from '../../navigation/routes';

const Wrapper = styled.View`
  padding: 18px 20px 22px;
  background-color: ${({ theme }) => theme.colors.primary};
`;
const Top = styled.View`flex-direction: row; align-items: center; justify-content: space-between;`;
const Brand = styled.Text`color: white; font-size: ${({ theme }) => 27 * theme.fontScale}px; font-weight: 900;`;
const Accent = styled.Text`color: ${({ theme }) => theme.colors.accent};`;
const Actions = styled.View`flex-direction: row; gap: 8px;`;
const Action = styled.TouchableOpacity`width: 42px; height: 42px; align-items: center; justify-content: center; background-color: rgba(255,255,255,.12); border-radius: 21px;`;
const Badge = styled.View`position:absolute; top:-2px; right:-2px; min-width:18px; height:18px; padding:0 5px; align-items:center; justify-content:center; background-color:${({theme})=>theme.colors.danger}; border-radius:9px;`;
const BadgeText = styled.Text`color:white; font-size:10px; font-weight:900;`;
const Greeting = styled.Text`margin-top:22px; color:white; font-size:${({theme})=>25*theme.fontScale}px; font-weight:900;`;
const Subtitle = styled.Text`margin-top:3px; color:rgba(255,255,255,.75); font-size:${({theme})=>12*theme.fontScale}px;`;
const ProjectButton = styled.TouchableOpacity`min-height:46px; margin-top:16px; padding:0 14px; flex-direction:row; align-items:center; background-color:rgba(255,255,255,.14); border-radius:14px;`;
const ProjectName = styled.Text`flex:1; margin-left:9px; color:white; font-size:${({theme})=>14*theme.fontScale}px; font-weight:800;`;

export function AppHeader() {
  const { currentUser, dashboard, openScreen, selectedProject, selectTab } = useApp();
  const firstName = currentUser?.name?.split(' ')[0] || 'Usuário';
  const roleLabel = ROLE_LABELS[currentUser?.role] || currentUser?.role || 'Usuário';

  return (
    <Wrapper>
      <Top>
        <Brand>Obra<Accent>Sync</Accent></Brand>
        <Actions>
          <Action accessibilityRole="button" accessibilityLabel="Abrir alertas" onPress={() => openScreen(SCREENS.ALERTS)}>
            <Ionicons name="notifications-outline" size={23} color="#FFFFFF" />
            {!!dashboard?.pendingRequests && <Badge><BadgeText>{dashboard.pendingRequests}</BadgeText></Badge>}
          </Action>
          <Action accessibilityRole="button" accessibilityLabel="Abrir perfil e configurações" onPress={() => openScreen(SCREENS.PROFILE)}>
            <Ionicons name="person-outline" size={23} color="#FFFFFF" />
          </Action>
        </Actions>
      </Top>
      <Greeting>Olá, {firstName}</Greeting>
      <Subtitle>{roleLabel} • {currentUser?.companyName}</Subtitle>
      <ProjectButton accessibilityRole="button" accessibilityLabel={`Obra ativa: ${selectedProject?.name}. Toque para trocar.`} onPress={() => selectTab(TABS.PROJECTS)}>
        <Ionicons name="business-outline" size={20} color="#FFFFFF" />
        <ProjectName numberOfLines={1}>{selectedProject?.name || 'Selecionar obra'}</ProjectName>
        <Ionicons name="chevron-down" size={18} color="#FFFFFF" />
      </ProjectButton>
    </Wrapper>
  );
}
