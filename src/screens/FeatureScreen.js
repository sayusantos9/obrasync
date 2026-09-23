import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { alerts, projects } from '../data/mockData';
import { useApp } from '../contexts/AppContext';
import { SCREENS } from '../navigation/routes';

const Summary = styled.View`background-color: ${({ theme }) => theme.colors.primaryDark}; border-radius: 22px; padding: 20px; margin-top: 20px;`;
const Eyebrow = styled.Text`font-size: 12px; color: #A9C2F6; font-weight: 800;`;
const Big = styled.Text`font-size: 28px; color: white; font-weight: 900; margin-top: 8px;`;
const Muted = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.textMuted}; line-height: 19px; margin-top: 4px;`;
const Section = styled.Text`font-size: 19px; color: ${({ theme }) => theme.colors.text}; font-weight: 900; margin: 24px 0 4px;`;
const Card = styled.TouchableOpacity`background-color: white; border-radius: 18px; padding: 16px; margin-top: 12px; border: 1px solid ${({ theme }) => theme.colors.border};`;
const Row = styled.View`flex-direction: row; align-items: center;`;
const Icon = styled.View`width: 44px; height: 44px; border-radius: 14px; background-color: ${({ bg }) => bg || '#EDE6F1'}; align-items: center; justify-content: center; margin-right: 12px;`;
const Flex = styled.View`flex: 1;`;
const Title = styled.Text`font-size: 15px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const Value = styled.Text`font-size: 16px; color: ${({ color, theme }) => color || theme.colors.text}; font-weight: 900;`;
const Pill = styled.View`padding: 6px 9px; border-radius: 20px; background-color: ${({ bg }) => bg};`;
const PillText = styled.Text`font-size: 10px; color: ${({ color }) => color}; font-weight: 900;`;
const Button = styled.TouchableOpacity`height: 54px; margin-top: 22px; border-radius: 16px; background-color: ${({ theme }) => theme.colors.primary}; align-items: center; justify-content: center;`;
const ButtonText = styled.Text`color: white; font-size: 15px; font-weight: 900;`;
const ActionRow = styled.View`flex-direction: row; justify-content: space-between; margin-top: 18px;`;
const ActionButton = styled.TouchableOpacity`width: 48.5%; min-height: 78px; border-radius: 17px; padding: 12px; background-color: ${({ background }) => background}; border: 1px solid ${({ border }) => border}; justify-content: space-between;`;
const ActionText = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.text}; font-weight: 900; margin-top: 8px;`;

const config = {
  quotes: { title: 'Comparar cotações', eyebrow: 'COTAÇÃO #028', big: 'Cimento CP II • 120 sacos', section: 'Propostas recebidas' },
  receipt: { title: 'Recebimento', eyebrow: 'PEDIDO #115', big: 'Construmais', section: 'Conferência do material' },
  stock: { title: 'Estoque', eyebrow: 'RESIDENCIAL AURORA', big: '142 itens cadastrados', section: 'Movimentações recentes' },
  costs: { title: 'Custos da obra', eyebrow: 'DESVIO TOTAL', big: '+ R$ 19.250', section: 'Maiores impactos' },
  orders: { title: 'Pedidos e compras', eyebrow: '4 PEDIDOS ATIVOS', big: 'R$ 33.088 em compras', section: 'Acompanhe os pedidos' },
  approvals: { title: 'Aprovações', eyebrow: 'AÇÃO NECESSÁRIA', big: '2 compras pendentes', section: 'Aguardando decisão' },
  alerts: { title: 'Alertas', eyebrow: 'ATENÇÃO HOJE', big: '4 itens importantes', section: 'Linha do tempo' },
  projects: { title: 'Selecionar obra', eyebrow: 'OBRAS VINCULADAS', big: '3 obras disponíveis', section: 'Escolha o contexto' },
};

function QuoteCards() {
  const data = [
    ['Construmais', 'R$ 4.620', 'Melhor custo', '#2F9E7A', '#E5F5EF'],
    ['Norte Materiais', 'R$ 4.560', 'Menor preço', '#9B6B08', '#FFF4D6'],
    ['Casa da Obra', 'R$ 4.812', 'Mais rápida', '#5A1B73', '#EDE6F1'],
  ];
  return data.map(([name, value, tag, color, bg]) => <Card key={name} onPress={() => Alert.alert('Fornecedor selecionado', name)}><Row><Icon bg={bg}><Ionicons name="storefront" size={22} color={color} /></Icon><Flex><Title>{name}</Title><Muted>Frete e prazo incluídos</Muted></Flex><Flex style={{ alignItems: 'flex-end' }}><Value>{value}</Value><Pill bg={bg}><PillText color={color}>{tag}</PillText></Pill></Flex></Row></Card>);
}

function ReceiptCards({ onGenerateLabel, onScan }) {
  return <><Card onPress={onScan}><Row><Icon><Ionicons name="qr-code" size={23} color="#5A1B73" /></Icon><Flex><Title>Escanear material ou pedido</Title><Muted>Leia o QR Code ou código de barras no recebimento.</Muted></Flex><Ionicons name="scan" size={22} color="#E0A526" /></Row></Card><Card><Title>Resumo esperado</Title><Muted>120 sacos • R$ 38,50 por unidade</Muted><Muted>Local: Galpão A • Setor 03</Muted></Card><ActionRow><ActionButton background="#FFF4D6" border="#EFD58C" onPress={onGenerateLabel}><Ionicons name="qr-code-outline" size={24} color="#9B6B08" /><ActionText>Gerar etiqueta</ActionText></ActionButton><ActionButton background="#E5F5EF" border="#BDE3D5" onPress={onScan}><Ionicons name="scan-outline" size={24} color="#2F9E7A" /><ActionText>Escanear etiqueta</ActionText></ActionButton></ActionRow><Button onPress={() => Alert.alert('Recebimento salvo', 'O registro foi adicionado à demonstração.')}><ButtonText>Registrar recebimento</ButtonText></Button></>;
}

function GenericCards({ type }) {
  if (type === 'projects') return projects.map((item) => <Card key={item.id}><Row><Icon><Ionicons name="business" size={22} color="#5A1B73" /></Icon><Flex><Title>{item.name}</Title><Muted>{item.city} • {item.progress}% concluída</Muted></Flex><Ionicons name="chevron-forward" size={20} color="#756D7A" /></Row></Card>);
  if (type === 'alerts') return alerts.map((item) => <Card key={item.id}><Row><Icon bg={item.type === 'danger' ? '#FBE9E7' : '#FFF4D6'}><Ionicons name={item.icon} size={22} color={item.type === 'danger' ? '#B5473E' : '#9B6B08'} /></Icon><Flex><Title>{item.title}</Title><Muted>{item.description}</Muted></Flex></Row></Card>);
  const rows = {
    stock: [['Entrada', 'Cimento CP II', '+100 sc', '#2F9E7A'], ['Saída', 'Aço CA-50', '-320 kg', '#E0A526'], ['Perda', 'Cerâmica 60x60', '-12 un', '#B5473E']],
    costs: [['Cimento CP II', 'Variação +12,4%', '+ R$ 8.640', '#B5473E'], ['Areia média', 'Variação +4,8%', '+ R$ 4.120', '#9B6B08'], ['Aço CA-50', 'Economia -2,1%', '- R$ 3.280', '#2F9E7A']],
    orders: [['#115 • Construmais', 'Em trânsito', 'R$ 4.620', '#5A1B73'], ['#109 • Norte Aço', 'Atrasado', 'R$ 18.340', '#B5473E'], ['#102 • Hidrocenter', 'Entrega parcial', 'R$ 6.218', '#9B6B08']],
    approvals: [['Pedido #115', 'Construmais • acima do previsto', 'R$ 4.620', '#B5473E'], ['Pedido #118', 'Norte Materiais • dentro da alçada', 'R$ 2.870', '#2F9E7A']],
  }[type] || [];
  return rows.map(([a, b, value, color]) => <Card key={a}><Row><Icon bg={`${color}18`}><Ionicons name="cube" size={22} color={color} /></Icon><Flex><Title>{a}</Title><Muted>{b}</Muted></Flex><Value color={color}>{value}</Value></Row></Card>);
}

export function FeatureScreen({ type }) {
  const { openScreen, openScanner } = useApp();
  const view = config[type] || config.stock;
  return <Screen><ScreenHeader title={view.title} /><Scroll><Content><Summary><Eyebrow>{view.eyebrow}</Eyebrow><Big>{view.big}</Big></Summary><Section>{view.section}</Section>{type === 'quotes' ? <QuoteCards /> : type === 'receipt' ? <ReceiptCards onGenerateLabel={() => openScreen(SCREENS.LABEL)} onScan={openScanner} /> : <GenericCards type={type} />}{type === 'stock' && <ActionRow><ActionButton background="#FFF4D6" border="#EFD58C" onPress={() => openScreen(SCREENS.LABEL)}><Ionicons name="qr-code-outline" size={24} color="#9B6B08" /><ActionText>Gerar etiqueta</ActionText></ActionButton><ActionButton background="#E5F5EF" border="#BDE3D5" onPress={openScanner}><Ionicons name="scan-outline" size={24} color="#2F9E7A" /><ActionText>Movimentar por QR</ActionText></ActionButton></ActionRow>}{['approvals'].includes(type) && <Button onPress={() => Alert.alert('Compra aprovada', 'A decisão foi registrada na trilha de auditoria.')}><ButtonText>Aprovar selecionada</ButtonText></Button>}</Content></Scroll></Screen>;
}
