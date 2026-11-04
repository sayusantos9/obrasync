import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useController, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { useApp } from '../contexts/AppContext';
import { ROLE_ACCESS, ROLE_LABELS, USER_ROLES } from '../data/authData';

const DEFAULT_VALUES = { name: '', email: '', password: '' };
const MEMBER_ROLES = [USER_ROLES.ENGINEERING, USER_ROLES.PURCHASING, USER_ROLES.REQUESTER, USER_ROLES.CLIENT];
const ROLE_ICONS = { ENGINEERING: 'calculator-outline', PURCHASING: 'cube-outline', REQUESTER: 'construct-outline', CLIENT: 'eye-outline' };
const NAVY = '#010028';
const LOGO = require('../assets/brand/planengen-light.png');

function MemberField({ control, name, label, rules, icon, inputRef, colors, scale, trailing, ...props }) {
  const { field: { value, onBlur, onChange, ref }, fieldState: { error } } = useController({ control, name, rules });
  const [focused, setFocused] = useState(false);
  return <View style={styles.field}>
    <Text style={[styles.fieldLabel, { color: colors.text, fontSize: 13 * scale }]}>{label}</Text>
    <View style={[styles.inputContainer, { borderColor: error ? '#B42318' : focused ? colors.blue : colors.border }]}>
      <Ionicons name={icon} size={20} color={colors.muted}/>
      <TextInput {...props} ref={node => { ref(node); if (inputRef) inputRef.current = node; }} accessibilityLabel={label}
        autoCorrect={false} onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); onBlur(); }} onChangeText={onChange}
        placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, fontSize: 15 * scale }]} value={value == null ? '' : String(value)}/>
      {trailing}
    </View>
    {!!error?.message && <Text accessibilityRole="alert" style={[styles.error, { fontSize: 12 * scale }]}>{error.message}</Text>}
  </View>;
}

