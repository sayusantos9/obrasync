import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { ChoiceChips } from '../components/forms/ChoiceChips';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { useApp } from '../contexts/AppContext';
import { canManageCompanies, canManageEmployees, USER_ROLES } from '../data/authData';
import {
  DEFAULT_COMPANY_FORM,
  DEFAULT_MEMBER_FORM,
  INITIAL_COMPANIES,
  INITIAL_MEMBERS,
  ROLE_DETAILS,
  ROLE_OPTIONS,
} from '../data/companyPermissionsData';
import { usePersistentState } from '../hooks/usePersistentState';
import { theme } from '../theme';
import { companyPermissionStyles as styles } from './CompanyPermissionsScreen.styles';

export function CompanyPermissionsScreen() {
  const { currentUser, selectedProject } = useApp();
  const [companies, setCompanies] = usePersistentState(STORAGE_KEYS.COMPANIES, [...INITIAL_COMPANIES]);
  const [members, setMembers] = usePersistentState(STORAGE_KEYS.COMPANY_MEMBERS, [...INITIAL_MEMBERS]);
  const [activeForm, setActiveForm] = useState(null);
  const memberForm = useForm({ defaultValues: DEFAULT_MEMBER_FORM });
  const companyForm = useForm({ defaultValues: DEFAULT_COMPANY_FORM });
  const allowCompanyManagement = canManageCompanies(currentUser.role);
  const allowEmployeeManagement = canManageEmployees(currentUser.role);
  const canSeeAllCompanies = currentUser.role === USER_ROLES.SUPER_ADMIN || currentUser.role === USER_ROLES.ADMIN;
  const visibleCompanies = canSeeAllCompanies
    ? companies
    : companies.filter((company) => company.id === currentUser.companyId);
  const visibleCompanyIds = new Set(visibleCompanies.map((company) => company.id));
  const visibleMembers = members.filter((member) => visibleCompanyIds.has(member.companyId));

  function closeForms() {
    setActiveForm(null);
    memberForm.reset(DEFAULT_MEMBER_FORM);
    companyForm.reset(DEFAULT_COMPANY_FORM);
  }

  async function handleAddMember(formValues) {
    const companyId = currentUser.role === USER_ROLES.SUPER_ADMIN
      ? (visibleCompanies[0]?.id || currentUser.companyId)
      : currentUser.companyId;
    const newMember = {
      id: `USR-${Date.now()}`,
      name: formValues.name.trim(),
      email: formValues.email.trim().toLowerCase(),
      role: formValues.role,
      companyId,
    };

    await setMembers((current) => [...current, newMember]);
    closeForms();
    Alert.alert('Acesso criado', 'O funcionário foi adicionado com o perfil selecionado.');
  }

  async function handleAddCompany(formValues) {
    const companyId = `EMP-${Date.now()}`;
    await setCompanies((current) => [
      ...current,
      {
        id: companyId,
        name: formValues.name.trim(),
        document: formValues.document.trim(),
        email: formValues.email.trim().toLowerCase(),
        status: 'Ativa',
      },
    ]);
    closeForms();
    Alert.alert('Empresa cadastrada', 'A nova empresa já pode receber usuários e obras.');
  }

  return (
    <Screen>
      <ScreenHeader title="Empresas e permissões" />
      <Scroll>
        <Content>
          <View style={styles.companyCard}>
            <View style={styles.companyTop}>
              <View style={styles.companyIcon}>
                <Ionicons name="business" size={24} color={theme.colors.accent} />
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{currentUser.companyName}</Text>
                <Text style={styles.companyMeta}>Acesso: {currentUser.email}</Text>
              </View>
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.scope}>
              <Ionicons name="layers-outline" size={18} color={theme.colors.accent} />
              <Text style={styles.scopeText}>Obra ativa: {selectedProject.name}</Text>
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Empresas cadastradas</Text>
            <Text style={styles.countText}>{visibleCompanies.length}</Text>
          </View>

          {visibleCompanies.map((company) => (
            <View key={company.id} style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>{company.name}</Text>
              <Text style={styles.permissionText}>{company.document || 'Documento não informado'}</Text>
              <Text style={styles.permissionText}>{company.email}</Text>
            </View>
          ))}

          {allowCompanyManagement && activeForm !== 'company' && (
            <TouchableOpacity style={styles.secondaryAddButton} onPress={() => setActiveForm('company')}>
              <Ionicons name="business-outline" size={21} color={theme.colors.primary} />
              <Text style={styles.secondaryAddButtonText}>Cadastrar empresa</Text>
            </TouchableOpacity>
          )}

          {activeForm === 'company' && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Nova empresa</Text>
              <FormField control={companyForm.control} name="name" label="RAZÃO SOCIAL / NOME" placeholder="Empresa" rules={{ required: 'Informe o nome.' }} />
              <FormField control={companyForm.control} name="document" label="CNPJ" placeholder="00.000.000/0001-00" rules={{ required: 'Informe o CNPJ.' }} />
              <FormField
                autoCapitalize="none"
                control={companyForm.control}
                keyboardType="email-address"
                name="email"
                label="E-MAIL"
                placeholder="contato@empresa.com"
                rules={{ required: 'Informe o e-mail.', pattern: { value: /\S+@\S+\.\S+/, message: 'E-mail inválido.' } }}
              />
              <View style={styles.formActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={closeForms}><Text style={styles.secondaryText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={companyForm.handleSubmit(handleAddCompany)}><Text style={styles.primaryText}>Salvar empresa</Text></TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Equipe e acessos</Text>
            <Text style={styles.countText}>{visibleMembers.length} usuários</Text>
          </View>

          {visibleMembers.map((member) => {
            const roleDetails = ROLE_DETAILS[member.role] || ROLE_DETAILS['Obra/Solicitante'];
            const company = companies.find((item) => item.id === member.companyId);

            return (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.row}>
                  <View style={[styles.avatar, { backgroundColor: roleDetails.backgroundColor }]}>
                    <Ionicons name="person" size={21} color={roleDetails.color} />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                    <Text style={styles.memberCompany}>{company?.name || member.companyId}</Text>
                  </View>
                  <View style={[styles.rolePill, { backgroundColor: roleDetails.backgroundColor }]}>
                    <Text style={[styles.roleText, { color: roleDetails.color }]}>{member.role.split('/')[0]}</Text>
                  </View>
                </View>
                <Text style={styles.accessText}>{roleDetails.access}</Text>
              </View>
            );
          })}

          {allowEmployeeManagement && activeForm !== 'member' && (
            <TouchableOpacity style={styles.addButton} onPress={() => setActiveForm('member')}>
              <Ionicons name="person-add" size={21} color={theme.colors.primaryDark} />
              <Text style={styles.addButtonText}>Adicionar funcionário</Text>
            </TouchableOpacity>
          )}

          {activeForm === 'member' && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Novo acesso</Text>
              <FormField control={memberForm.control} name="name" label="NOME" rules={{ required: 'Informe o nome.' }} placeholder="Nome completo" />
              <FormField
                autoCapitalize="none"
                control={memberForm.control}
                keyboardType="email-address"
                name="email"
                label="E-MAIL"
                placeholder="usuario@empresa.com"
                rules={{ required: 'Informe o e-mail.', pattern: { value: /\S+@\S+\.\S+/, message: 'Informe um e-mail válido.' } }}
              />
              <Text style={styles.formSectionLabel}>PERFIL</Text>
              <ChoiceChips control={memberForm.control} name="role" options={ROLE_OPTIONS} />
              <View style={styles.formActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={closeForms}><Text style={styles.secondaryText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={memberForm.handleSubmit(handleAddMember)}><Text style={styles.primaryText}>Salvar acesso</Text></TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Perfis de permissão</Text></View>
          {ROLE_OPTIONS.map((role) => (
            <View key={role} style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>{role}</Text>
              <Text style={styles.permissionText}>{ROLE_DETAILS[role].access}</Text>
            </View>
          ))}

          {!allowEmployeeManagement && (
            <View style={styles.infoBox}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>Seu perfil é somente de consulta. Alterações de empresa e usuários exigem uma conta administrativa.</Text>
            </View>
          )}
        </Content>
      </Scroll>
    </Screen>
  );
}
