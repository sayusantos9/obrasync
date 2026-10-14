import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { theme } from '../theme';

const DEFAULT_VALUES = { name: '', document: '', email: '' };

export function CreateCompanyScreen() {
  const { createCompany, goBack } = useApp();
  const { control, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: DEFAULT_VALUES });

  async function save(values) {
    try {
      await createCompany(values);
      Alert.alert('Empresa cadastrada', 'O cadastro foi adicionado à demonstração local.', [{ text: 'Concluir', onPress: goBack }]);
    } catch (error) {
      Alert.alert('Não foi possível cadastrar', error.message);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Cadastrar empresa" />
      <Scroll>
        <Content>
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>PASSO 1</Text>
            <Text style={styles.heroTitle}>Dados da empresa</Text>
            <Text style={styles.heroText}>Cadastre os dados essenciais. Funcionários são adicionados em uma etapa separada.</Text>
          </View>
          <FormField control={control} name="name" label="RAZÃO SOCIAL / NOME" placeholder="PLANENGEN Consultoria" rules={{ required: 'Informe o nome da empresa.' }} />
          <FormField control={control} name="document" label="CNPJ" placeholder="00.000.000/0001-00" />
          <FormField autoCapitalize="none" control={control} keyboardType="email-address" name="email" label="E-MAIL" placeholder="contato@empresa.com" rules={{ pattern: { value: /^$|\S+@\S+\.\S+$/, message: 'Informe um e-mail válido.' } }} />
          <TouchableOpacity disabled={isSubmitting} onPress={handleSubmit(save)} style={[styles.button, isSubmitting && styles.disabled]}>
            <Text style={styles.buttonText}>{isSubmitting ? 'Salvando...' : 'Salvar empresa'}</Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: theme.colors.primarySoft, borderRadius: 18, marginTop: 18, padding: 16 },
  heroLabel: { color: theme.colors.accent, fontSize: 10, fontWeight: '900' },
  heroTitle: { color: theme.colors.primaryDark, fontSize: 20, fontWeight: '900', marginTop: 5 },
  heroText: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  button: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 16, justifyContent: 'center', marginBottom: 28, marginTop: 24, minHeight: 56 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  disabled: { opacity: 0.55 },
});
