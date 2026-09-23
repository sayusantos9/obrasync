import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { Content, Screen, Scroll } from '../components/ui/primitives';

const Header = styled.View`padding: 52px 20px 24px; background-color: ${({ theme }) => theme.colors.primaryDark};`;
const HeaderRow = styled.View`flex-direction: row; align-items: center; justify-content: space-between;`;
const Title = styled.Text`font-size: 28px; color: white; font-weight: 900;`;
const HeaderIcon = styled.View`width: 42px; height: 42px; border-radius: 14px; background-color: rgba(255,255,255,.12); align-items: center; justify-content: center;`;
const TotalCard = styled.View`background-color: white; border-radius: 22px; padding: 18px; margin-top: 18px; border: 1px solid ${({ theme }) => theme.colors.border};`;
const Label = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 700;`;
const Total = styled.Text`font-size: 30px; color: ${({ theme }) => theme.colors.text}; font-weight: 900; margin-top: 4px;`;
const ProgressTrack = styled.View`height: 8px; border-radius: 5px; overflow: hidden; background-color: ${({ theme }) => theme.colors.primarySoft}; margin-top: 14px;`;
const ProgressFill = styled.View`width: 97.4%; height: 100%; background-color: ${({ theme }) => theme.colors.accent};`;
const TotalFooter = styled.View`flex-direction: row; justify-content: space-between; margin-top: 8px;`;
const Small = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;
const SummaryRow = styled.View`flex-direction: row; justify-content: space-between; margin-top: 12px;`;
const SummaryCard = styled.View`width: 48.5%; background-color: white; border-radius: 18px; padding: 15px; border: 1px solid ${({ theme }) => theme.colors.border};`;
const IconTile = styled.View`width: 38px; height: 38px; border-radius: 12px; background-color: ${({ background }) => background}; align-items: center; justify-content: center; margin-bottom: 12px;`;
const SummaryValue = styled.Text`font-size: 17px; color: ${({ theme }) => theme.colors.text}; font-weight: 900; margin-top: 4px;`;
const Warning = styled.TouchableOpacity`background-color: ${({ theme }) => theme.colors.dangerSoft}; border: 1px solid #F2C8C4; border-radius: 18px; padding: 14px; flex-direction: row; align-items: center; margin-top: 12px;`;
const WarningCopy = styled.View`flex: 1; margin-left: 11px;`;
const WarningTitle = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.danger}; font-weight: 900;`;
const WarningText = styled.Text`font-size: 12px; line-height: 17px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px;`;
const SectionRow = styled.View`flex-direction: row; justify-content: space-between; align-items: center; margin: 24px 0 2px;`;
const SectionTitle = styled.Text`font-size: 19px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const Link = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.primary}; font-weight: 800;`;
const Expense = styled.TouchableOpacity`height: 68px; background-color: white; border-radius: 17px; padding: 0 14px; margin-top: 10px; flex-direction: row; align-items: center; border: 1px solid ${({ theme }) => theme.colors.border};`;
const ExpenseCopy = styled.View`flex: 1; margin-left: 12px;`;
const ExpenseName = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.text}; font-weight: 800;`;
const ExpenseDate = styled.Text`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 3px;`;
const ExpenseValue = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const AddButton = styled.TouchableOpacity`height: 56px; border-radius: 17px; background-color: ${({ theme }) => theme.colors.accent}; margin-top: 18px; flex-direction: row; align-items: center; justify-content: center;`;
const AddText = styled.Text`font-size: 15px; color: ${({ theme }) => theme.colors.primaryDark}; font-weight: 900; margin-left: 8px;`;

const expenses = [
  { name: 'Concreto usinado', date: '12 jun 2026', value: 'R$ 12.450,00', icon: 'construct', color: '#E0A526', bg: '#FFF4D6' },
  { name: 'Aço CA-50', date: '11 jun 2026', value: 'R$ 8.320,00', icon: 'cube', color: '#5A1B73', bg: '#EDE6F1' },
  { name: 'Frete de materiais', date: '10 jun 2026', value: 'R$ 2.800,00', icon: 'car', color: '#2F9E7A', bg: '#E5F5EF' },
  { name: 'Mão de obra', date: '09 jun 2026', value: 'R$ 15.600,00', icon: 'people', color: '#B5473E', bg: '#FBE9E7' },
];

export function CostsScreen() {
  return <Screen><Scroll><Header><HeaderRow><Title>Custos da obra</Title><HeaderIcon><Ionicons name="calendar-outline" size={22} color="white" /></HeaderIcon></HeaderRow></Header><Content>
    <TotalCard><Label>TOTAL REALIZADO</Label><Total>R$ 684 mil</Total><ProgressTrack><ProgressFill /></ProgressTrack><TotalFooter><Small>97,4% do orçamento</Small><Small>Limite: R$ 702 mil</Small></TotalFooter></TotalCard>
    <SummaryRow><SummaryCard><IconTile background="#E5F5EF"><Ionicons name="wallet-outline" size={21} color="#2F9E7A" /></IconTile><Label>Disponível</Label><SummaryValue>R$ 18 mil</SummaryValue></SummaryCard><SummaryCard><IconTile background="#EDE6F1"><Ionicons name="document-text-outline" size={21} color="#5A1B73" /></IconTile><Label>Previsto final</Label><SummaryValue>R$ 702 mil</SummaryValue></SummaryCard></SummaryRow>
    <Warning onPress={() => Alert.alert('Atenção ao orçamento', 'A obra já utilizou 97,4% do valor previsto.')}><Ionicons name="warning" size={27} color="#B5473E" /><WarningCopy><WarningTitle>Atenção</WarningTitle><WarningText>Você está a R$ 18 mil do limite. Monitore as próximas despesas.</WarningText></WarningCopy><Ionicons name="chevron-forward" size={20} color="#B5473E" /></Warning>
    <SectionRow><SectionTitle>Últimas despesas</SectionTitle><Link>Ver todas</Link></SectionRow>
    {expenses.map((item) => <Expense key={item.name}><IconTile background={item.bg}><Ionicons name={item.icon} size={21} color={item.color} /></IconTile><ExpenseCopy><ExpenseName>{item.name}</ExpenseName><ExpenseDate>{item.date}</ExpenseDate></ExpenseCopy><ExpenseValue>{item.value}</ExpenseValue></Expense>)}
    <AddButton onPress={() => Alert.alert('Nova despesa', 'Formulário de despesa aberto na demonstração.')}><Ionicons name="add-circle" size={22} color="#260D35" /><AddText>Adicionar despesa</AddText></AddButton>
  </Content></Scroll></Screen>;
}
