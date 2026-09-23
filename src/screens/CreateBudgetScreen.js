import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarField } from '../components/forms/CalendarField';
import { FormField } from '../components/forms/FormField';
import { LineItemsEditor } from '../components/documents/LineItemsEditor';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { theme } from '../theme';

const DEFAULT_VALUES = {
  title: '',
  clientName: '',
  clientDocument: '',
  clientEmail: '',
  clientPhone: '',
  validUntil: '',
  notes: '',
};

export function CreateBudgetScreen() {
  const { addBudgetDocument, goBack, selectedProject } = useApp();
  const [items, setItems] = useState([]);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: DEFAULT_VALUES });

  async function handleSave(formValues) {
    if (!items.length) {
      Alert.alert('Orçamento sem itens', 'Adicione pelo menos um material ou serviço.');
      return;
    }

    try {
      await addBudgetDocument({ ...formValues, items });
      Alert.alert(
        'Orçamento criado',
        `O orçamento de ${formValues.clientName} foi salvo em ${selectedProject.name}.`,
        [{ text: 'Concluir', onPress: goBack }],
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o orçamento.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Criar orçamento" />
      <Scroll>
        <Content>
          <View style={styles.projectCard}>
            <Text style={styles.projectLabel}>OBRA ATIVA</Text>
            <Text style={styles.projectName}>{selectedProject.name}</Text>
          </View>

          <Text style={styles.sectionTitle}>Dados do orçamento</Text>
          <FormField
            control={control}
            name="title"
            label="TÍTULO / REFERÊNCIA"
            placeholder="Ex.: Orçamento reforma bloco A"
            rules={{ required: 'Informe um título.' }}
          />

          <Text style={styles.sectionTitle}>Cliente</Text>
          <FormField
            control={control}
            name="clientName"
            label="NOME / RAZÃO SOCIAL"
            placeholder="Nome do cliente"
            rules={{ required: 'Informe o cliente.' }}
          />
          <FormField control={control} name="clientDocument" label="CPF / CNPJ" placeholder="00.000.000/0001-00" />
          <FormField
            autoCapitalize="none"
            control={control}
            keyboardType="email-address"
            name="clientEmail"
            label="E-MAIL"
            placeholder="cliente@email.com"
            rules={{ pattern: { value: /^$|\S+@\S+\.\S+$/, message: 'Informe um e-mail válido.' } }}
          />
          <FormField control={control} keyboardType="phone-pad" name="clientPhone" label="TELEFONE" placeholder="(98) 99999-9999" />

          <CalendarField
            control={control}
            name="validUntil"
            label="VALIDADE DO ORÇAMENTO"
            rules={{ required: 'Informe a validade.' }}
          />

          <LineItemsEditor items={items} onChange={setItems} title="Materiais e serviços" />

          <FormField
            control={control}
            multiline
            name="notes"
            label="OBSERVAÇÕES"
            placeholder="Condições, prazo, forma de pagamento e demais observações"
          />

          <TouchableOpacity
            disabled={isSubmitting}
            onPress={handleSubmit(handleSave)}
            style={[styles.saveButton, isSubmitting && styles.disabled]}
          >
            <Text style={styles.saveText}>{isSubmitting ? 'Salvando...' : 'Salvar orçamento'}</Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  projectCard: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 16,
    marginTop: 20,
    padding: 16,
  },
  projectLabel: { color: theme.colors.primary, fontSize: 11, fontWeight: '900' },
  projectName: { color: theme.colors.primaryDark, fontSize: 16, fontWeight: '900', marginTop: 4 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '900', marginTop: 24 },
  saveButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    marginBottom: 26,
    marginTop: 24,
    minHeight: 56,
  },
  disabled: { opacity: 0.55 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
