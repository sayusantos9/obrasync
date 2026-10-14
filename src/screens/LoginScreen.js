import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import { useApp } from '../contexts/AppContext';
import { ROLE_ACCESS, ROLE_LABELS, ROLE_OPTIONS, USER_ROLES } from '../data/authData';

const ROLE_ICONS = {
  [USER_ROLES.MASTER]: 'shield-checkmark-outline',
  [USER_ROLES.ENGINEERING]: 'calculator-outline',
  [USER_ROLES.PURCHASING]: 'cart-outline',
  [USER_ROLES.REQUESTER]: 'construct-outline',
  [USER_ROLES.CLIENT]: 'eye-outline',
};

function Field({ icon, label, value, onChangeText, secureTextEntry, keyboardType = 'default', placeholder }) {
  const theme = useTheme();
  return (
    <View style={styles.fieldBlock}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <View style={[styles.inputShell, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <Ionicons name={icon} size={19} color={theme.colors.textMuted} />
        <TextInput
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          autoCorrect={false}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={secureTextEntry}
          style={[styles.input, { color: theme.colors.text }]}
          value={value}
        />
      </View>
    </View>
  );
}

export function LoginScreen() {
  const theme = useTheme();
  const { login, registerCompany } = useApp();
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState('action');
  const [role, setRole] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    companyDocument: '',
    companyPhone: '',
  });

  const isRegister = mode === 'register';
  const setValue = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  function chooseAction(nextMode) {
    setMode(nextMode);
    setRole(null);
    setError('');
    setStep(nextMode === 'register' ? 'registerInfo' : 'role');
  }

  function chooseRole(nextRole) {
    setRole(nextRole);
    setStep('form');
    setError('');
  }

  function goBack() {
    setError('');
    if (step === 'form' && mode === 'login') setStep('role');
    else if (step === 'form' && mode === 'register') setStep('registerInfo');
    else setStep('action');
  }

  async function submit() {
    if (!form.email.trim()) {
      setError('Informe um e-mail para continuar.');
      return;
    }
    if (!form.password.trim() || form.password.length < 6) {
      setError('Informe uma senha com pelo menos 6 caracteres.');
      return;
    }
    if (isRegister && !form.name.trim()) {
      setError('Informe seu nome.');
      return;
    }
    if (isRegister && !form.companyName.trim()) {
      setError('Informe o nome da empresa.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        const result = await registerCompany(form);
        if (result?.requiresEmailConfirmation) {
          Alert.alert(
            'Confirme seu e-mail',
            'A conta do Gestor foi criada. Confirme o e-mail e depois volte para Entrar como Gestor/Master.',
          );
          setMode('login');
          setRole(USER_ROLES.MASTER);
          setStep('form');
        }
      } else {
        await login({ ...form, role });
      }
    } catch (err) {
      setError(err?.message || 'Não foi possível continuar.');
    } finally {
      setSubmitting(false);
    }
  }

  const heroTitle = step === 'action'
    ? 'Bem-vindo ao ObraSync'
    : step === 'role'
      ? 'Entrar como'
      : step === 'registerInfo'
        ? 'Primeiro acesso'
        : isRegister
          ? 'Criar conta do Gestor'
          : ROLE_LABELS[role];

  const heroSubtitle = step === 'action'
    ? 'Escolha se você quer entrar em uma conta existente ou cadastrar a empresa pela primeira vez.'
    : step === 'role'
      ? 'Selecione o seu perfil. O aplicativo abre as telas e permissões correspondentes.'
      : step === 'registerInfo'
        ? 'A primeira conta da empresa deve ser do Gestor/Master. Depois ele cadastra funcionários e clientes um por vez.'
        : isRegister
          ? 'O Gestor cria a empresa e depois cadastra Engenharia, Compras, Solicitantes e Clientes pelo painel administrativo.'
          : ROLE_ACCESS[role];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}> 
          <View style={styles.brandRow}>
            <View style={styles.logo}><Ionicons name="business" size={26} color="#FFF" /></View>
            <View>
              <Text style={styles.brand}>Obra<Text style={{ color: theme.colors.accent }}>Sync</Text></Text>
              <Text style={styles.kicker}>SUPABASE • ACESSO REAL</Text>
            </View>
          </View>
          <View style={styles.demoPill}><Ionicons name="shield-checkmark-outline" size={14} color="#FFF" /><Text style={styles.demoText}>Login, perfis e orçamentos conectados</Text></View>
          <Text style={styles.heroTitle}>{heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
          {step !== 'action' && (
            <TouchableOpacity onPress={goBack} style={styles.backRole}>
              <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
              <Text style={[styles.backRoleText, { color: theme.colors.primary }]}>Voltar</Text>
            </TouchableOpacity>
          )}

          {step === 'action' && (
            <>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>O que você quer fazer?</Text>
              <Text style={[styles.helper, { color: theme.colors.textMuted }]}>Escolha uma opção para continuar.</Text>
              <TouchableOpacity onPress={() => chooseAction('login')} style={[styles.actionCard, { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft }]}>
                <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary }]}><Ionicons name="log-in-outline" size={25} color="#FFF" /></View>
                <View style={{ flex: 1 }}><Text style={[styles.actionTitle, { color: theme.colors.primaryDark }]}>Entrar</Text><Text style={[styles.actionText, { color: theme.colors.textMuted }]}>Já tenho um usuário cadastrado.</Text></View>
                <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => chooseAction('register')} style={[styles.actionCard, { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentSoft }]}>
                <View style={[styles.actionIcon, { backgroundColor: theme.colors.accent }]}><Ionicons name="business-outline" size={25} color="#FFF" /></View>
                <View style={{ flex: 1 }}><Text style={[styles.actionTitle, { color: theme.colors.text }]}>Cadastrar empresa</Text><Text style={[styles.actionText, { color: theme.colors.textMuted }]}>Primeiro acesso do Gestor/Master.</Text></View>
                <Ionicons name="chevron-forward" size={22} color={theme.colors.accent} />
              </TouchableOpacity>
            </>
          )}

          {step === 'role' && (
            <>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Qual é o seu perfil?</Text>
              <Text style={[styles.helper, { color: theme.colors.textMuted }]}>O perfil precisa ser o mesmo que foi cadastrado pelo Gestor.</Text>
              <View style={styles.roleList}>
                {ROLE_OPTIONS.map((item) => (
                  <TouchableOpacity key={item} onPress={() => chooseRole(item)} style={[styles.roleCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                    <View style={[styles.roleIcon, { backgroundColor: item === USER_ROLES.MASTER ? theme.colors.accentSoft : theme.colors.primarySoft }]}>
                      <Ionicons name={ROLE_ICONS[item]} size={23} color={item === USER_ROLES.MASTER ? theme.colors.accent : theme.colors.primary} />
                    </View>
                    <View style={styles.roleInfo}>
                      <Text style={[styles.roleTitle, { color: theme.colors.text }]}>{ROLE_LABELS[item]}</Text>
                      <Text numberOfLines={2} style={[styles.roleDescription, { color: theme.colors.textMuted }]}>{ROLE_ACCESS[item]}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={21} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {step === 'registerInfo' && (
            <>
              <View style={[styles.infoBox, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name="shield-checkmark-outline" size={23} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>O cadastro público é somente para o primeiro Gestor/Master da empresa. Depois, os outros acessos são criados no Painel Master.</Text>
              </View>
              <TouchableOpacity onPress={() => { setRole(USER_ROLES.MASTER); setStep('form'); }} style={[styles.actionCard, { borderColor: theme.colors.accent, backgroundColor: theme.colors.accentSoft }]}>
                <View style={[styles.actionIcon, { backgroundColor: theme.colors.accent }]}><Ionicons name="shield-checkmark-outline" size={25} color="#FFF" /></View>
                <View style={{ flex: 1 }}><Text style={[styles.actionTitle, { color: theme.colors.text }]}>Cadastrar Gestor/Master</Text><Text style={[styles.actionText, { color: theme.colors.textMuted }]}>Criar a empresa e a conta administrativa.</Text></View>
                <Ionicons name="chevron-forward" size={22} color={theme.colors.accent} />
              </TouchableOpacity>
            </>
          )}

          {step === 'form' && (
            <>
              {!isRegister && (
                <View style={[styles.selectedRole, { backgroundColor: theme.colors.primarySoft }]}>
                  <Ionicons name={ROLE_ICONS[role]} size={21} color={theme.colors.primary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.selectedRoleTitle, { color: theme.colors.primary }]}>{ROLE_LABELS[role]}</Text>
                    <Text style={[styles.selectedRoleText, { color: theme.colors.textMuted }]}>{ROLE_ACCESS[role]}</Text>
                  </View>
                </View>
              )}

              {isRegister && <Field icon="person-outline" label="NOME DO GESTOR" value={form.name} onChangeText={setValue('name')} placeholder="Seu nome" />}
              <Field icon="mail-outline" label="E-MAIL" value={form.email} onChangeText={setValue('email')} keyboardType="email-address" placeholder="usuario@empresa.com" />
              <Field icon="lock-closed-outline" label="SENHA" value={form.password} onChangeText={setValue('password')} secureTextEntry placeholder="Mínimo 6 caracteres" />
              {isRegister && (
                <>
                  <Field icon="business-outline" label="EMPRESA" value={form.companyName} onChangeText={setValue('companyName')} placeholder="Nome da empresa" />
                  <Field icon="document-text-outline" label="CNPJ" value={form.companyDocument} onChangeText={setValue('companyDocument')} placeholder="00.000.000/0001-00" />
                  <Field icon="call-outline" label="TELEFONE" value={form.companyPhone} onChangeText={setValue('companyPhone')} keyboardType="phone-pad" placeholder="(98) 99999-9999" />
                </>
              )}

              {!!error && (
                <View style={[styles.errorBox, { backgroundColor: theme.colors.dangerSoft }]}>
                  <Ionicons name="alert-circle-outline" size={19} color={theme.colors.danger} />
                  <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity disabled={submitting} onPress={submit} style={[styles.primaryButton, { backgroundColor: isRegister ? theme.colors.accent : theme.colors.primary }, submitting && { opacity: 0.6 }]}>
                <Text style={styles.primaryText}>{submitting ? 'Aguarde...' : isRegister ? 'Criar empresa e Gestor' : 'Entrar no ObraSync'}</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 36 },
  hero: { paddingHorizontal: 24, paddingBottom: 50, paddingTop: 56 },
  brandRow: { alignItems: 'center', flexDirection: 'row' },
  logo: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,.14)', borderRadius: 13, height: 50, justifyContent: 'center', marginRight: 12, width: 50 },
  brand: { color: '#FFF', fontSize: 25, fontWeight: '900' },
  kicker: { color: 'rgba(255,255,255,.58)', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginTop: 2 },
  demoPill: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.12)', borderRadius: 16, flexDirection: 'row', marginTop: 22, paddingHorizontal: 11, paddingVertical: 7 },
  demoText: { color: '#FFF', fontSize: 10, fontWeight: '800', marginLeft: 6 },
  heroTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', marginTop: 20 },
  heroSubtitle: { color: 'rgba(255,255,255,.78)', fontSize: 13, lineHeight: 20, marginTop: 8, maxWidth: 340 },
  card: { borderRadius: 25, borderWidth: 1, marginHorizontal: 18, marginTop: -24, padding: 18 },
  cardTitle: { fontSize: 21, fontWeight: '900', marginTop: 10 },
  helper: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  actionCard: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', marginTop: 14, padding: 14 },
  actionIcon: { alignItems: 'center', borderRadius: 14, height: 48, justifyContent: 'center', marginRight: 12, width: 48 },
  actionTitle: { fontSize: 15, fontWeight: '900' },
  actionText: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  roleList: { marginTop: 12 },
  roleCard: { alignItems: 'center', borderRadius: 17, borderWidth: 1, flexDirection: 'row', marginTop: 9, padding: 12 },
  roleIcon: { alignItems: 'center', borderRadius: 13, height: 46, justifyContent: 'center', width: 46 },
  roleInfo: { flex: 1, marginHorizontal: 11 },
  roleTitle: { fontSize: 14, fontWeight: '900' },
  roleDescription: { fontSize: 10, lineHeight: 15, marginTop: 3 },
  backRole: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', marginBottom: 6 },
  backRoleText: { fontSize: 12, fontWeight: '900', marginLeft: 5 },
  selectedRole: { alignItems: 'flex-start', borderRadius: 16, flexDirection: 'row', marginTop: 13, padding: 13 },
  selectedRoleTitle: { fontSize: 14, fontWeight: '900' },
  selectedRoleText: { fontSize: 10, lineHeight: 15, marginTop: 3 },
  fieldBlock: { marginTop: 14 },
  label: { fontSize: 10, fontWeight: '900', marginBottom: 7 },
  inputShell: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flexDirection: 'row', minHeight: 54, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 14, marginLeft: 9, paddingVertical: 12 },
  infoBox: { alignItems: 'flex-start', borderRadius: 14, flexDirection: 'row', marginTop: 12, padding: 13 },
  infoText: { flex: 1, fontSize: 11, lineHeight: 17, marginLeft: 8 },
  errorBox: { alignItems: 'flex-start', borderRadius: 12, flexDirection: 'row', marginTop: 14, padding: 12 },
  errorText: { flex: 1, fontSize: 11, lineHeight: 17, marginLeft: 8 },
  primaryButton: { alignItems: 'center', borderRadius: 15, flexDirection: 'row', justifyContent: 'center', marginTop: 18, minHeight: 56 },
  primaryText: { color: '#FFF', fontSize: 14, fontWeight: '900', marginRight: 8 },
});
