import {AccessibleIonicons as Ionicons} from '../accessibility/AccessibleNative';
import {AccessibleView,AccessibleView as View,AccessibleTouchableOpacity,AccessibleTouchableOpacity as TouchableOpacity} from '../accessibility/AccessibleNative';
import {ReadableText,ReadableText as Text} from '../accessibility/ReadableText';

import styled from 'styled-components/native';

const PROJECT_COLORS = [
  { color: '#1F6AA5', backgroundColor: '#EAF3FB' },
  { color: '#F47C20', backgroundColor: '#FFF0E2' },
  { color: '#2F9E7A', backgroundColor: '#E5F5EF' },
];

const Card = styled(AccessibleTouchableOpacity)`
  margin-top: 14px;
  padding: 18px;
  background-color: white;
  border: ${({ $isActive, theme }) => (
    $isActive ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`
  )};
  border-radius: 20px;
`;

const Top = styled(AccessibleView)`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
`;

const IconBox = styled(AccessibleView)`
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 15px;
`;

const Info = styled(AccessibleView)`
  flex: 1;
  margin-left: 13px;
`;

const Name = styled(ReadableText)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 900;
`;

const Meta = styled(ReadableText)`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
`;

const ActiveBadge = styled(AccessibleView)`
  padding: 5px 8px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.successSoft};
  border-radius: 999px;
`;

const ActiveText = styled(ReadableText)`
  margin-left: 4px;
  color: ${({ theme }) => theme.colors.success};
  font-size: 10px;
  font-weight: 900;
`;

const ProgressTrack = styled(AccessibleView)`
  height: 7px;
  margin-top: 18px;
  overflow: hidden;
  background-color: #E7ECF4;
  border-radius: 5px;
`;

const ProgressFill = styled(AccessibleView)`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.accent};
`;

const Footer = styled(AccessibleView)`
  margin-top: 9px;
  flex-direction: row;
  justify-content: space-between;
`;

const SmallText = styled(ReadableText)`
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
