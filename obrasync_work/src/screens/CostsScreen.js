import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { defaultExpenses } from '../data/mockData';
import { useApp } from '../contexts/AppContext';
import { SCREENS } from '../navigation/routes';

const Header = styled.View`padding: 52px 20px 24px; background-color: ${({ theme }) => theme.colors.primaryDark};`;
const HeaderRow = styled.View`flex-direction: row; align-items: center; justify-content: space-between;`;
const Title = styled.Text`font-size: 28px; color: white; font-weight: 900;`;
const Subtitle = styled.Text`font-size: 12px; color: rgba(255,255,255,.7); margin-top: 4px;`;
const HeaderIcon = styled.View`width: 42px; height: 42px; border-radius: 14px; background-color: rgba(255,255,255,.12); align-items: center; justify-content: center;`;
const TotalCard = styled.View`background-color: white; border-radius: 22px; padding: 18px; margin-top: 18px; border: 1px solid ${({ theme }) => theme.colors.border};`;
const Label = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 700;`;
const Total = styled.Text`font-size: 30px; color: ${({ theme }) => theme.colors.text}; font-weight: 900; margin-top: 4px;`;
const ProgressTrack = styled.View`height: 8px; border-radius: 5px; overflow: hidden; background-color: ${({ theme }) => theme.colors.primarySoft}; margin-top: 14px;`;
const ProgressFill = styled.View`width: ${({ progress }) => progress}%; height: 100%; background-color: ${({ over, theme }) => over ? theme.colors.danger : theme.colors.accent};`;
const TotalFooter = styled.View`flex-direction: row; justify-content: space-between; margin-top: 8px;`;
const Small = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};`;
const SummaryRow = styled.View`flex-direction: row; justify-content: space-between; margin-top: 12px;`;
const SummaryCard = styled.View`width: 48.5%; background-color: white; border-radius: 18px; padding: 15px; border: 1px solid ${({ theme }) => theme.colors.border};`;
const IconTile = styled.View`width: 38px; height: 38px; border-radius: 12px; background-color: ${({ background }) => background}; align-items: center; justify-content: center; margin-bottom: 12px;`;
const SummaryValue = styled.Text`font-size: 17px; color: ${({ color, theme }) => color || theme.colors.text}; font-weight: 900; margin-top: 4px;`;
const Warning = styled.TouchableOpacity`background-color: ${({ theme }) => theme.colors.dangerSoft}; border: 1px solid #F2C8C4; border-radius: 18px; padding: 14px; flex-direction: row; align-items: center; margin-top: 12px;`;
const WarningCopy = styled.View`flex: 1; margin-left: 11px;`;
const WarningTitle = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.danger}; font-weight: 900;`;
const WarningText = styled.Text`font-size: 12px; line-height: 17px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px;`;
const SectionRow = styled.View`flex-direction: row; justify-content: space-between; align-items: center; margin: 24px 0 2px;`;
const SectionTitle = styled.Text`font-size: 19px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const Link = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.primary}; font-weight: 800;`;
const Expense = styled.View`min-height: 68px; background-color: white; border-radius: 17px; padding: 10px 14px; margin-top: 10px; flex-direction: row; align-items: center; border: 1px solid ${({ theme }) => theme.colors.border};`;
const ExpenseCopy = styled.View`flex: 1; margin-left: 12px;`;
const ExpenseName = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.text}; font-weight: 800;`;
const ExpenseDate = styled.Text`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 3px;`;
const ExpenseValue = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.text}; font-weight: 900; margin-left: 8px;`;
const AddButton = styled.TouchableOpacity`height: 56px; border-radius: 17px; background-color: ${({ theme }) => theme.colors.accent}; margin-top: 18px; flex-direction: row; align-items: center; justify-content: center;`;
const AddText = styled.Text`font-size: 15px; color: ${({ theme }) => theme.colors.primaryDark}; font-weight: 900; margin-left: 8px;`;

const BASE_REALIZED = 684250;
const BUDGET_LIMIT = 702000;
const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const compactMoney = (value) => {
  const abs = Math.abs(value);
  if (abs >= 1000000) return `R$ ${(abs / 1000000).toFixed(2).replace('.', ',')} mi`;
  if (abs >= 1000) return `R$ ${(abs / 1000).toFixed(abs >= 100000 ? 0 : 1).replace('.', ',')} mil`;
  return money(abs);
};

export function CostsScreen() {
  const { openScreen, selectedProject, extraExpenses } = useApp();
  const projectExtras = extraExpenses.filter((item) => item.projectId === selectedProject.id);
  const expenses = [...projectExtras, ...defaultExpenses];
  const addedTotal = projectExtras.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const realized = BASE_REALIZED + addedTotal;
  const available = BUDGET_LIMIT - realized;
  const percent = (realized / BUDGET_LIMIT) * 100;
  const progress = Math.min(100, Math.max(0, percent));
  const over = available < 0;

  return <Screen><Scroll><Header><HeaderRow><Title>Custos da obra</Title><HeaderIcon><Ionicons name="calendar-outline" size={22} color="white" /></HeaderIcon></HeaderRow><Subtitle>{selectedProject.name}</Subtitle></Header><Content>
    <TotalCard><Label>TOTAL REALIZADO</Label><Total>{compactMoney(realized)}</Total><ProgressTrack><ProgressFill progress={progress} over={over} /></ProgressTrack><TotalFooter><Small>{percent.toFixed(1).replace('.', ',')}% do limite</Small><Small>Limite: {compactMoney(BUDGET_LIMIT)}</Small></TotalFooter></TotalCard>
    <SummaryRow><SummaryCard><IconTile background={over ? '#FBE9E7' : '#E5F5EF'}><Ionicons name={over ? 'alert-circle-outline' : 'wallet-outline'} size={21} color={over ? '#B5473E' : '#2F9E7A'} /></IconTile><Label>{over ? 'Acima do limite' : 'Disponível'}</Label><SummaryValue color={over ? '#B5473E' : undefined}>{compactMoney(available)}</SummaryValue></SummaryCard><SummaryCard><IconTile background="#EDE6F1"><Ionicons name="document-text-outline" size={21} color="#5A1B73" /></IconTile><Label>Limite atual</Label><SummaryValue>{compactMoney(BUDGET_LIMIT)}</SummaryValue></SummaryCard></SummaryRow>
    <Warning onPress={() => Alert.alert('Atenção ao orçamento', over ? `O limite foi ultrapassado em ${money(Math.abs(available))}.` : `Restam ${money(available)} até o limite atual.`)}><Ionicons name="warning" size={27} color="#B5473E" /><WarningCopy><WarningTitle>{over ? 'Limite ultrapassado' : 'Atenção'}</WarningTitle><WarningText>{over ? `As novas despesas deixaram a obra ${compactMoney(Math.abs(available))} acima do limite.` : `Você está a ${compactMoney(available)} do limite. Monitore as próximas despesas.`}</WarningText></WarningCopy><Ionicons name="chevron-forward" size={20} color="#B5473E" /></Warning>
    <SectionRow><SectionTitle>Últimas despesas</SectionTitle><Link>{expenses.length} registros</Link></SectionRow>
    {expenses.slice(0, 8).map((item) => <Expense key={item.id}><IconTile background={item.bg}><Ionicons name={item.icon} size={21} color={item.color} /></IconTile><ExpenseCopy><ExpenseName>{item.name}</ExpenseName><ExpenseDate>{item.date}{item.category ? ` • ${item.category}` : ''}</ExpenseDate></ExpenseCopy><ExpenseValue>{money(item.amount)}</ExpenseValue></Expense>)}
    <AddButton onPress={() => openScreen(SCREENS.ADD_EXPENSE)}><Ionicons name="add-circle" size={22} color="#260D35" /><AddText>Adicionar despesa</AddText></AddButton>
  </Content></Scroll></Screen>;
}
