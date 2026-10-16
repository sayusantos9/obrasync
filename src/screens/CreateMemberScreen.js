import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useController, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { ROLE_ACCESS, ROLE_LABELS, USER_ROLES } from '../data/authData';

const DEFAULT_VALUES = { name: '', email: '', password: '' };
const MEMBER_ROLES = [
  USER_ROLES.ENGINEERING,
  USER_ROLES.PURCHASING,
  USER_ROLES.REQUESTER,
  USER_ROLES.CLIENT,
];

const ROLE_ICONS = {
  [USER_ROLES.ENGINEERING]: 'calculator-outline',
  [USER_ROLES.PURCHASING]: 'cube-outline',
  [USER_ROLES.REQUESTER]: 'construct-outline',
  [USER_ROLES.CLIENT]: 'eye-outline',
};

function MemberField({ control, name, label, placeholder, rules, icon, ...inputProps }) {
  const theme = useTheme();
  const {
    field: { value, onBlur, onChange },
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      <View style={[
        styles.inputContainer,
        { borderColor: error ? theme.colors.danger : '#D9E5F7' },
      ]}>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          autoCorrect={false}
          onBlur={onBlur}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#98A3B5"
          style={[styles.input, { color: theme.colors.text }]}
          value={value == null ? '' : String(value)}
        />
        {icon}
      </View>
      {!!error?.message && (
        <Text accessibilityRole="alert" style={[styles.errorText, { color: theme.colors.danger }]}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

export function CreateMemberScreen() {
  const { createMember, goBack } = useApp();
  const [role, setRole] = useState(USER_ROLES.REQUESTER);
  const [showPassword, setShowPassword] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef(null);
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: DEFAULT_VALUES });

  async function save(values) {
    try {
      const member = await createMember({ ...values, role });
      Alert.alert(
        'Usuário cadastrado',
        `${member.name} já pode entrar no ObraSync como ${ROLE_LABELS[member.role]}.`,
        [
          { text: 'Cadastrar outro', onPress: () => { reset(DEFAULT_VALUES); setRole(USER_ROLES.REQUESTER); } },
          { text: 'Concluir', onPress: goBack },
        ],
      );
    } catch (error) {
      Alert.alert('Não foi possível cadastrar', error.message);
    }
  }

  function handleScroll(event) {
    setShowScrollTop(event.nativeEvent.contentOffset.y > 300);
  }

  return (
    <Screen>
      <ScreenHeader title="Cadastrar usuário" />
      <Scroll
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Content>
          <View style={styles.hero}>
            <View style={styles.heroPatternOuter} />
            <View style={styles.heroPatternInner} />
            <View style={styles.heroContent}>
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>GESTOR / MASTER</Text>
              </View>
              <Text style={styles.heroTitle}>Novo acesso da equipe</Text>
              <Text style={styles.heroText}>
                Cadastre uma pessoa por vez. O usuário é criado no Supabase e já pode entrar com o perfil escolhido.
              </Text>
            </View>
          </View>

          <MemberField
            control={control}
            icon={<Ionicons name="person-outline" size={20} color="#A8B2C2" />}
            label="NOME COMPLETO"
            name="name"
            placeholder="Nome do usuário"
            rules={{ required: 'Informe o nome.' }}
          />
          <MemberField
            autoCapitalize="none"
            control={control}
            icon={<Ionicons name="mail-outline" size={20} color="#A8B2C2" />}
            keyboardType="email-address"
            label="E-MAIL"
            name="email"
            placeholder="usuario@empresa.com"
            rules={{
              required: 'Informe o e-mail.',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Informe um e-mail válido.' },
            }}
          />
          <MemberField
            autoCapitalize="none"
            control={control}
            icon={(
              <TouchableOpacity
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                accessibilityRole="button"
                onPress={() => setShowPassword((visible) => !visible)}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#778398" />
              </TouchableOpacity>
            )}
            label="SENHA INICIAL"
            name="password"
            placeholder="Mínimo 6 caracteres"
            rules={{
              required: 'Informe uma senha.',
              minLength: { value: 6, message: 'Use pelo menos 6 caracteres.' },
            }}
            secureTextEntry={!showPassword}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Perfil de acesso</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>1 obrigatório</Text>
            </View>
          </View>
          <View accessibilityLabel="Perfil de acesso" accessibilityRole="radiogroup">
            {MEMBER_ROLES.map((option) => {
              const selected = role === option;
              return (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={option}
                  onPress={() => setRole(option)}
                  style={[styles.roleCard, selected && styles.roleCardSelected]}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>
                      {ROLE_LABELS[option]}
                    </Text>
                    <Text style={styles.roleDescription}>{ROLE_ACCESS[option]}</Text>
                  </View>
                  <Ionicons
                    name={ROLE_ICONS[option]}
                    size={18}
                    color={selected ? '#EA6A12' : '#9AA4B2'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleSubmit(save)}
            style={[styles.submitButton, isSubmitting && styles.disabled]}
          >
            <Text style={styles.submitText}>{isSubmitting ? 'Cadastrando...' : 'Cadastrar usuário'}</Text>
            {!isSubmitting && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </Content>
      </Scroll>
      {showScrollTop && (
        <TouchableOpacity
          accessibilityLabel="Voltar ao topo"
          accessibilityRole="button"
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          style={styles.scrollTop}
        >
          <Ionicons name="chevron-up" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#0B2A5B',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 4,
    minHeight: 166,
    overflow: 'hidden',
    padding: 20,
  },
  heroPatternOuter: {
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 96,
    borderWidth: 1,
    height: 192,
    position: 'absolute',
    right: -48,
    top: 30,
    width: 192,
  },
  heroPatternInner: {
    borderColor: 'rgba(234,106,18,0.5)',
    borderRadius: 64,
    borderWidth: 1,
    height: 128,
    position: 'absolute',
    right: -20,
    top: 62,
    width: 128,
  },
  heroContent: { zIndex: 1 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  badgeDot: { backgroundColor: '#EA6A12', borderRadius: 4, height: 7, marginRight: 7, width: 7 },
  badgeText: { color: '#D7E3F7', fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginBottom: 6 },
  heroText: { color: '#D9E7FF', fontSize: 13, lineHeight: 19 },
  field: { marginTop: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.7, marginBottom: 7, marginLeft: 4 },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 15,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 14 },
  errorText: { fontSize: 12, marginTop: 5 },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 25,
    paddingHorizontal: 3,
  },
  sectionTitle: { color: '#0F1E3A', fontSize: 20, fontWeight: '900' },
  requiredBadge: {
    backgroundColor: '#EEF3FF',
    borderColor: '#D9E5F7',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  requiredText: { color: '#0B2A5B', fontSize: 10, fontWeight: '700' },
  roleCard: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E7EF',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
  },
  roleCardSelected: { backgroundColor: '#FFF8F3', borderColor: '#EA6A12', borderWidth: 2 },
  radio: {
    alignItems: 'center',
    borderColor: '#C9D0DA',
    borderRadius: 12,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
    width: 22,
  },
  radioSelected: { borderColor: '#EA6A12' },
  radioDot: { backgroundColor: '#EA6A12', borderRadius: 6, height: 11, width: 11 },
  roleInfo: { flex: 1, marginRight: 8 },
  roleTitle: { color: '#263246', fontSize: 14, fontWeight: '800', lineHeight: 20 },
  roleTitleSelected: { color: '#EA6A12' },
  roleDescription: { color: '#68758A', fontSize: 11, lineHeight: 16, marginTop: 4 },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#EA6A12',
    borderRadius: 17,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 26,
    marginTop: 12,
    minHeight: 56,
    shadowColor: '#EA6A12',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', marginRight: 9 },
  disabled: { opacity: 0.6 },
  scrollTop: {
    alignItems: 'center',
    backgroundColor: '#EA6A12',
    borderRadius: 24,
    bottom: 98,
    elevation: 5,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    width: 48,
  },
});
