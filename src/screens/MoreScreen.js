import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { SCREENS } from '../navigation/routes';

const Header = styled.View`padding: 52px 20px 26px; background-color: ${({ theme }) => theme.colors.primaryDark};`;
const Title = styled.Text`font-size: 28px; color: white; font-weight: 900;`;
const Subtitle = styled.Text`font-size: 13px; color: rgba(255,255,255,.72); margin-top: 4px;`;
const Section = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 800; margin: 24px 4px 4px; text-transform: uppercase; letter-spacing: 1px;`;
const Menu = styled.TouchableOpacity`min-height: 66px; background-color: white; border-radius: 17px; margin-top: 10px; padding: 11px 14px; flex-direction: row; align-items: center; border: 1px solid ${({ theme }) => theme.colors.border};`;
const IconTile = styled.View`width: 42px; height: 42px; border-radius: 13px; background-color: ${({ background }) => background}; align-items: center; justify-content: center;`;
const Copy = styled.View`flex: 1; margin-left: 12px;`;
const MenuTitle = styled.Text`font-size: 15px; color: ${({ theme }) => theme.colors.text}; font-weight: 800;`;
const MenuText = styled.Text`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 3px;`;

export function MoreScreen() {
  const { openScreen } = useApp();
  const menus = [
    { title: 'Meu perfil', text: 'Conta, empresa e preferências', icon: 'person', color: '#5A1B73', bg: '#EDE6F1', screen: SCREENS.PROFILE },
    { title: 'Alertas', text: 'Custos, prazos e aprovações', icon: 'notifications', color: '#B5473E', bg: '#FBE9E7', screen: SCREENS.ALERTS },
    { title: 'Pedidos e compras', text: 'Acompanhe solicitações e entregas', icon: 'cart', color: '#E0A526', bg: '#FFF4D6', screen: SCREENS.ORDERS },
    { title: 'Aprovações', text: 'Decisões que precisam de você', icon: 'checkmark-done', color: '#2F9E7A', bg: '#E5F5EF', screen: SCREENS.APPROVALS },
    { title: 'Estoque', text: 'Entradas, saídas e disponibilidade', icon: 'storefront', color: '#7B3F91', bg: '#F3EAF6', screen: SCREENS.STOCK },
  ];
  return <Screen><Scroll><Header><Title>Mais</Title><Subtitle>Recursos e configurações do ObraSync</Subtitle></Header><Content><Section>Gestão</Section>{menus.map((item) => <Menu key={item.title} onPress={() => openScreen(item.screen)}><IconTile background={item.bg}><Ionicons name={item.icon} size={22} color={item.color} /></IconTile><Copy><MenuTitle>{item.title}</MenuTitle><MenuText>{item.text}</MenuText></Copy><Ionicons name="chevron-forward" size={20} color="#968E99" /></Menu>)}</Content></Scroll></Screen>;
}
