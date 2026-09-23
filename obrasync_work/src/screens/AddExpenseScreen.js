import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';

const Intro = styled.Text`font-size: 14px; line-height: 21px; color: ${({ theme }) => theme.colors.textMuted}; margin: 20px 0 2px;`;
const ProjectCard = styled.View`margin-top: 14px; padding: 14px; border-radius: 16px; background-color: ${({ theme }) => theme.colors.primarySoft}; flex-direction: row; align-items: center;`;
const ProjectIcon = styled.View`width: 40px; height: 40px; border-radius: 12px; background-color: white; align-items: center; justify-content: center;`;
const ProjectCopy = styled.View`flex: 1; margin-left: 11px;`;
const ProjectLabel = styled.Text`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 800;`;
const ProjectName = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.text}; font-weight: 900; margin-top: 2px;`;
const Label = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 800; margin: 16px 0 7px;`;
const InputShell = styled.View`min-height: 54px; border: 1px solid ${({ error, theme }) => error ? theme.colors.danger : theme.colors.border}; border-radius: 15px; padding: 0 14px; background-color: white; flex-direction: row; align-items: center;`;
const Input = styled.TextInput`flex: 1; color: ${({ theme }) => theme.colors.text}; font-size: 15px; padding: 14px 0;`;
const Error = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.danger}; margin-top: 5px;`;
const Chips = styled.View`flex-direction: row; flex-wrap: wrap; gap: 8px;`;
const Chip = styled.TouchableOpacity`padding: 10px 12px; border-radius: 999px; border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border}; background-color: ${({ active, theme }) => active ? theme.colors.primarySoft : '#FFFFFF'};`;
const ChipText = styled.Text`font-size: 12px; font-weight: 800; color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textMuted};`;
const Double = styled.View`flex-direction: row; gap: 10px;`;
const Half = styled.View`flex: 1;`;
const Offline = styled.View`padding: 12px; border-radius: 12px; background-color: #FFF4D6; flex-direction: row; align-items: center; margin-top: 16px;`;
const OfflineText = styled.Text`font-size: 12px; color: #71540D; margin-left: 8px; flex: 1;`;
const Submit = styled.TouchableOpacity`height: 56px; border-radius: 16px; background-color: ${({ theme }) => theme.colors.accent}; margin: 24px 0; align-items: center; justify-content: center; flex-direction: row; opacity: ${({ disabled }) => disabled ? .55 : 1};`;
const SubmitText = styled.Text`color: ${({ theme }) => theme.colors.primaryDark}; font-size: 16px; font-weight: 900; margin-left: 8px;`;

const categories = ['Materiais', 'Mão de obra', 'Frete', 'Equipamentos', 'Outros'];
const isoToday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const normalizeAmount = (value) => {
  const raw = String(value || '').trim().replace(/\s/g, '').replace(/^R\$/i, '');
  if (!raw) return NaN;
  if (raw.includes(',') && raw.includes('.')) return Number(raw.replace(/\./g, '').replace(',', '.'));
  if (raw.includes(',')) return Number(raw.replace(',', '.'));
  return Number(raw);
};

export function AddExpenseScreen() {
  const { selectedProject, isOffline, addExpense, goBack } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Materiais');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(isoToday());
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const parsedAmount = useMemo(() => normalizeAmount(amount), [amount]);

  const save = async () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Informe a descrição da despesa.';
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) nextErrors.amount = 'Informe um valor maior que zero.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) nextErrors.date = 'Use o formato AAAA-MM-DD.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      const expense = await addExpense({ name, category, amount: parsedAmount, date, supplier, notes });
      Alert.alert('Despesa adicionada', `${expense.name} foi registrada em ${selectedProject.name}.`, [{ text: 'Concluir', onPress: goBack }]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a despesa.');
    } finally { setSaving(false); }
  };

  return <Screen><ScreenHeader title="Adicionar despesa" /><Scroll><Content><Intro>Registre uma despesa diretamente no contexto da obra selecionada.</Intro><ProjectCard><ProjectIcon><Ionicons name="business" size={21} color="#5A1B73" /></ProjectIcon><ProjectCopy><ProjectLabel>OBRA ATIVA</ProjectLabel><ProjectName>{selectedProject.name}</ProjectName></ProjectCopy><Ionicons name="checkmark-circle" size={22} color="#2F9E7A" /></ProjectCard>
    <Label>DESCRIÇÃO</Label><InputShell error={errors.name}><Input value={name} onChangeText={setName} placeholder="Ex.: Locação de betoneira" placeholderTextColor="#968E99" /></InputShell>{errors.name && <Error>{errors.name}</Error>}
    <Label>CATEGORIA</Label><Chips>{categories.map((item) => <Chip key={item} active={category === item} onPress={() => setCategory(item)}><ChipText active={category === item}>{item}</ChipText></Chip>)}</Chips>
    <Double><Half><Label>VALOR (R$)</Label><InputShell error={errors.amount}><Input value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor="#968E99" /></InputShell>{errors.amount && <Error>{errors.amount}</Error>}</Half><Half><Label>DATA</Label><InputShell error={errors.date}><Input value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" placeholderTextColor="#968E99" /></InputShell>{errors.date && <Error>{errors.date}</Error>}</Half></Double>
    <Label>FORNECEDOR (OPCIONAL)</Label><InputShell><Input value={supplier} onChangeText={setSupplier} placeholder="Nome do fornecedor" placeholderTextColor="#968E99" /></InputShell>
    <Label>OBSERVAÇÕES (OPCIONAL)</Label><InputShell><Input value={notes} onChangeText={setNotes} multiline placeholder="Detalhes, referência ou justificativa" placeholderTextColor="#968E99" /></InputShell>
    {isOffline && <Offline><Ionicons name="cloud-offline" size={20} color="#71540D" /><OfflineText>A despesa será salva localmente no aparelho e continuará visível no controle de custos.</OfflineText></Offline>}
    <Submit disabled={saving} onPress={save}><Ionicons name="add-circle" size={22} color="#260D35" /><SubmitText>{saving ? 'Salvando...' : 'Adicionar despesa'}</SubmitText></Submit>
  </Content></Scroll></Screen>;
}
