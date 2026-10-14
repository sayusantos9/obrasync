import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { ROLE_ACCESS, ROLE_LABELS, USER_ROLES } from '../data/authData';
import { theme } from '../theme';

const DEFAULT_VALUES = { name: '', email: '', password: '' };
const MEMBER_ROLES = [
  USER_ROLES.ENGINEERING,
  USER_ROLES.PURCHASING,
  USER_ROLES.REQUESTER,
  USER_ROLES.CLIENT,
];

export function CreateMemberScreen() {
  const { createMember, goBack } = useApp();
  const [role, setRole] = useState(USER_ROLES.REQUESTER);
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

  return (
    <Screen>
      <ScreenHeader title="Cadastrar usuário" />
      <Scroll>
        <Content>
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>GESTOR / MASTER</Text>
            <Text style={styles.heroTitle}>Novo acesso da equipe</Text>
            <Text style={styles.heroText}>Cadastre uma pessoa por vez. O usuário é criado no Supabase e já pode entrar com o perfil escolhido.</Text>
          </View>

          <FormField control={control} name="name" label="NOME COMPLETO" placeholder="Nome do usuário" rules={{ required: 'Informe o nome.' }} />
          <FormField autoCapitalize="none" control={control} keyboardType="email-address" name="email" label="E-MAIL" placeholder="usuario@empresa.com" rules={{ required: 'Informe o e-mail.', pattern: { value: /\S+@\S+\.\S+/, message: 'Informe um e-mail válido.' } }} />
          <FormField control={control} name="password" label="SENHA INICIAL" placeholder="Mínimo 6 caracteres" secureTextEntry rules={{ required: 'Informe uma senha.', minLength: { value: 6, message: 'Use pelo menos 6 caracteres.' } }} />

          <Text style={styles.sectionTitle}>Perfil de acesso</Text>
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
                <View style={[styles.radio, selected && styles.radioSelected]} />
                <View style={styles.roleInfo}>
                  <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>{ROLE_LABELS[option]}</Text>
                  <Text style={styles.roleText}>{ROLE_ACCESS[option]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity disabled={isSubmitting} onPress={handleSubmit(save)} style={[styles.button, isSubmitting && styles.disabled]}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Cadastrando...' : 'Cadastrar usuário'}</Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.colors.primary, borderRadius: 18, marginTop: 18, padding: 16 },
  heroLabel: { color: '#A8C6E9', fontSize: 10, fontWeight: '900' },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 5 },
  heroText: { color: 'rgba(255,255,255,.75)', fontSize: 11, lineHeight: 17, marginTop: 5 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 24 },
  roleCard: { alignItems: 'flex-start', backgroundColor: '#FFFFFF', borderColor: theme.colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginTop: 9, padding: 13 },
  roleCardSelected: { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent },
  radio: { borderColor: theme.colors.border, borderRadius: 9, borderWidth: 2, height: 18, marginTop: 2, width: 18 },
  radioSelected: { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
  roleInfo: { flex: 1, marginLeft: 10 },
  roleTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '900' },
  roleTitleSelected: { color: theme.colors.accent },
  roleText: { color: theme.colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  button: { alignItems: 'center', backgroundColor: theme.colors.accent, borderRadius: 16, justifyContent: 'center', marginBottom: 28, marginTop: 24, minHeight: 56 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  disabled: { opacity: 0.55 },
});
