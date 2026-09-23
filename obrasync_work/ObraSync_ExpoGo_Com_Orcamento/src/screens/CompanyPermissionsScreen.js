import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { ChoiceChips } from '../components/forms/ChoiceChips';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { theme } from '../theme';
import { companyPermissionStyles as styles } from './CompanyPermissionsScreen.styles';

const ROLE_OPTIONS = [
  'Gestor/Master',
  'Orçamentista/Engenharia',
  'Compras/Almoxarifado',
  'Obra/Solicitante',
  'Consulta/Cliente',
];

const ROLE_DETAILS = {
  'Gestor/Master': {
    color: '#5A1B73',
    backgroundColor: '#EDE6F1',
    access: 'Administração da empresa, usuários, obras e acesso aos módulos operacionais.',
  },
  'Orçamentista/Engenharia': {
    color: '#9B6B08',
    backgroundColor: '#FFF4D6',
    access: 'Orçamentos, insumos, composições, custos e apoio às cotações.',
  },
  'Compras/Almoxarifado': {
    color: '#2F9E7A',
    backgroundColor: '#E5F5EF',
    access: 'Solicitações, cotações, pedidos, recebimentos e estoque.',
  },
  'Obra/Solicitante': {
    color: '#B5473E',
    backgroundColor: '#FBE9E7',
    access: 'Solicitações e operações vinculadas às obras autorizadas.',
  },
  'Consulta/Cliente': {
    color: '#7B3F91',
    backgroundColor: '#F3EAF6',
    access: 'Consulta de informações liberadas, sem administração de cadastros.',
  },
};

const INITIAL_MEMBERS = [
  { id: '1', name: 'Emelly Santos', email: 'gestor@planengen.com.br', role: 'Gestor/Master' },
  { id: '2', name: 'Lucas Almeida', email: 'engenharia@planengen.com.br', role: 'Orçamentista/Engenharia' },
  { id: '3', name: 'Ana Paula', email: 'compras@planengen.com.br', role: 'Compras/Almoxarifado' },
  { id: '4', name: 'João Costa', email: 'obra@planengen.com.br', role: 'Obra/Solicitante' },
  { id: '5', name: 'Cliente Aurora', email: 'cliente@aurora.com.br', role: 'Consulta/Cliente' },
];

const DEFAULT_MEMBER_FORM = {
  name: '',
  email: '',
  role: 'Obra/Solicitante',
};

export function CompanyPermissionsScreen() {
  const { selectedProject } = useApp();
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { control, handleSubmit, reset } = useForm({ defaultValues: DEFAULT_MEMBER_FORM });

  function handleCancelForm() {
    reset(DEFAULT_MEMBER_FORM);
    setIsFormVisible(false);
  }

  function handleAddMember(formValues) {
    const newMember = {
      id: `USR-${Date.now()}`,
      name: formValues.name.trim(),
      email: formValues.email.trim().toLowerCase(),
      role: formValues.role,
    };

    setMembers((currentMembers) => [...currentMembers, newMember]);
    handleCancelForm();
    Alert.alert('Acesso criado', 'O funcionário foi adicionado com o perfil selecionado.');
  }

  return (
    <Screen>
      <ScreenHeader title="Empresa e permissões" />
      <Scroll>
        <Content>
          <View style={styles.companyCard}>
            <View style={styles.companyTop}>
              <View style={styles.companyIcon}>
                <Ionicons name="business" size={24} color={theme.colors.accent} />
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>PLANENGEN Consultoria</Text>
                <Text style={styles.companyMeta}>CNPJ 00.000.000/0001-00 • conta empresarial</Text>
              </View>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.scope}>
              <Ionicons name="layers-outline" size={18} color={theme.colors.accent} />
              <Text style={styles.scopeText}>
                Controle por empresa, obra e perfil. Obra ativa: {selectedProject.name}.
              </Text>
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Equipe e acessos</Text>
            <Text style={styles.countText}>{members.length} usuários</Text>
          </View>

          {members.map((member) => {
            const roleDetails = ROLE_DETAILS[member.role];

            return (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.row}>
                  <View style={[styles.avatar, { backgroundColor: roleDetails.backgroundColor }]}>
                    <Ionicons name="person" size={21} color={roleDetails.color} />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  <View style={[styles.rolePill, { backgroundColor: roleDetails.backgroundColor }]}>
                    <Text style={[styles.roleText, { color: roleDetails.color }]}>
                      {member.role.split('/')[0]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.accessText}>{roleDetails.access}</Text>
              </View>
            );
          })}

          {!isFormVisible && (
            <TouchableOpacity style={styles.addButton} onPress={() => setIsFormVisible(true)}>
              <Ionicons name="person-add" size={21} color={theme.colors.primaryDark} />
              <Text style={styles.addButtonText}>Adicionar funcionário</Text>
            </TouchableOpacity>
          )}

          {isFormVisible && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Novo acesso</Text>
              <FormField
                control={control}
                name="name"
                label="NOME"
                rules={{
                  required: 'Informe o nome do funcionário.',
                  minLength: { value: 3, message: 'Informe pelo menos 3 caracteres.' },
                }}
                placeholder="Nome completo"
              />
              <FormField
                control={control}
                name="email"
                label="E-MAIL"
                rules={{
                  required: 'Informe o e-mail.',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Informe um e-mail válido.' },
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="usuario@empresa.com"
              />
              <Text style={styles.sectionTitle}>PERFIL</Text>
              <ChoiceChips control={control} name="role" options={ROLE_OPTIONS} />

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleCancelForm}>
                  <Text style={styles.secondaryText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSubmit(handleAddMember)}
                >
                  <Text style={styles.primaryText}>Salvar acesso</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Perfis de permissão</Text>
          </View>

          {ROLE_OPTIONS.map((role) => (
            <View key={role} style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>{role}</Text>
              <Text style={styles.permissionText}>{ROLE_DETAILS[role].access}</Text>
            </View>
          ))}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              No protótipo, a gestão de funcionários fica disponível ao perfil Gestor/Master. As permissões são vinculadas ao contexto de empresa e obra.
            </Text>
          </View>
        </Content>
      </Scroll>
    </Screen>
  );
}
