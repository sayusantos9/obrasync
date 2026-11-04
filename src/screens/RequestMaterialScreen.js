import { Ionicons } from '@expo/vector-icons';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { CalendarField } from '../components/forms/CalendarField';
import { FormField } from '../components/forms/FormField';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { theme } from '../theme';
import { requestMaterialStyles as styles } from './RequestMaterialScreen.styles';
import { parseDecimal } from '../utils/bdi';
import { useRef } from 'react';
import { operationId } from '../services/requestQueue';

const DEFAULT_REQUEST_FORM = {
  material: '',
  quantity: '',
  unit: '',
  neededAt: '',
  justification: '',
};

export function RequestMaterialScreen() {
  const { goBack, isOffline, submitMaterialRequest } = useApp();
  const requestId=useRef(operationId());
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: DEFAULT_REQUEST_FORM });

  async function handleSaveRequest(formValues) {
    try {
      const savedRequest = await submitMaterialRequest({...formValues,clientRequestId:requestId.current,quantity:parseDecimal(formValues.quantity)});
      requestId.current=operationId();
      reset(DEFAULT_REQUEST_FORM);
      Alert.alert(
        savedRequest.status==='QUEUED'?'Solicitação na fila do aparelho':'Solicitação salva no Supabase',
        savedRequest.status==='QUEUED'?`Abra Mais → Solicitações pendentes para enviar. ${savedRequest.message || ''}`:`${savedRequest.id}\nAguardando atendimento`,
        [{ text: 'Concluir', onPress: goBack }],
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível registrar a solicitação.');
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
                validate: (quantity) => Number.isFinite(parseDecimal(quantity)) && parseDecimal(quantity) > 0 || 'Valor inválido.',
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

          <CalendarField
            control={control}
            name="neededAt"
            label="DATA NECESSÁRIA"
            placeholder="Selecione no calendário"
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
              <Ionicons name="cloud-offline" size={20} color="#9B4B11" />
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
