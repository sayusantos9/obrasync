import { Ionicons } from '@expo/vector-icons';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { theme } from '../theme';
import { requestMaterialStyles as styles } from './RequestMaterialScreen.styles';

const DEFAULT_REQUEST_FORM = {
  material: '',
  quantity: '',
  unit: '',
  neededAt: '',
  justification: '',
};

export function RequestMaterialScreen() {
  const { goBack, isOffline, submitRequest } = useApp();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: DEFAULT_REQUEST_FORM });

  async function handleSaveRequest(formValues) {
    try {
      const savedRequest = await submitRequest(formValues);
      reset(DEFAULT_REQUEST_FORM);
      Alert.alert(
        'Solicitação registrada',
        `${savedRequest.id}\n${savedRequest.status}`,
        [{ text: 'Concluir', onPress: goBack }],
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar a solicitação.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Solicitar material" />
      <Scroll>
        <Content>
          <Text style={styles.introText}>
            Informe a necessidade da obra. Campos obrigatórios são validados antes do envio.
          </Text>

          <FormField
            control={control}
            name="material"
            label="MATERIAL"
            placeholder="Ex.: Cimento CP II 50 kg"
            rules={{ required: 'Informe o material.' }}
          />

          <View style={styles.row}>
            <FormField
              control={control}
              name="quantity"
              label="QUANTIDADE"
              keyboardType="numeric"
              placeholder="120"
              rules={{
                required: 'Obrigatório.',
                validate: (quantity) => Number(quantity) > 0 || 'Valor inválido.',
              }}
              containerStyle={styles.halfField}
            />
            <FormField
              control={control}
              name="unit"
              label="UNIDADE"
              placeholder="saco"
              rules={{ required: 'Obrigatório.' }}
              containerStyle={styles.halfField}
            />
          </View>

          <FormField
            control={control}
            name="neededAt"
            label="DATA NECESSÁRIA"
            placeholder="18/09/2026"
            rules={{ required: 'Informe a data.' }}
          />

          <FormField
            control={control}
            name="justification"
            label="JUSTIFICATIVA"
            placeholder="Explique onde o material será utilizado"
            rules={{
              required: 'Informe a justificativa.',
              minLength: { value: 8, message: 'Use pelo menos 8 caracteres.' },
            }}
            multiline
          />

          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="camera-outline" size={22} color={theme.colors.primary} />
            <Text style={styles.attachmentText}>Adicionar foto ou documento</Text>
          </TouchableOpacity>

          {isOffline && (
            <View style={styles.offlineNotice}>
              <Ionicons name="cloud-offline" size={20} color="#71540D" />
              <Text style={styles.offlineText}>
                Sem conexão: a solicitação ficará salva no aparelho para sincronização posterior.
              </Text>
            </View>
          )}

          <TouchableOpacity
            disabled={isSubmitting}
            onPress={handleSubmit(handleSaveRequest)}
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Salvando...' : 'Enviar solicitação'}
            </Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}
