import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';

const CompanyCard = styled.View`margin-top: 20px; padding: 18px; border-radius: 20px; background-color: ${({ theme }) => theme.colors.primaryDark};`;
const CompanyTop = styled.View`flex-direction: row; align-items: center;`;
const CompanyIcon = styled.View`width: 48px; height: 48px; border-radius: 15px; background-color: rgba(255,255,255,.14); align-items: center; justify-content: center;`;
const CompanyCopy = styled.View`flex: 1; margin-left: 12px;`;
const CompanyName = styled.Text`font-size: 17px; color: white; font-weight: 900;`;
const CompanyMeta = styled.Text`font-size: 12px; color: rgba(255,255,255,.7); margin-top: 3px;`;
const Scope = styled.View`margin-top: 14px; padding-top: 14px; border-top-width: 1px; border-top-color: rgba(255,255,255,.14); flex-direction: row; align-items: center;`;
const ScopeText = styled.Text`font-size: 12px; color: rgba(255,255,255,.78); margin-left: 8px; flex: 1;`;
const SectionRow = styled.View`flex-direction: row; align-items: center; justify-content: space-between; margin: 24px 0 5px;`;
const SectionTitle = styled.Text`font-size: 19px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const Count = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 800;`;
const Member = styled.View`background-color: white; border-radius: 18px; padding: 14px; border: 1px solid ${({ theme }) => theme.colors.border}; margin-top: 10px;`;
const Row = styled.View`flex-direction: row; align-items: center;`;
const Avatar = styled.View`width: 44px; height: 44px; border-radius: 14px; background-color: ${({ bg }) => bg}; align-items: center; justify-content: center;`;
const MemberCopy = styled.View`flex: 1; margin-left: 11px;`;
const MemberName = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const MemberEmail = styled.Text`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 2px;`;
const RolePill = styled.View`padding: 6px 9px; border-radius: 999px; background-color: ${({ bg }) => bg};`;
const RoleText = styled.Text`font-size: 10px; color: ${({ color }) => color}; font-weight: 900;`;
const Access = styled.Text`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 10px; line-height: 16px;`;
const AddButton = styled.TouchableOpacity`height: 54px; border-radius: 16px; margin-top: 14px; background-color: ${({ theme }) => theme.colors.accent}; flex-direction: row; align-items: center; justify-content: center;`;
const AddButtonText = styled.Text`font-size: 14px; color: ${({ theme }) => theme.colors.primaryDark}; font-weight: 900; margin-left: 7px;`;
const Form = styled.View`background-color: white; border-radius: 18px; padding: 16px; border: 1px solid ${({ theme }) => theme.colors.border}; margin-top: 12px;`;
const Label = styled.Text`font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 900; margin: 12px 0 6px;`;
const Input = styled.TextInput`height: 50px; border-radius: 14px; border: 1px solid ${({ theme }) => theme.colors.border}; background-color: #FFFFFF; padding: 0 13px; font-size: 14px; color: ${({ theme }) => theme.colors.text};`;
const Chips = styled.View`flex-direction: row; flex-wrap: wrap; gap: 7px;`;
const Chip = styled.TouchableOpacity`padding: 9px 10px; border-radius: 999px; border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border}; background-color: ${({ active, theme }) => active ? theme.colors.primarySoft : '#FFFFFF'};`;
const ChipText = styled.Text`font-size: 11px; font-weight: 800; color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textMuted};`;
const FormActions = styled.View`flex-direction: row; gap: 9px; margin-top: 16px;`;
const Secondary = styled.TouchableOpacity`flex: 1; height: 48px; border-radius: 14px; border: 1px solid ${({ theme }) => theme.colors.border}; align-items: center; justify-content: center;`;
const Primary = styled.TouchableOpacity`flex: 1; height: 48px; border-radius: 14px; background-color: ${({ theme }) => theme.colors.primary}; align-items: center; justify-content: center;`;
const SecondaryText = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 800;`;
const PrimaryText = styled.Text`font-size: 13px; color: white; font-weight: 900;`;
const PermissionCard = styled.View`background-color: white; border-radius: 18px; padding: 15px; border: 1px solid ${({ theme }) => theme.colors.border}; margin-top: 10px;`;
const PermissionTitle = styled.Text`font-size: 13px; color: ${({ theme }) => theme.colors.text}; font-weight: 900;`;
const PermissionText = styled.Text`font-size: 11px; line-height: 17px; color: ${({ theme }) => theme.colors.textMuted}; margin-top: 4px;`;
const Info = styled.View`padding: 13px; border-radius: 15px; background-color: ${({ theme }) => theme.colors.primarySoft}; flex-direction: row; align-items: flex-start; margin: 22px 0 6px;`;
const InfoText = styled.Text`font-size: 11px; line-height: 17px; color: ${({ theme }) => theme.colors.textMuted}; margin-left: 9px; flex: 1;`;

const roles = [
  'Gestor/Master',
  'Orçamentista/Engenharia',
  'Compras/Almoxarifado',
  'Obra/Solicitante',
  'Consulta/Cliente',
];

const roleMeta = {
  'Gestor/Master': { color: '#5A1B73', bg: '#EDE6F1', access: 'Administração da empresa, usuários, obras e acesso aos módulos operacionais.' },
  'Orçamentista/Engenharia': { color: '#9B6B08', bg: '#FFF4D6', access: 'Orçamentos, insumos, composições, custos e apoio às cotações.' },
  'Compras/Almoxarifado': { color: '#2F9E7A', bg: '#E5F5EF', access: 'Solicitações, cotações, pedidos, recebimentos e estoque.' },
  'Obra/Solicitante': { color: '#B5473E', bg: '#FBE9E7', access: 'Solicitações e operações vinculadas às obras autorizadas.' },
  'Consulta/Cliente': { color: '#7B3F91', bg: '#F3EAF6', access: 'Consulta de informações liberadas, sem administração de cadastros.' },
};

const initialMembers = [
  { id: '1', name: 'Emelly Santos', email: 'gestor@planengen.com.br', role: 'Gestor/Master' },
  { id: '2', name: 'Lucas Almeida', email: 'engenharia@planengen.com.br', role: 'Orçamentista/Engenharia' },
  { id: '3', name: 'Ana Paula', email: 'compras@planengen.com.br', role: 'Compras/Almoxarifado' },
  { id: '4', name: 'João Costa', email: 'obra@planengen.com.br', role: 'Obra/Solicitante' },
  { id: '5', name: 'Cliente Aurora', email: 'cliente@aurora.com.br', role: 'Consulta/Cliente' },
];

export function CompanyPermissionsScreen() {
  const { selectedProject } = useApp();
  const [members, setMembers] = useState(initialMembers);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Obra/Solicitante');
  const canSave = useMemo(() => name.trim().length >= 3 && /\S+@\S+\.\S+/.test(email), [name, email]);

  const addMember = () => {
    if (!canSave) return Alert.alert('Revise os dados', 'Informe nome e e-mail válidos para o funcionário.');
    setMembers((items) => [...items, { id: `USR-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), role }]);
    setName('');
    setEmail('');
    setRole('Obra/Solicitante');
    setShowForm(false);
    Alert.alert('Acesso criado', 'O funcionário foi adicionado ao protótipo com o perfil selecionado.');
  };

  return <Screen><ScreenHeader title="Empresa e permissões" /><Scroll><Content>
    <CompanyCard><CompanyTop><CompanyIcon><Ionicons name="business" size={24} color="#E0A526" /></CompanyIcon><CompanyCopy><CompanyName>PLANENGEN Consultoria</CompanyName><CompanyMeta>CNPJ 00.000.000/0001-00 • conta empresarial</CompanyMeta></CompanyCopy><Ionicons name="shield-checkmark" size={24} color="#FFFFFF" /></CompanyTop><Scope><Ionicons name="layers-outline" size={18} color="#E0A526" /><ScopeText>Controle de acesso por empresa, obra e perfil. Obra ativa: {selectedProject.name}.</ScopeText></Scope></CompanyCard>

    <SectionRow><SectionTitle>Equipe e acessos</SectionTitle><Count>{members.length} usuários</Count></SectionRow>
    {members.map((member) => { const meta = roleMeta[member.role]; return <Member key={member.id}><Row><Avatar bg={meta.bg}><Ionicons name="person" size={21} color={meta.color} /></Avatar><MemberCopy><MemberName>{member.name}</MemberName><MemberEmail>{member.email}</MemberEmail></MemberCopy><RolePill bg={meta.bg}><RoleText color={meta.color}>{member.role.split('/')[0]}</RoleText></RolePill></Row><Access>{meta.access}</Access></Member>; })}

    {!showForm && <AddButton onPress={() => setShowForm(true)}><Ionicons name="person-add" size={21} color="#260D35" /><AddButtonText>Adicionar funcionário</AddButtonText></AddButton>}
    {showForm && <Form><SectionTitle style={{ fontSize: 16 }}>Novo acesso</SectionTitle><Label>NOME</Label><Input value={name} onChangeText={setName} placeholder="Nome completo" placeholderTextColor="#968E99" /><Label>E-MAIL</Label><Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="usuario@empresa.com" placeholderTextColor="#968E99" /><Label>PERFIL</Label><Chips>{roles.map((item) => <Chip key={item} active={role === item} onPress={() => setRole(item)}><ChipText active={role === item}>{item}</ChipText></Chip>)}</Chips><FormActions><Secondary onPress={() => setShowForm(false)}><SecondaryText>Cancelar</SecondaryText></Secondary><Primary onPress={addMember}><PrimaryText>Salvar acesso</PrimaryText></Primary></FormActions></Form>}

    <SectionRow><SectionTitle>Perfis de permissão</SectionTitle></SectionRow>
    {roles.map((item) => <PermissionCard key={item}><PermissionTitle>{item}</PermissionTitle><PermissionText>{roleMeta[item].access}</PermissionText></PermissionCard>)}
    <Info><Ionicons name="information-circle-outline" size={20} color="#5A1B73" /><InfoText>No protótipo, a gestão de funcionários fica disponível ao perfil Gestor/Master. As permissões são apresentadas por perfil e vinculadas ao contexto de empresa e obra.</InfoText></Info>
  </Content></Scroll></Screen>;
}
