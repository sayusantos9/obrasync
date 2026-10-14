import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { LineItemsEditor } from '../components/documents/LineItemsEditor';
import { CalendarField } from '../components/forms/CalendarField';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { theme } from '../theme';

const DEFAULT_VALUES = {
  title: '',
  clientName: '',
  clientDocument: '',
  supplierName: '',
  supplierDocument: '',
  supplierContact: '',
  supplierEmail: '',
  validUntil: '',
  paymentTerms: '',
  notes: '',
};

export function CreateQuoteScreen() {
  const { addQuote, goBack, selectedProject } = useApp();
  const [items, setItems] = useState([]);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: DEFAULT_VALUES });

  async function handleSave(formValues) {
    if (!items.length) {
      Alert.alert('Cotação sem itens', 'Adicione pelo menos um material ou serviço.');
      return;
    }

    try {
      const quote = await addQuote({ ...formValues, items });
      Alert.alert(
        'Cotação criada',
        `${quote.number} foi salva com ${quote.items.length} item(ns).`,
        [{ text: 'Concluir', onPress: goBack }],
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a cotação.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Nova cotação" />
      <Scroll>
        <Content>
          <View style={styles.projectCard}>
            <Text style={styles.projectLabel}>OBRA</Text>
            <Text style={styles.projectName}>{selectedProject.name}</Text>
          </View>

          <Text style={styles.sectionTitle}>Identificação</Text>
          <FormField
            control={control}
            name="title"
            label="TÍTULO / REFERÊNCIA"
            placeholder="Ex.: Cotação de materiais elétricos"
            rules={{ required: 'Informe um título.' }}
          />

          <Text style={styles.sectionTitle}>Cliente</Text>
          <FormField control={control} name="clientName" label="NOME / RAZÃO SOCIAL" placeholder="Cliente" rules={{ required: 'Informe o cliente.' }} />
          <FormField control={control} name="clientDocument" label="CPF / CNPJ" placeholder="00.000.000/0001-00" />

          <Text style={styles.sectionTitle}>Fornecedor</Text>
          <FormField control={control} name="supplierName" label="NOME / RAZÃO SOCIAL" placeholder="Fornecedor" rules={{ required: 'Informe o fornecedor.' }} />
          <FormField control={control} name="supplierDocument" label="CNPJ" placeholder="00.000.000/0001-00" />
          <FormField control={control} name="supplierContact" label="CONTATO" placeholder="Nome ou telefone" />
          <FormField
            autoCapitalize="none"
            control={control}
            keyboardType="email-address"
            name="supplierEmail"
            label="E-MAIL"
            placeholder="vendas@fornecedor.com"
            rules={{ pattern: { value: /^$|\S+@\S+\.\S+$/, message: 'Informe um e-mail válido.' } }}
          />

          <CalendarField control={control} name="validUntil" label="VALIDADE DA COTAÇÃO" rules={{ required: 'Informe a validade.' }} />
          <FormField control={control} name="paymentTerms" label="CONDIÇÃO DE PAGAMENTO" placeholder="Ex.: 30 dias / PIX / boleto" />

          <LineItemsEditor items={items} onChange={setItems} title="Materiais cotados" />

          <FormField control={control} multiline name="notes" label="OBSERVAÇÕES" placeholder="Prazo de entrega, frete e demais condições" />

          <TouchableOpacity disabled={isSubmitting} onPress={handleSubmit(handleSave)} style={[styles.saveButton, isSubmitting && styles.disabled]}>
            <Text style={styles.saveText}>{isSubmitting ? 'Salvando...' : 'Salvar cotação'}</Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  projectCard: { backgroundColor: theme.colors.primarySoft, borderRadius: 16, marginTop: 20, padding: 16 },
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
