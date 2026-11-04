import { Ionicons } from '@expo/vector-icons';
import { Alert, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useForm } from 'react-hook-form';
import { CalendarField } from '../components/forms/CalendarField';
import { FormField } from '../components/forms/FormField';
import { InventoryScreen, useInventoryTheme, useInventoryStyles } from '../components/layout/InventoryScreen';
import { useApp } from '../contexts/AppContext';
import { makeRequestMaterialStyles } from './RequestMaterialScreen.styles';
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
  const { goBack, isOffline, selectedProject, submitMaterialRequest } = useApp();
  const requestId=useRef(operationId());
  const savingRef=useRef(false);
  const theme=useInventoryTheme();
  const styles=useInventoryStyles(makeRequestMaterialStyles(theme));
  const {width,fontScale}=useWindowDimensions();
  const compact=width<360 || fontScale*(theme.fontScale||1)>1.2;
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: DEFAULT_REQUEST_FORM });

  async function handleSaveRequest(formValues) {
    if(savingRef.current)return;
    if(!selectedProject?.id)return Alert.alert('Selecione uma obra','Escolha uma obra antes de solicitar insumos.');
    savingRef.current=true;
    try {
      const savedRequest = await submitMaterialRequest({...formValues,material:formValues.material.trim(),unit:formValues.unit.trim(),justification:formValues.justification.trim(),clientRequestId:requestId.current,quantity:parseDecimal(formValues.quantity)});
      requestId.current=operationId();
      reset(DEFAULT_REQUEST_FORM);
      Alert.alert(
        savedRequest.status==='QUEUED'?'Solicitação na fila do aparelho':'Solicitação enviada',
        savedRequest.status==='QUEUED'?`Use a sincronização na tela inicial ou abra Mais → Solicitações pendentes para enviar. ${savedRequest.message || ''}`:`${savedRequest.id}\nAguardando atendimento`,
        [{ text: 'Concluir', onPress: goBack }],
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível registrar a solicitação.');
    } finally { savingRef.current=false; }
  }

  return (
    <InventoryScreen title="Solicitar insumos" bottomTabs={false}>
          <Text style={styles.introText}>
            Do planejamento à execução: informe o que falta para sua equipe continuar.
          </Text>

          <View style={styles.projectCard}><Ionicons name="construct-outline" size={23} color={theme.colors.accent}/><View style={{flex:1}}><Text style={styles.projectLabel}>OBRA DA SOLICITAÇÃO</Text><Text style={styles.projectName}>{selectedProject?.name || 'Nenhuma obra selecionada'}</Text></View></View>
          <FormField
            control={control}
            name="material"
            label="INSUMO"
            placeholder="Ex.: Cimento CP II 50 kg"
            rules={{ validate:v=>Boolean(v?.trim()) || 'Informe o insumo.' }}
          />

          <View style={[styles.row,compact&&{flexDirection:'column'}]}>
            <FormField
              control={control}
              name="quantity"
              label="QUANTIDADE"
              keyboardType="decimal-pad"
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
              rules={{ validate:v=>Boolean(v?.trim()) || 'Informe a unidade.' }}
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
            placeholder="Explique onde o insumo será utilizado"
            rules={{
              required: 'Informe a justificativa.',
              validate:v=>v?.trim().length>=8 || 'Use pelo menos 8 caracteres.',
            }}
            multiline
          />

{isOffline && (
            <View style={styles.offlineNotice}>
              <Ionicons name="cloud-offline" size={20} color={theme.colors.accent} />
              <Text style={styles.offlineText}>
                Sem conexão: a solicitação ficará salva no aparelho para sincronização posterior.
              </Text>
            </View>
          )}

          <TouchableOpacity
            accessibilityRole="button" accessibilityLabel="Enviar solicitação" disabled={isSubmitting || !selectedProject?.id}
            onPress={handleSubmit(handleSaveRequest)}
            style={[styles.submitButton, (isSubmitting || !selectedProject?.id) && styles.disabledButton]}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Salvando...' : 'Enviar solicitação'}
            </Text>
          </TouchableOpacity>
        </InventoryScreen>
  );
}
