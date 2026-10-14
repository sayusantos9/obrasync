import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarField } from '../components/forms/CalendarField';
import { FormField } from '../components/forms/FormField';
import { LineItemsEditor } from '../components/documents/LineItemsEditor';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { USER_ROLES } from '../data/authData';
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
  const { addBudgetDocument, goBack, members, selectedProject } = useApp();
  const [items, setItems] = useState([]);
  const [clientUserId, setClientUserId] = useState(null);
  const { control, handleSubmit, setValue, formState: { isSubmitting } } = useForm({ defaultValues: DEFAULT_VALUES });

  const clients = useMemo(
    () => members.filter((member) => member.role === USER_ROLES.CLIENT && member.active !== false),
    [members],
  );

  function selectClient(client) {
    setClientUserId(client.id);
    setValue('clientName', client.name);
    setValue('clientEmail', client.email);
  }

  async function handleSave(formValues) {
    if (!selectedProject) {
      Alert.alert('Selecione uma obra', 'Escolha uma obra antes de criar o orçamento.');
      return;
    }
    if (!clientUserId) {
      Alert.alert('Cliente obrigatório', 'Selecione um Cliente cadastrado pelo Gestor para que o orçamento apareça na conta dele.');
      return;
    }
    if (!items.length) {
      Alert.alert('Orçamento sem itens', 'Adicione pelo menos um material ou serviço.');
      return;
    }

    try {
      await addBudgetDocument({ ...formValues, clientUserId, items });
      Alert.alert(
        'Orçamento criado',
        'O orçamento foi salvo no Supabase e já ficará visível para o Cliente vinculado.',
        [{ text: 'Concluir', onPress: goBack }],
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível criar o orçamento.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Criar orçamento" />
      <Scroll>
        <Content>
          <View style={styles.projectCard}>
            <Text style={styles.projectLabel}>OBRA ATIVA</Text>
            <Text style={styles.projectName}>{selectedProject?.name || 'Nenhuma obra selecionada'}</Text>
          </View>

          <Text style={styles.sectionTitle}>Dados do orçamento</Text>
          <FormField
            control={control}
            name="title"
            label="TÍTULO / REFERÊNCIA"
            placeholder="Ex.: Orçamento reforma bloco A"
            rules={{ required: 'Informe um título.' }}
          />

          <Text style={styles.sectionTitle}>Cliente vinculado</Text>
          <Text style={styles.helper}>Escolha um cliente cadastrado pelo Gestor. É essa ligação que faz o orçamento aparecer na conta correta.</Text>
          {!clients.length && (
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>Nenhum Cliente cadastrado</Text>
              <Text style={styles.warningText}>O Gestor precisa cadastrar primeiro um usuário com o perfil Consulta/Cliente.</Text>
            </View>
          )}
          {clients.map((client) => {
            const selected = clientUserId === client.id;
            return (
              <TouchableOpacity key={client.id} onPress={() => selectClient(client)} style={[styles.clientCard, selected && styles.clientCardSelected]}>
                <View style={[styles.radio, selected && styles.radioSelected]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.clientName, selected && styles.clientNameSelected]}>{client.name}</Text>
                  <Text style={styles.clientEmail}>{client.email}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <FormField control={control} name="clientDocument" label="CPF / CNPJ" placeholder="00.000.000/0001-00" />
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
            <Text style={styles.saveText}>{isSubmitting ? 'Salvando...' : 'Salvar e enviar ao cliente'}</Text>
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
  helper: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  warningCard: { backgroundColor: theme.colors.accentSoft, borderRadius: 14, marginTop: 12, padding: 13 },
  warningTitle: { color: theme.colors.accent, fontSize: 12, fontWeight: '900' },
  warningText: { color: theme.colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  clientCard: { alignItems: 'center', backgroundColor: '#FFF', borderColor: theme.colors.border, borderRadius: 15, borderWidth: 1, flexDirection: 'row', marginTop: 9, padding: 13 },
  clientCardSelected: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
  radio: { borderColor: theme.colors.border, borderRadius: 9, borderWidth: 2, height: 18, marginRight: 10, width: 18 },
  radioSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  clientName: { color: theme.colors.text, fontSize: 13, fontWeight: '900' },
  clientNameSelected: { color: theme.colors.primary },
  clientEmail: { color: theme.colors.textMuted, fontSize: 10, marginTop: 2 },
  saveButton: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 16, justifyContent: 'center', marginBottom: 26, marginTop: 24, minHeight: 56 },
  disabled: { opacity: 0.55 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
