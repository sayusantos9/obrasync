import {CatalogInputPicker} from '../components/forms/CatalogInputPicker';
import {requestStatusLabel} from '../utils/procurementTrace';
import {SCREENS} from '../navigation/routes';
import {OperationAttachments} from '../components/documents/OperationAttachments';
import {AccessibleIonicons as Ionicons} from '../components/accessibility/AccessibleNative';
import {AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';

import { Alert, useWindowDimensions } from 'react-native';
import { useForm } from 'react-hook-form';
import { CalendarField } from '../components/forms/CalendarField';
import { FormField } from '../components/forms/FormField';
import { InventoryScreen, useInventoryTheme, useInventoryStyles } from '../components/layout/InventoryScreen';
import { useApp } from '../contexts/AppContext';
import { makeRequestMaterialStyles } from './RequestMaterialScreen.styles';
import { parseDecimal } from '../utils/bdi';
import { useEffect,useRef,useState } from 'react';
import { operationId } from '../services/requestQueue';

const DEFAULT_REQUEST_FORM = {
  material: '',
  quantity: '',
  unit: '',
  neededAt: '',
  justification: '',
};

export function RequestMaterialScreen() {
  const { goBack, isOffline, selectedProject, submitMaterialRequest, requests=[], currentUser,openScreen } = useApp();
  const [catalogInput,setCatalogInput]=useState(null);
  const requestId=useRef(operationId());
  const savingRef=useRef(false);
  const theme=useInventoryTheme();
  const styles=useInventoryStyles(makeRequestMaterialStyles(theme));
  const {width,fontScale}=useWindowDimensions();
  const compact=width<360 || fontScale*(theme.fontScale||1)>1.2;
  const {
    control,
    handleSubmit,
    reset,setValue,
    formState: { isSubmitting },
  } = useForm({ defaultValues: DEFAULT_REQUEST_FORM });

  useEffect(()=>{reset(DEFAULT_REQUEST_FORM);setCatalogInput(null);requestId.current=operationId();},[selectedProject?.id,reset]);

  async function handleSaveRequest(formValues) {
    if(savingRef.current)return;
    if(!selectedProject?.id)return Alert.alert('Selecione uma obra','Escolha uma obra antes de solicitar insumos.');
    savingRef.current=true;
    try {
      const savedRequest = await submitMaterialRequest({...formValues,inputId:catalogInput?.id||null,source:catalogInput?.source||null,material:formValues.material.trim(),unit:formValues.unit.trim(),justification:formValues.justification.trim(),clientRequestId:requestId.current,quantity:parseDecimal(formValues.quantity)});
      requestId.current=operationId();
      reset(DEFAULT_REQUEST_FORM);setCatalogInput(null);
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
          <CatalogInputPicker disabled={isSubmitting} onSelect={i=>{setCatalogInput(i);setValue('material',i.description);setValue('unit',i.unit);}}/>
          {!!catalogInput&&<TouchableOpacity accessibilityRole="button" onPress={()=>{setCatalogInput(null);setValue('material','');setValue('unit','');}} style={{padding:14,minHeight:48}}><Text style={{color:theme.colors.accent}}>Selecionado: {catalogInput.code} · Limpar seleção</Text></TouchableOpacity>}
          <Text style={styles.introText}>Selecionar o catálogo preserva código e unidade. Se o insumo ainda não estiver cadastrado, descreva abaixo; Compras fará a associação antes de cotar.</Text>
          <FormField
            control={control}
            name="material" editable={!catalogInput}
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
              name="unit" editable={!catalogInput}
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
          <Text style={styles.introText}>Solicitações enviadas — anexos</Text>
      {requests.filter(r=>currentUser?.role!=='REQUESTER'||r.requester_id===currentUser.id).map(r=><View key={r.id} style={{padding:14,borderWidth:1,borderColor:theme.colors.border,borderRadius:14,marginTop:12,backgroundColor:theme.colors.surface}}><Text style={{color:theme.colors.text,fontWeight:'700'}}>{r.material||r.number}</Text><Text style={{color:theme.colors.textMuted}}>{r.quantity} {r.unit}</Text><Text style={{color:theme.colors.textMuted}}>{requestStatusLabel(r.status)}</Text>{['MASTER','PURCHASING'].includes(currentUser?.role)&&['PENDING','APPROVED','QUOTING'].includes(r.status)&&<TouchableOpacity accessibilityRole="button" style={{padding:14,minHeight:48}} onPress={()=>openScreen(SCREENS.CREATE_QUOTE,{requestId:r.id})}><Text style={{color:theme.colors.accent}}>Cotar esta solicitação</Text></TouchableOpacity>}<OperationAttachments kind="request" entityId={r.id} projectId={selectedProject.id}/></View>)}
      <Text style={styles.introText}>Anexos exigem internet e ficam disponíveis depois que a solicitação é enviada ao servidor. Solicitações offline devem ser sincronizadas primeiro.</Text>
    </InventoryScreen>
  );
}
