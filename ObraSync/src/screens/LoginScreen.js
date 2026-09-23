import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { TEST_LOGIN_HINTS } from '../data/authData';
import { theme } from '../theme';

export function LoginScreen() {
  const { login } = useApp();
  const [email, setEmail] = useState('admin@obrasync.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const result = await login({ email, password });
      if (!result) setError('E-mail ou senha inválidos. Use uma das contas de teste abaixo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function useTestAccount(account) {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  }

  return (
    <Screen>
      <Scroll contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandBox}>
          <View style={styles.logoMark}>
            <Ionicons name="construct" size={31} color={theme.colors.accent} />
          </View>
          <Text style={styles.brand}>Obra<Text style={styles.brandAccent}>Sync</Text></Text>
          <Text style={styles.subtitle}>Gestão de obras, orçamentos e materiais em um só lugar.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.caption}>Use uma conta de teste para validar cada nível de acesso.</Text>

          <Text style={styles.label}>E-MAIL</Text>
          <View style={styles.inputShell}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="usuario@empresa.com"
              placeholderTextColor="#968E99"
              style={styles.input}
              value={email}
            />
          </View>

          <Text style={styles.label}>SENHA</Text>
          <View style={styles.inputShell}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />
            <TextInput
              onChangeText={setPassword}
              placeholder="******"
              placeholderTextColor="#968E99"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity disabled={isSubmitting} onPress={handleLogin} style={styles.loginButton}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginText}>Entrar no ObraSync</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.testCard}>
          <Text style={styles.testTitle}>Contas de teste</Text>
          <Text style={styles.testHint}>Senha de todas: 123456</Text>
          {TEST_LOGIN_HINTS.map((account) => (
            <TouchableOpacity
              key={account.email}
              onPress={() => useTestAccount(account)}
              style={styles.accountRow}
            >
              <View style={styles.accountIcon}>
                <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountRole}>{account.roleLabel}</Text>
                <Text style={styles.accountEmail}>{account.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 50 },
  brandBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
    paddingBottom: 36,
    paddingHorizontal: 28,
    paddingTop: 64,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,.12)',
    borderRadius: 22,
    height: 64,
    justifyContent: 'center',
    marginBottom: 14,
    width: 64,
  },
  brand: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  brandAccent: { color: theme.colors.accent },
  subtitle: {
    color: 'rgba(255,255,255,.72)',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 340,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: -18,
    padding: 20,
  },
  title: { color: theme.colors.text, fontSize: 25, fontWeight: '900' },
  caption: { color: theme.colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  label: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
    marginTop: 18,
  },
  inputShell: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 55,
    paddingHorizontal: 14,
  },
  input: { color: theme.colors.text, flex: 1, fontSize: 15, marginLeft: 10, paddingVertical: 13 },
  error: { color: theme.colors.danger, fontSize: 12, lineHeight: 18, marginTop: 12 },
  loginButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 56,
  },
  loginText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', marginRight: 8 },
  testCard: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
  },
  testTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '900' },
  testHint: { color: theme.colors.textMuted, fontSize: 12, marginBottom: 8, marginTop: 3 },
  accountRow: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  accountIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  accountInfo: { flex: 1, marginLeft: 10 },
  accountRole: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  accountEmail: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },
});
