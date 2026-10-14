import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground } from 'react-native';
import styled from 'styled-components/native';

const HERO_IMAGE = require('../../assets/app/construction-hero.jpg');

const Hero = styled(ImageBackground).attrs({ imageStyle: { borderRadius: 22 } })`
  width: 336px;
  height: 220px;
  margin-right: 12px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 22px;
`;
const Shade = styled(LinearGradient).attrs({
  colors: ['rgba(7,31,63,.96)', 'rgba(7,31,63,.18)'],
  start: { x: 0, y: .5 }, end: { x: 1, y: .5 },
})`flex:1; padding:16px; justify-content:space-between;`;
const Status = styled.View`align-self:flex-start; padding:6px 10px; flex-direction:row; align-items:center; background-color:rgba(255,255,255,.15); border-radius:18px;`;
const Dot = styled.View`width:7px; height:7px; margin-right:7px; background-color:#35D992; border-radius:4px;`;
const StatusText = styled.Text`color:white; font-size:10px; font-weight:900;`;
const Title = styled.Text`color:white; font-size:${({theme})=>24*theme.fontScale}px; font-weight:900;`;
const Sub = styled.Text`margin-top:2px; color:rgba(255,255,255,.78); font-size:${({theme})=>12*theme.fontScale}px;`;
const ProgressRow = styled.View`flex-direction:row; align-items:flex-end;`;
const Big = styled.Text`color:white; font-size:${({theme})=>34*theme.fontScale}px; font-weight:900;`;
const Small = styled.Text`margin-left:8px; margin-bottom:5px; color:white; font-size:${({theme})=>11*theme.fontScale}px; line-height:15px;`;
const Track = styled.View`height:6px; width:68%; overflow:hidden; background-color:rgba(255,255,255,.25); border-radius:4px;`;
const Fill = styled.View`height:100%; width:${({$progress})=>$progress}%; background-color:${({theme})=>theme.colors.accent}; border-radius:4px;`;
const Button = styled.TouchableOpacity`align-self:flex-start; min-height:38px; padding:0 14px; flex-direction:row; align-items:center; background-color:${({theme})=>theme.colors.accent}; border-radius:12px;`;
const ButtonText = styled.Text`margin-right:7px; color:white; font-size:12px; font-weight:900;`;

export function HomeHero({ project, onOpenDetails }) {
  return (
    <Hero source={HERO_IMAGE} accessibilityLabel={`${project.name}, ${project.progress}% concluída`}>
      <Shade>
        <Status><Dot /><StatusText>{String(project.status || 'Em andamento').toUpperCase()}</StatusText></Status>
        <Title>Sua obra em dia</Title>
        <Sub>{project.name} • {project.location || 'Local não informado'}</Sub>
        <ProgressRow><Big>{project.progress}%</Big><Small>do cronograma{`\n`}concluído</Small></ProgressRow>
        <Track><Fill $progress={Math.min(100, Math.max(0, project.progress || 0))} /></Track>
        <Button accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${project.name}`} onPress={onOpenDetails}>
          <ButtonText>Ver detalhes</ButtonText><Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
        </Button>
      </Shade>
    </Hero>
  );
}
