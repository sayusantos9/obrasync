import { Ionicons } from '@expo/vector-icons';
import { Alert, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useForm } from 'react-hook-form';
import { ChoiceChips } from '../components/forms/ChoiceChips';
import { FormField } from '../components/forms/FormField';
import { InventoryScreen, useInventoryTheme, useInventoryStyles } from '../components/layout/InventoryScreen';
import { useApp } from '../contexts/AppContext';
import { parseCurrencyInput } from '../utils/currency';
import {
  EXPENSE_CATEGORIES,
  getTodayIsoDate,
  validateExpenseAmount,
  validateExpenseDate,
} from '../utils/expenses';
import { makeAddExpenseStyles } from './AddExpenseScreen.styles';

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
  const theme=useInventoryTheme();
  const styles=useInventoryStyles(makeAddExpenseStyles(theme));
  const {width,fontScale}=useWindowDimensions();
  const compact=width<360 || fontScale*(theme.fontScale||1)>1.2;
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
        expenseDate: formValues.date,
      });

      Alert.alert(
        'Despesa adicionada',
        `${savedExpense.name} foi registrada em ${selectedProject?.name}.`,
        [{ text: 'Concluir', onPress: goBack }],
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a despesa.');
    }
  }

  return (
    <InventoryScreen title="Adicionar despesa" bottomTabs={false}>
          <Text style={styles.introText}>
            Registre os custos adicionais da obra. Evite repetir despesas já incluídas nas compras.
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

          <View style={[styles.row,compact&&{flexDirection:'column'}]}>
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
              <Ionicons name="cloud-offline" size={20} color={theme.colors.accent} />
              <Text style={styles.offlineText}>
                Conecte-se à internet para salvar a despesa.
              </Text>
            </View>
          )}

          <TouchableOpacity
            accessibilityRole="button" disabled={isSubmitting || isOffline}
            onPress={handleSubmit(handleSaveExpense)}
            style={[styles.submitButton, (isSubmitting || isOffline) && styles.disabledButton]}
          >
            <Ionicons name="add-circle" size={22} color="#FFFFFF" />
            <Text style={styles.submitText}>
              {isSubmitting ? 'Salvando...' : 'Adicionar despesa'}
            </Text>
          </TouchableOpacity>
        </InventoryScreen>
  );
}
