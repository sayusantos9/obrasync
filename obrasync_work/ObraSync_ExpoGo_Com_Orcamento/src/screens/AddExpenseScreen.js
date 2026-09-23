import { Ionicons } from '@expo/vector-icons';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { ChoiceChips } from '../components/forms/ChoiceChips';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { theme } from '../theme';
import {
  EXPENSE_CATEGORIES,
  getTodayIsoDate,
  parseCurrencyInput,
  validateExpenseAmount,
  validateExpenseDate,
} from '../utils/expenses';
import { addExpenseStyles as styles } from './AddExpenseScreen.styles';

function getDefaultExpenseForm() {
  return {
    name: '',
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    date: getTodayIsoDate(),
    supplier: '',
    notes: '',
  };
}

export function AddExpenseScreen() {
  const { selectedProject, isOffline, addExpense, goBack } = useApp();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: getDefaultExpenseForm() });

  async function handleSaveExpense(formValues) {
    try {
      const savedExpense = await addExpense({
        ...formValues,
        amount: parseCurrencyInput(formValues.amount),
      });

      Alert.alert(
        'Despesa adicionada',
        `${savedExpense.name} foi registrada em ${selectedProject.name}.`,
        [{ text: 'Concluir', onPress: goBack }],
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a despesa.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Adicionar despesa" />
      <Scroll>
        <Content>
          <Text style={styles.introText}>
            Registre uma despesa diretamente no contexto da obra selecionada.
          </Text>

          <View style={styles.projectCard}>
            <View style={styles.projectIcon}>
              <Ionicons name="business" size={21} color={theme.colors.primary} />
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectLabel}>OBRA ATIVA</Text>
              <Text style={styles.projectName}>{selectedProject.name}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
          </View>

          <FormField
            control={control}
            name="name"
            label="DESCRIÇÃO"
            rules={{ required: 'Informe a descrição da despesa.' }}
            placeholder="Ex.: Locação de betoneira"
          />

          <Text style={styles.sectionLabel}>CATEGORIA</Text>
          <ChoiceChips
            control={control}
            name="category"
            options={EXPENSE_CATEGORIES}
          />

          <View style={styles.row}>
            <FormField
              control={control}
              name="amount"
              label="VALOR (R$)"
              rules={{ validate: validateExpenseAmount }}
              keyboardType="decimal-pad"
              placeholder="0,00"
              containerStyle={styles.halfField}
            />
            <FormField
              control={control}
              name="date"
              label="DATA"
              rules={{ validate: validateExpenseDate }}
              placeholder="AAAA-MM-DD"
              containerStyle={styles.halfField}
            />
          </View>

          <FormField
            control={control}
            name="supplier"
            label="FORNECEDOR (OPCIONAL)"
            placeholder="Nome do fornecedor"
          />

          <FormField
            control={control}
            name="notes"
            label="OBSERVAÇÕES (OPCIONAL)"
            placeholder="Detalhes, referência ou justificativa"
            multiline
          />

          {isOffline && (
            <View style={styles.offlineNotice}>
              <Ionicons name="cloud-offline" size={20} color="#71540D" />
              <Text style={styles.offlineText}>
                A despesa será salva localmente e continuará visível no controle de custos.
              </Text>
            </View>
          )}

          <TouchableOpacity
            disabled={isSubmitting}
            onPress={handleSubmit(handleSaveExpense)}
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          >
            <Ionicons name="add-circle" size={22} color={theme.colors.primaryDark} />
            <Text style={styles.submitText}>
              {isSubmitting ? 'Salvando...' : 'Adicionar despesa'}
            </Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}
