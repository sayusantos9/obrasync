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
  BUDGET_ITEM_CATEGORIES,
  BUDGET_ITEM_UNITS,
  validatePositiveNumber,
} from '../utils/budgetItems';
import { addBudgetItemStyles as styles } from './AddBudgetItemScreen.styles';

const DEFAULT_VALUES = {
  category: BUDGET_ITEM_CATEGORIES[0],
  description: '',
  quantity: '1',
  unit: BUDGET_ITEM_UNITS[0],
  unitPrice: '',
};

export function AddBudgetItemScreen() {
  const { addBudgetItem, goBack, selectedProject } = useApp();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: DEFAULT_VALUES });

  async function handleSaveBudgetItem(formValues) {
    try {
      await addBudgetItem(formValues);
      Alert.alert(
        'Item adicionado',
        `O item foi incluído no orçamento de ${selectedProject.name}.`,
        [{ text: 'Concluir', onPress: goBack }],
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível adicionar o item ao orçamento.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Adicionar item ao orçamento" />
      <Scroll>
        <Content>
          <Text style={styles.introText}>
            Informe o item que fará parte do orçamento da obra ativa.
          </Text>

          <View style={styles.projectCard}>
            <Ionicons name="business-outline" size={22} color={theme.colors.primary} />
            <View style={styles.projectInfo}>
              <Text style={styles.projectLabel}>OBRA ATIVA</Text>
              <Text style={styles.projectName}>{selectedProject.name}</Text>
            </View>
          </View>

          <FormField
            control={control}
            name="description"
            label="ITEM / DESCRIÇÃO"
            rules={{ required: 'Informe o item do orçamento.' }}
            placeholder="Ex.: Cimento CP II 50 kg"
          />

          <Text style={styles.sectionLabel}>CATEGORIA</Text>
          <ChoiceChips
            control={control}
            name="category"
            options={BUDGET_ITEM_CATEGORIES}
          />

          <Text style={styles.sectionLabel}>UNIDADE</Text>
          <ChoiceChips control={control} name="unit" options={BUDGET_ITEM_UNITS} />

          <View style={styles.row}>
            <FormField
              control={control}
              name="quantity"
              label="QUANTIDADE"
              rules={{ validate: validatePositiveNumber }}
              keyboardType="decimal-pad"
              containerStyle={styles.halfField}
            />
            <FormField
              control={control}
              name="unitPrice"
              label="PREÇO UNITÁRIO (R$)"
              rules={{ validate: validatePositiveNumber }}
              keyboardType="decimal-pad"
              placeholder="0,00"
              containerStyle={styles.halfField}
            />
          </View>

          <TouchableOpacity
            disabled={isSubmitting}
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit(handleSaveBudgetItem)}
          >
            <Ionicons name="add-circle" size={22} color={theme.colors.primaryDark} />
            <Text style={styles.submitText}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar ao orçamento'}
            </Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}
