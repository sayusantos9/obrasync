import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

const PROJECT_COLORS = [
  { color: '#5A1B73', backgroundColor: '#EDE6F1' },
  { color: '#E0A526', backgroundColor: '#FFF4D6' },
  { color: '#2F9E7A', backgroundColor: '#E5F5EF' },
];

const Card = styled.TouchableOpacity`
  margin-top: 14px;
  padding: 18px;
  background-color: white;
  border: ${({ $isActive, theme }) => (
    $isActive ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`
  )};
  border-radius: 20px;
`;

const Top = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

const IconBox = styled.View`
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 15px;
`;

const Info = styled.View`
  flex: 1;
  margin-left: 13px;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 900;
`;

const Meta = styled.Text`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

const ActiveBadge = styled.View`
  padding: 5px 8px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.successSoft};
  border-radius: 999px;
`;

const ActiveText = styled.Text`
  margin-left: 4px;
  color: ${({ theme }) => theme.colors.success};
  font-size: 10px;
  font-weight: 900;
`;

const ProgressTrack = styled.View`
  height: 7px;
  margin-top: 18px;
  overflow: hidden;
  background-color: #E7ECF4;
  border-radius: 5px;
`;

const ProgressFill = styled.View`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.accent};
`;

const Footer = styled.View`
  margin-top: 9px;
  flex-direction: row;
  justify-content: space-between;
`;

const SmallText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
`;

export function ProjectCard({ project, index, isActive, onPress }) {
  const palette = PROJECT_COLORS[index % PROJECT_COLORS.length];

  return (
    <Card $isActive={isActive} onPress={onPress}>
      <Top>
        <IconBox $backgroundColor={palette.backgroundColor}>
          <Ionicons name="business" size={25} color={palette.color} />
        </IconBox>

        <Info>
          <Name>{project.name}</Name>
          <Meta>{project.location} • {project.client}</Meta>
        </Info>

        {isActive ? (
          <ActiveBadge>
            <Ionicons name="checkmark-circle" size={15} color="#2F9E7A" />
            <ActiveText>ATIVA</ActiveText>
          </ActiveBadge>
        ) : (
          <Ionicons name="chevron-forward" size={21} color="#756D7A" />
        )}
      </Top>

      <ProgressTrack>
        <ProgressFill $progress={project.progress} />
      </ProgressTrack>

      <Footer>
        <SmallText>{project.status}</SmallText>
        <SmallText>{project.progress}% concluída</SmallText>
      </Footer>
    </Card>
  );
}