export function CreateMemberScreen() {
  const { createMember, goBack, currentUser, accessibilitySettings } = useApp();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scale = theme.fontScale || 1;
  const colors = { text: accessibilitySettings?.highContrast ? '#000000' : '#202020', muted: accessibilitySettings?.highContrast ? '#343434' : '#575D6B', border: accessibilitySettings?.highContrast ? '#707070' : '#D9DFE8', blue: accessibilitySettings?.highContrast ? '#003F85' : '#0066BE' };
  const text = (style, color = colors.text) => [style, { color, fontSize: style.fontSize * scale }];
  const [role, setRole] = useState(USER_ROLES.REQUESTER);
  const [showPassword, setShowPassword] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const saving = useRef(false);
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: DEFAULT_VALUES });
  async function save(values) {
    if (saving.current) return;
    saving.current = true;
    try {
      const member = await createMember({ ...values, role });
      Alert.alert('Usuário cadastrado', `${member.name} já pode entrar no ObraSync como ${ROLE_LABELS[member.role]}.`, [
        { text: 'Cadastrar outro', onPress: () => { reset(DEFAULT_VALUES); setRole(USER_ROLES.REQUESTER); setShowPassword(false); scrollRef.current?.scrollTo({ y: 0, animated: !accessibilitySettings?.reduceMotion }); } },
        { text: 'Concluir', onPress: goBack },
      ]);
    } catch (error) {
      Alert.alert('Não foi possível cadastrar', error.message);
    } finally { saving.current = false; }
  }
  const fieldProps = { control, colors, scale, editable: !isSubmitting };
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.brand}><Image source={LOGO} resizeMode="contain" accessibilityLabel="Planengen" style={styles.logo}/><Text style={text(styles.brandLabel, '#B8C9E4')}>EQUIPE</Text></View>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={goBack} style={styles.back}><Ionicons name="arrow-back" size={23} color="#FFFFFF"/></TouchableOpacity>
        <Text accessibilityRole="header" style={[text(styles.title, '#FFFFFF'), { flex: 1 }]}>Cadastrar usuário</Text>
      </View>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} scrollEventThrottle={16}
          onScroll={event => setShowScrollTop(event.nativeEvent.contentOffset.y > 300)}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 110 + insets.bottom }}>
          <Text style={text(styles.eyebrow, colors.blue)}>NOVO ACESSO</Text>
          <Text style={text(styles.introTitle, NAVY)}>Sua equipe, conectada.</Text>
          <Text style={text(styles.description, colors.muted)}>Preencha os dados e escolha o que esta pessoa poderá acessar.</Text>
          {!!currentUser?.companyName && <View style={styles.company}><Ionicons name="business-outline" size={17} color={colors.blue}/><Text style={[text(styles.companyText, colors.muted), { flex: 1 }]}>{currentUser.companyName}</Text></View>}
          <View style={[styles.formCard, { borderColor: colors.border }]}>
            <View style={styles.sectionHeading}><View style={styles.step}><Text style={text(styles.stepText, colors.blue)}>01</Text></View><Text accessibilityRole="header" style={text(styles.sectionTitle, NAVY)}>Dados de acesso</Text></View>
            <Text style={text(styles.hint, colors.muted)}>Todos os campos são obrigatórios.</Text>
            <MemberField {...fieldProps} name="name" label="Nome completo" icon="person-outline" placeholder="Nome e sobrenome"
              autoCapitalize="words" autoComplete="off" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
              rules={{ required: 'Informe o nome.', validate: value => Boolean(value.trim()) || 'Informe o nome.' }}/>
            <MemberField {...fieldProps} name="email" label="E-mail" icon="mail-outline" placeholder="usuario@empresa.com" inputRef={emailRef}
              autoCapitalize="none" autoComplete="off" keyboardType="email-address" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()}
              rules={{ required: 'Informe o e-mail.', pattern: { value: /\S+@\S+\.\S+/, message: 'Informe um e-mail válido.' } }}/>
            <MemberField {...fieldProps} name="password" label="Senha inicial" icon="lock-closed-outline" placeholder="Mínimo 6 caracteres" inputRef={passwordRef}
              autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" secureTextEntry={!showPassword}
              rules={{ required: 'Informe uma senha.', minLength: { value: 6, message: 'Use pelo menos 6 caracteres.' } }}
              trailing={<TouchableOpacity accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setShowPassword(value => !value)} style={styles.eye}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.muted}/></TouchableOpacity>}/>
          </View>
          <View style={[styles.sectionHeading, { marginTop: 26 }]}><View style={styles.step}><Text style={text(styles.stepText, colors.blue)}>02</Text></View><Text accessibilityRole="header" style={text(styles.sectionTitle, NAVY)}>Perfil de acesso</Text></View>
          <Text style={[text(styles.hint, colors.muted), { marginBottom: 16 }]}>Selecione um perfil para este usuário.</Text>
          <View accessibilityLabel="Perfil de acesso" accessibilityRole="radiogroup">
            {MEMBER_ROLES.map(option => {
              const selected = role === option;
              return <TouchableOpacity key={option} accessibilityRole="radio" accessibilityLabel={`${ROLE_LABELS[option]}. ${ROLE_ACCESS[option]}`}
                accessibilityState={{ checked: selected, disabled: isSubmitting }} disabled={isSubmitting} onPress={() => setRole(option)}
                style={[styles.roleCard, { borderColor: selected ? colors.blue : colors.border, backgroundColor: selected ? '#EEF6FF' : '#FFFFFF' }]}>
                <View style={[styles.roleIcon, selected && { backgroundColor: '#DCEEFF' }]}><Ionicons name={ROLE_ICONS[option]} size={22} color={colors.blue}/></View>
                <View style={styles.roleInfo}><Text style={text(styles.roleTitle, NAVY)}>{ROLE_LABELS[option]}</Text><Text style={text(styles.roleDescription, colors.muted)}>{ROLE_ACCESS[option]}</Text></View>
                <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.blue : colors.muted}/>
              </TouchableOpacity>;
            })}
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cadastrar usuário" accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
            disabled={isSubmitting} onPress={handleSubmit(save)} style={[styles.submit, isSubmitting && { opacity: 0.65 }]}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF"/> : <Ionicons name="person-add-outline" size={21} color="#FFFFFF"/>}
            <Text style={text(styles.submitText, '#FFFFFF')}>{isSubmitting ? 'Cadastrando...' : 'Cadastrar usuário'}</Text>
          </TouchableOpacity>
          <Text style={text(styles.bottomHint, colors.muted)}>O acesso será vinculado à sua empresa, com as permissões do perfil escolhido.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      {showScrollTop && <TouchableOpacity accessibilityLabel="Voltar ao topo" accessibilityRole="button"
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: !accessibilitySettings?.reduceMotion })} style={[styles.scrollTop, { bottom: 92 + insets.bottom }]}>
        <Ionicons name="arrow-up" size={23} color="#FFFFFF"/>
      </TouchableOpacity>}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: NAVY },
  brand: { paddingHorizontal: 22, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  logo: { width: 120, height: 35, flexShrink: 1 }, brandLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 16 },
  back: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 23, fontWeight: '700', letterSpacing: -0.5 },
  keyboard: { flex: 1, backgroundColor: '#EEF0F2', borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '700' },
  introTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.6, marginTop: 9 },
  description: { fontSize: 14, marginTop: 8, lineHeight: 22 },
  company: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 4 }, companyText: { fontSize: 12 },
  formCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderRadius: 18, padding: 18, marginTop: 22 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  step: { backgroundColor: '#E7F2FE', borderRadius: 9, padding: 8 }, stepText: { fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '700', flexShrink: 1 }, hint: { fontSize: 12, marginTop: 8 },
  field: { marginTop: 20 }, fieldLabel: { fontWeight: '600', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, minHeight: 54, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  input: { flex: 1, minWidth: 0, paddingVertical: 14 }, eye: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: -8 },
  error: { color: '#B42318', marginTop: 6 },
  roleCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  roleIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF3F8', alignItems: 'center', justifyContent: 'center' },
  roleInfo: { flex: 1 }, roleTitle: { fontSize: 14, fontWeight: '700' }, roleDescription: { fontSize: 12, marginTop: 6 },
  submit: { minHeight: 56, padding: 16, backgroundColor: NAVY, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14 },
  submitText: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  bottomHint: { fontSize: 12, marginTop: 14, textAlign: 'center' },
  scrollTop: { position: 'absolute', right: 18, backgroundColor: NAVY, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
