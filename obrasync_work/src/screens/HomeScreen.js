import { ActivityIndicator, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styled from 'styled-components/native';
import { AppHeader } from '../components/layout/AppHeader';
import { SearchBar } from '../components/common/SearchBar';
import { QuickAction } from '../components/common/QuickAction';
import { Content, LinkText, Screen, Scroll, SectionHeader, SectionTitle } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { useDashboard } from '../hooks/useDashboard';
import { SCREENS, TABS } from '../navigation/routes';

const Hero = styled(ImageBackground).attrs({ imageStyle: { borderRadius: 24 } })`height: 240px; margin-top: 18px; border-radius: 24px; overflow: hidden; background-color: #260D35;`;
const HeroShade = styled(LinearGradient).attrs({ colors: ['rgba(38,13,53,.98)', 'rgba(38,13,53,.25)'], start: { x: 0, y: .5 }, end: { x: 1, y: .5 } })`flex: 1; padding: 18px; justify-content: space-between;`;
const Status = styled.View`align-self: flex-start; padding: 7px 11px; border-radius: 20px; background-color: rgba(255,255,255,.15); flex-direction: row; align-items: center;`;
const Dot = styled.View`width: 8px; height: 8px; border-radius: 4px; background-color: #27D88A; margin-right: 7px;`;
const StatusText = styled.Text`color: white; font-size: 12px; font-weight: 800;`;
const HeroTitle = styled.Text`color: white; font-size: 28px; font-weight: 900;`;
const HeroText = styled.Text`color: rgba(255,255,255,.8); font-size: 14px; margin-top: 3px;`;
const ProgressRow = styled.View`flex-direction: row; align-items: flex-end; margin-top: 12px;`;
const Progress = styled.Text`font-size: 38px; color: white; font-weight: 900;`;
const ProgressText = styled.Text`font-size: 13px; color: white; line-height: 18px; margin: 0 0 6px 8px;`;
const ProgressTrack = styled.View`height: 7px; border-radius: 5px; background-color: rgba(255,255,255,.25); margin-top: 8px; width: 72%; overflow: hidden;`;
const ProgressFill = styled.View`height: 100%; width: ${({ progress }) => progress}%; background-color: ${({ theme }) => theme.colors.accent}; border-radius: 5px;`;
const HeroButton = styled.TouchableOpacity`align-self: flex-start; border-radius: 13px; padding: 12px 16px; background-color: ${({ theme }) => theme.colors.accent}; flex-direction: row; align-items: center;`;
const HeroButtonText = styled.Text`color: white; font-size: 14px; font-weight: 900; margin-right: 8px;`;
const Actions = styled.View`flex-direction: row; flex-wrap: wrap; justify-content: space-between;`;
const Metrics = styled.ScrollView.attrs({ horizontal: true, showsHorizontalScrollIndicator: false })`margin: 0 -20px; padding-left: 20px;`;
const Metric = styled.TouchableOpacity`width: 158px; min-height: 126px; background-color: white; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 18px; padding: 14px; margin-right: 10px;`;
const MetricIcon = styled.View`width: 38px; height: 38px; border-radius: 12px; background-color: ${({ bg }) => bg}; align-items: center; justify-content: center;`;
const MetricLabel = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; margin-top: 11px;`;
const MetricValue = styled.Text`color: ${({ color, theme }) => color || theme.colors.text}; font-size: 18px; font-weight: 900; margin-top: 4px;`;
const AlertCard = styled.TouchableOpacity`background-color: ${({ bg }) => bg}; border-radius: 16px; padding: 14px; flex-direction: row; align-items: center; margin-bottom: 10px; border: 1px solid ${({ border }) => border};`;
const AlertIcon = styled.View`width: 42px; height: 42px; border-radius: 14px; align-items: center; justify-content: center; background-color: ${({ color }) => color};`;
const AlertCopy = styled.View`flex: 1; margin-left: 12px;`;
const AlertTitle = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.text}; font-weight: 800;`;
const AlertDescription = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px;`;
const SyncCard = styled.TouchableOpacity`margin: 18px 0 4px; padding: 15px; border-radius: 18px; background-color: ${({ theme }) => theme.colors.primarySoft}; flex-direction: row; align-items: center;`;
const SyncIcon = styled.View`width: 44px; height: 44px; border-radius: 14px; align-items: center; justify-content: center; background-color: ${({ offline }) => offline ? '#FBE9E7' : '#FFFFFF'};`;
const SyncCopy = styled.View`flex: 1; margin-left: 11px;`;
const SyncTitle = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: 14px; font-weight: 800;`;
const SyncText = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; margin-top: 2px;`;

const HERO_IMAGE = { uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=85' };

export function HomeScreen() {
  const { openScreen, selectTab, selectedProject, isOffline, pendingRequests, sync, isSyncing } = useApp();
  const { data, isLoading } = useDashboard();
  return <Screen><Scroll><AppHeader /><Content><SearchBar />
    <Hero source={HERO_IMAGE}><HeroShade><Status><Dot /><StatusText>EM ANDAMENTO</StatusText></Status><HeroTitle>Sua obra em dia</HeroTitle><HeroText>{selectedProject.name} • {selectedProject.city}</HeroText><ProgressRow><Progress>{selectedProject.progress}%</Progress><ProgressText>do cronograma{`\n`}concluído</ProgressText></ProgressRow><ProgressTrack><ProgressFill progress={selectedProject.progress} /></ProgressTrack><HeroButton onPress={() => selectTab(TABS.COSTS)}><HeroButtonText>Ver detalhes</HeroButtonText><Ionicons name="arrow-forward" size={18} color="white" /></HeroButton></HeroShade></Hero>
    <SectionHeader><SectionTitle>Ações rápidas</SectionTitle></SectionHeader><Actions>
      <QuickAction icon="cart-outline" label="Solicitar material" color="#E0A526" background="#FFF9E9" onPress={() => openScreen(SCREENS.REQUEST)} />
      <QuickAction icon="document-text-outline" label="Cotações" color="#5A1B73" background="#F7F1F9" onPress={() => openScreen(SCREENS.QUOTES)} />
      <QuickAction icon="cube-outline" label="Recebimento" color="#2F9E7A" background="#EFF9F5" onPress={() => openScreen(SCREENS.RECEIPT)} />
      <QuickAction icon="storefront-outline" label="Estoque" color="#B5473E" background="#FDF2F0" onPress={() => openScreen(SCREENS.STOCK)} />
    </Actions>
    <SectionHeader><SectionTitle>Resumo da obra</SectionTitle><LinkText>Ver mais</LinkText></SectionHeader>
    {isLoading ? <ActivityIndicator color="#5A1B73" /> : <Metrics>
      <Metric onPress={() => selectTab(TABS.COSTS)}><MetricIcon bg="#EDE6F1"><Ionicons name="wallet" size={22} color="#5A1B73" /></MetricIcon><MetricLabel>Custo realizado</MetricLabel><MetricValue>R$ {Math.round(data.realized / 1000)} mil</MetricValue></Metric>
      <Metric onPress={() => selectTab(TABS.COSTS)}><MetricIcon bg="#FBE9E7"><Ionicons name="trending-up" size={22} color="#B5473E" /></MetricIcon><MetricLabel>Desvio</MetricLabel><MetricValue color="#B5473E">+{data.deviation}%</MetricValue></Metric>
      <Metric onPress={() => openScreen(SCREENS.ORDERS)}><MetricIcon bg="#E5F5EF"><Ionicons name="car" size={22} color="#2F9E7A" /></MetricIcon><MetricLabel>Entregas</MetricLabel><MetricValue color="#B5473E">{data.lateDeliveries} atrasadas</MetricValue></Metric>
    </Metrics>}
    <SectionHeader><SectionTitle>Atenção hoje</SectionTitle><LinkText>Ver todas</LinkText></SectionHeader>
    <AlertCard bg="#FBE9E7" border="#F2C8C4" onPress={() => openScreen(SCREENS.ALERTS)}><AlertIcon color="#B5473E"><Ionicons name="warning" size={22} color="white" /></AlertIcon><AlertCopy><AlertTitle>Cimento acima do previsto</AlertTitle><AlertDescription>Consumo 18% maior que o planejado.</AlertDescription></AlertCopy><Ionicons name="chevron-forward" size={20} color="#756D7A" /></AlertCard>
    <AlertCard bg="#FFF4D6" border="#F2D98F" onPress={() => openScreen(SCREENS.APPROVALS)}><AlertIcon color="#E0A526"><Ionicons name="time" size={22} color="white" /></AlertIcon><AlertCopy><AlertTitle>Aprovação pendente</AlertTitle><AlertDescription>2 cotações aguardam sua aprovação.</AlertDescription></AlertCopy><Ionicons name="chevron-forward" size={20} color="#756D7A" /></AlertCard>
    <SyncCard onPress={sync}><SyncIcon offline={isOffline}><Ionicons name={isOffline ? 'cloud-offline' : 'cloud-done'} size={25} color={isOffline ? '#B5473E' : '#5A1B73'} /></SyncIcon><SyncCopy><SyncTitle>{isOffline ? 'Modo offline' : isSyncing ? 'Sincronizando...' : 'Sincronizado'}</SyncTitle><SyncText>{pendingRequests.length ? `${pendingRequests.length} registro(s) pendente(s)` : 'Dados atualizados recentemente'}</SyncText></SyncCopy><Ionicons name="chevron-forward" size={20} color="#5A1B73" /></SyncCard>
  </Content></Scroll></Screen>;
}
