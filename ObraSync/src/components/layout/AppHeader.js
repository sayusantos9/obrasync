import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';
import { ROLE_LABELS } from '../../data/authData';
import { SCREENS, TABS } from '../../navigation/routes';

const Wrapper = styled(LinearGradient).attrs({
  colors: ['#260D35', '#5A1B73'],
})`
  padding: 14px 20px 24px;
`;

const Top = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Brand = styled.Text`
  color: white;
  font-size: 27px;
  font-weight: 900;
`;

const Accent = styled.Text`
  color: ${({ theme }) => theme.colors.accent};
`;

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const Action = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.16);
  border-radius: 22px;
`;

const Badge = styled.View`
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.danger};
  border-radius: 10px;
`;

const BadgeText = styled.Text`
  color: white;
  font-size: 11px;
  font-weight: 800;
`;

const Greeting = styled.Text`
  margin-top: 20px;
  color: white;
  font-size: 26px;
  font-weight: 900;
`;

const Subtitle = styled.Text`
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
`;

const ProjectButton = styled.TouchableOpacity`
  min-height: 48px;
  margin-top: 16px;
  padding: 0 14px;
  flex-direction: row;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.16);
  border-radius: 15px;
`;

const ProjectName = styled.Text`
  flex: 1;
  margin-left: 10px;
  color: white;
  font-size: 15px;
  font-weight: 800;
`;

export function AppHeader() {
  const { currentUser, openScreen, selectedProject, selectTab } = useApp();
  const firstName = currentUser?.name?.split(' ')[0] || 'Usuário';
  const roleLabel = ROLE_LABELS[currentUser?.role] || currentUser?.role || 'Usuário';

  return (
    <Wrapper>
      <Top>
        <Brand>
          Obra<Accent>Sync</Accent>
        </Brand>

        <Actions>
          <Action
            accessibilityLabel="Abrir perfil"
            onPress={() => openScreen(SCREENS.PROFILE)}
          >
            <Ionicons name="person-outline" size={24} color="white" />
          </Action>

          <Action
            accessibilityLabel="Abrir alertas"
            onPress={() => openScreen(SCREENS.ALERTS)}
          >
            <Ionicons name="notifications-outline" size={25} color="white" />
            <Badge>
              <BadgeText>3</BadgeText>
            </Badge>
          </Action>
        </Actions>
      </Top>

      <Greeting>Olá, {firstName}</Greeting>
      <Subtitle>{roleLabel} • {currentUser?.companyName || 'ObraSync'}</Subtitle>

      <ProjectButton onPress={() => selectTab(TABS.PROJECTS)}>
        <Ionicons name="business-outline" size={21} color="white" />
        <ProjectName numberOfLines={1}>{selectedProject.name}</ProjectName>
        <Ionicons name="chevron-down" size={20} color="white" />
      </ProjectButton>
    </Wrapper>
  );
}
