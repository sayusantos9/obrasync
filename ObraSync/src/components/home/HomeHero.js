import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';

const HERO_IMAGE = {
  uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=85',
};

const Hero = styled(ImageBackground).attrs({
  imageStyle: { borderRadius: 24 },
})`
  height: 240px;
  margin-top: 18px;
  overflow: hidden;
  background-color: #260D35;
  border-radius: 24px;
`;

const HeroShade = styled(LinearGradient).attrs({
  colors: ['rgba(38,13,53,.98)', 'rgba(38,13,53,.25)'],
  start: { x: 0, y: 0.5 },
  end: { x: 1, y: 0.5 },
})`
  flex: 1;
  justify-content: space-between;
  padding: 18px;
`;

const Status = styled.View`
  align-self: flex-start;
  padding: 7px 11px;
  flex-direction: row;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
`;

const StatusDot = styled.View`
  width: 8px;
  height: 8px;
  margin-right: 7px;
  background-color: #27D88A;
  border-radius: 4px;
`;

const StatusText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 800;
`;

const Title = styled.Text`
  color: white;
  font-size: 28px;
  font-weight: 900;
`;

const Subtitle = styled.Text`
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`;

const ProgressRow = styled.View`
  margin-top: 12px;
  flex-direction: row;
  align-items: flex-end;
`;

const ProgressValue = styled.Text`
  color: white;
  font-size: 38px;
  font-weight: 900;
`;

const ProgressLabel = styled.Text`
  margin: 0 0 6px 8px;
  color: white;
  font-size: 13px;
  line-height: 18px;
`;

const ProgressTrack = styled.View`
  width: 72%;
  height: 7px;
  margin-top: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 5px;
`;

const ProgressFill = styled.View`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.accent};
  border-radius: 5px;
`;

const DetailsButton = styled.TouchableOpacity`
  align-self: flex-start;
  padding: 12px 16px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.accent};
  border-radius: 13px;
`;

const DetailsText = styled.Text`
  margin-right: 8px;
  color: white;
  font-size: 14px;
  font-weight: 900;
`;

export function HomeHero({ project, onOpenDetails }) {
  return (
    <Hero source={HERO_IMAGE}>
      <HeroShade>
        <Status>
          <StatusDot />
          <StatusText>{project.status.toUpperCase()}</StatusText>
        </Status>

        <Title>Sua obra em dia</Title>
        <Subtitle>{project.name} • {project.location}</Subtitle>

        <ProgressRow>
          <ProgressValue>{project.progress}%</ProgressValue>
          <ProgressLabel>do cronograma{`\n`}concluído</ProgressLabel>
        </ProgressRow>

        <ProgressTrack>
          <ProgressFill $progress={project.progress} />
        </ProgressTrack>

        <DetailsButton onPress={onOpenDetails}>
          <DetailsText>Ver detalhes</DetailsText>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </DetailsButton>
      </HeroShade>
    </Hero>
  );
}
