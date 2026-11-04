import { KeyboardScrollView } from '../components/layout/KeyboardScrollView';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Image, Keyboard, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line } from 'react-native-svg';
import { useTheme } from 'styled-components/native';
import { useApp } from '../contexts/AppContext';
import { ROLE_LABELS, ROLE_OPTIONS, USER_ROLES } from '../data/authData';
import { colors, styles } from './LoginScreen.styles';

const LOGO = require('../assets/brand/planengen-light.png');
const PROFILES = {
  MASTER: { icon: 'shield-checkmark-outline', description: 'Gerencie sua empresa e os acessos da equipe.' },
  ENGINEERING: { icon: 'calculator-outline', description: 'Planeje orçamentos e acompanhe os materiais.' },
  PURCHASING: { icon: 'cart-outline', description: 'Organize compras, recebimentos e estoque.' },
  REQUESTER: { icon: 'construct-outline', description: 'Solicite materiais e acompanhe sua obra.' },
  CLIENT: { icon: 'eye-outline', description: 'Consulte as informações da sua obra.' },
};

function Blueprint() {
  return <View pointerEvents="none" accessible={false} style={styles.blueprint}>
    <Svg width="220" height="280" viewBox="0 0 220 280">
      <Path d="M35 280V100L115 52V280M115 52L198 98V280M11 280V168L35 153M68 280V193L92 178V280" fill="none" stroke="#0084F4" strokeWidth="1.2" />
      {[116, 144, 172, 200, 228].map(y => <Line key={y} x1="137" y1={y} x2="177" y2={y + 22} stroke="#EEF0F2" strokeOpacity=".17" />)}
      <Path d="M0 262H220M12 28H210M18 22V34M204 22V34M60 60V13" fill="none" stroke="#0084F4" strokeOpacity=".35" strokeWidth=".7" />
    </Svg>
  </View>;
}

function Field({ label, icon, value, onChangeText, password, inputRef, isRegister, editable = true, ...props }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const { fontScale } = useTheme();
  return <View style={styles.field}>
    <Text style={[styles.label, { fontSize: 12 * fontScale }]}>{label}</Text>
    <View style={[styles.inputShell, focused && styles.inputFocused]}>
      <Ionicons name={icon} size={20} color={focused ? colors.blue : colors.muted} />
      <TextInput ref={inputRef} accessibilityLabel={label} value={value} onChangeText={onChangeText}
        editable={editable} autoCapitalize="none" autoCorrect={false} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        secureTextEntry={password && !visible} placeholderTextColor="#7A8392" style={[styles.input, { fontSize: 15 * fontScale }]}
        {...(password ? { autoComplete: isRegister ? 'new-password' : 'current-password', textContentType: isRegister ? 'newPassword' : 'password' } : {})} {...props} />
      {password && <TouchableOpacity accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisible(v => !v)} style={styles.eye}>
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.muted} />
      </TouchableOpacity>}
    </View>
  </View>;
}

export function LoginScreen() {
  const { login, registerCompany } = useApp();
  const { fontScale } = useTheme();
  const dimensions = useWindowDimensions();
  const height = useRef(dimensions.height).current;
  const scrollRef = useRef(null), passwordRef = useRef(null), submittingRef = useRef(false);
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '', companyDocument: '', companyPhone: '' });
  const setValue = key => value => { setError(''); setForm(current => ({ ...current, [key]: value })); };
  const type = style => [style, { fontSize: style.fontSize * fontScale }];
  function changeMode(register) {
    if (submittingRef.current) return;
    Keyboard.dismiss(); setIsRegister(register); setError('');
    setForm(current => ({ ...current, password: '' }));
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }
  useEffect(() => {
    if (!isRegister) return undefined;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { changeMode(false); return true; });
    return () => listener.remove();
  }, [isRegister]);
  async function submit() {
    if (submittingRef.current) return;
    if (!isRegister && !role) { setError('Selecione seu perfil de acesso.'); setProfileOpen(true); return; }
    if (!form.email.trim()) { setError('Informe seu e-mail.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Informe um e-mail válido.'); return; }
    if (!form.password.trim() || form.password.length < 6) { setError('Informe uma senha com pelo menos 6 caracteres.'); return; }
    if (isRegister && !form.name.trim()) { setError('Informe o nome do Gestor.'); return; }
    if (isRegister && !form.companyName.trim()) { setError('Informe o nome da empresa.'); return; }
    Keyboard.dismiss(); setError(''); submittingRef.current = true; setSubmitting(true);
    try {
      if (isRegister) {
        const result = await registerCompany(form);
        if (result?.requiresEmailConfirmation) {
          Alert.alert('Confirme seu e-mail', 'Sua conta foi criada. Confirme o e-mail recebido e depois entre como Gestor/Master.');
          setIsRegister(false); setRole(USER_ROLES.MASTER); setForm(current => ({ ...current, password: '' }));
          scrollRef.current?.scrollTo({ y: 0, animated: false });
        }
      } else { await login({ email: form.email, password: form.password, role }); }
    } catch (err) { setError(err?.message || 'Não foi possível continuar. Tente novamente.'); }
    finally { submittingRef.current = false; setSubmitting(false); }
  }
  return <View style={styles.root}>
    <View style={styles.root}>
      <KeyboardScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient colors={[colors.navy, '#10103C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <SafeAreaView edges={['top', 'left', 'right']}>
            <View style={[styles.hero, (height < 740 || isRegister) && styles.heroCompact]}>
              <Blueprint />
              <View style={styles.brandRow}>
                <Image source={LOGO} resizeMode="contain" style={styles.logo} accessible accessibilityLabel="Planengen — Consultoria e Construção" />
                <View style={styles.appMark}><Text style={styles.appMarkText}>OBRASYNC</Text></View>
              </View>
              <View style={styles.heroCopy}>
                <View style={styles.eyebrowRow}><View style={styles.blueDash} /><Text style={styles.eyebrow}>GESTÃO QUE CONECTA</Text></View>
                <Text style={[type(styles.heroTitle), (height < 740 || isRegister) && { fontSize: 28 * fontScale }]}>
                  Sua obra.{isRegister ? ' ' : '\n'}<Text style={styles.heroTitleLight}>Todos no mesmo plano.</Text>
                </Text>
                {!isRegister && <Text style={type(styles.heroSubtitle)}>Do planejamento à obra, sua equipe em sintonia.</Text>}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.paper}>
          <View style={styles.formContent}>
            {isRegister && <TouchableOpacity disabled={submitting} accessibilityRole="button" onPress={() => changeMode(false)} style={styles.back}>
              <Ionicons name="arrow-back" size={20} color={colors.navy} /><Text style={type(styles.backText)}>Voltar ao login</Text>
            </TouchableOpacity>}
            <View style={styles.headingRow}>
              <View style={{ flex: 1 }}><Text accessibilityRole="header" style={type(styles.title)}>{isRegister ? 'Comece pela sua empresa' : 'Bem-vindo de volta'}</Text>
                <Text style={type(styles.subtitle)}>{isRegister ? 'Crie a empresa e sua conta de Gestor.' : 'Acesse seu espaço de trabalho.'}</Text></View>
              {!isRegister && <View style={styles.headingIcon}><Ionicons name="log-in-outline" size={26} color={colors.blue} /></View>}
            </View>
            {isRegister ? <View style={styles.info}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.blue} />
              <Text style={type(styles.infoText)}>Este cadastro é para o primeiro Gestor. Depois, ele cadastra a equipe e os clientes pelo painel da empresa.</Text>
            </View> : <View style={styles.field}>
              <Text style={type(styles.label)}>Perfil de acesso</Text>
              <TouchableOpacity disabled={submitting} accessibilityRole="button" accessibilityLabel={`Perfil de acesso: ${role ? ROLE_LABELS[role] : 'selecionar'}`}
                accessibilityState={{ expanded: profileOpen, disabled: submitting }} onPress={() => { Keyboard.dismiss(); setProfileOpen(true); }} style={styles.profilePicker}>
                <View style={styles.profileIcon}><Ionicons name={role ? PROFILES[role].icon : 'people-outline'} size={20} color={colors.blue} /></View>
                <Text style={[type(styles.profileName), !role && { color: colors.muted }]}>{role ? ROLE_LABELS[role] : 'Selecione seu perfil'}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>}
            {isRegister && <Field label="Nome do Gestor" icon="person-outline" value={form.name} onChangeText={setValue('name')} editable={!submitting} placeholder="Seu nome completo" autoCapitalize="words" autoComplete="name" />}
            <Field label="E-mail" icon="mail-outline" value={form.email} onChangeText={setValue('email')} editable={!submitting} keyboardType="email-address"
              autoComplete="email" textContentType="emailAddress" placeholder="voce@empresa.com" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />
            <Field label="Senha" icon="lock-closed-outline" inputRef={passwordRef} value={form.password} onChangeText={setValue('password')} editable={!submitting}
              password isRegister={isRegister} placeholder={isRegister ? 'Mínimo de 6 caracteres' : 'Digite sua senha'} returnKeyType={isRegister ? 'next' : 'go'} onSubmitEditing={isRegister ? undefined : submit} />
            {isRegister && <>
              <View style={styles.divider} /><Text style={type(styles.groupTitle)}>Dados da empresa</Text>
              <Field label="Nome da empresa" icon="business-outline" value={form.companyName} onChangeText={setValue('companyName')} editable={!submitting} placeholder="Razão social ou nome fantasia" autoCapitalize="words" />
              <Field label="CNPJ (opcional)" icon="document-text-outline" value={form.companyDocument} onChangeText={setValue('companyDocument')} editable={!submitting} placeholder="00.000.000/0001-00" keyboardType="number-pad" />
              <Field label="Telefone (opcional)" icon="call-outline" value={form.companyPhone} onChangeText={setValue('companyPhone')} editable={!submitting} placeholder="(00) 00000-0000" keyboardType="phone-pad" autoComplete="tel" />
            </>}
            {!!error && <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
              <Ionicons name="alert-circle-outline" size={19} color="#A12630" /><Text style={type(styles.errorText)}>{error}</Text>
            </View>}
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: submitting, busy: submitting }} disabled={submitting} onPress={submit} style={[styles.submit, submitting && { opacity: .65 }]}>
              {submitting ? <ActivityIndicator color="#FFF" /> : <><Text style={type(styles.submitText)}>{isRegister ? 'Criar empresa e conta' : 'Entrar no ObraSync'}</Text><Ionicons name="arrow-forward" size={21} color="#FFF" /></>}
            </TouchableOpacity>
            {!isRegister && <TouchableOpacity accessibilityRole="button" style={styles.help} onPress={() => Alert.alert('Ajuda para acessar', 'Selecione o perfil cadastrado para você e use seu e-mail e senha. Se ainda não recebeu seu acesso ou esqueceu a senha, procure o Gestor da sua empresa.')}>
              <Ionicons name="help-circle-outline" size={17} color={colors.muted} /><Text style={type(styles.helpText)}>Precisa de ajuda para entrar?</Text>
            </TouchableOpacity>}
            <View style={styles.divider} />
            <View style={styles.registerRow}>
              <View style={{ flex: 1 }}><Text style={type(styles.registerTitle)}>{isRegister ? 'Já tem uma conta?' : 'Primeiro acesso da empresa?'}</Text>
                <Text style={type(styles.registerSub)}>{isRegister ? 'Entre com seu perfil cadastrado.' : 'Comece pelo cadastro do Gestor.'}</Text></View>
              <TouchableOpacity disabled={submitting} accessibilityRole="button" accessibilityLabel={isRegister ? 'Voltar ao login' : 'Cadastrar empresa'} onPress={() => changeMode(!isRegister)} style={styles.registerButton}>
                <Text style={type(styles.registerLink)}>{isRegister ? 'Entrar' : 'Cadastrar'}</Text><Ionicons name="arrow-up-outline" size={17} color={colors.navy} style={{ transform: [{ rotate: '45deg' }] }} />
              </TouchableOpacity>
            </View>
            <View style={styles.footer}><View style={styles.footerLine} /><Text style={styles.footerText}>PLANENGEN  /  OBRASYNC</Text><View style={styles.footerLine} /></View>
          </View>
        </SafeAreaView>
      </KeyboardScrollView>
    </View>
    <Modal visible={profileOpen} transparent animationType="fade" onRequestClose={() => setProfileOpen(false)} statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} accessibilityRole="button" accessibilityLabel="Fechar seleção de perfil" onPress={() => setProfileOpen(false)} />
        <SafeAreaView edges={['bottom', 'left', 'right']} accessibilityViewIsModal style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeading}><View style={{ flex: 1 }}><Text accessibilityRole="header" style={type(styles.title)}>Como você acessa?</Text><Text style={type(styles.subtitle)}>Escolha o perfil cadastrado para você.</Text></View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar seleção de perfil" onPress={() => setProfileOpen(false)} style={styles.close}><Ionicons name="close" size={24} color={colors.navy} /></TouchableOpacity></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.profileList}>
            {ROLE_OPTIONS.map(item => <TouchableOpacity key={item} accessibilityRole="radio" accessibilityState={{ checked: role === item }}
              onPress={() => { setRole(item); setError(''); setProfileOpen(false); }} style={[styles.profileOption, role === item && styles.profileSelected]}>
              <View style={styles.profileIcon}><Ionicons name={PROFILES[item].icon} size={23} color={colors.blue} /></View>
              <View style={{ flex: 1 }}><Text style={type(styles.optionTitle)}>{ROLE_LABELS[item]}</Text><Text style={type(styles.optionDescription)}>{PROFILES[item].description}</Text></View>
              <Ionicons name={role === item ? 'checkmark-circle' : 'chevron-forward'} size={21} color={role === item ? colors.blue : '#97A2B2'} />
            </TouchableOpacity>)}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  </View>;
}
