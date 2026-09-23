import { useState } from 'react';
import { Alert } from 'react-native';
import { useController, useForm } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';

const Intro = styled.Text`font-size: 15px; line-height: 22px; color: ${({ theme }) => theme.colors.textMuted}; margin: 20px 0 4px;`;
const Label = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; font-weight: 800; margin: 16px 0 7px;`;
const InputShell = styled.View`min-height: 54px; border: 1px solid ${({ error, theme }) => error ? theme.colors.danger : theme.colors.border}; border-radius: 15px; padding: 0 14px; background-color: white; flex-direction: row; align-items: center;`;
const Input = styled.TextInput`flex: 1; color: ${({ theme }) => theme.colors.text}; font-size: 15px; padding: 14px 0;`;
const ErrorText = styled.Text`font-size: 12px; color: ${({ theme }) => theme.colors.danger}; margin-top: 5px;`;
const Double = styled.View`flex-direction: row; gap: 10px;`;
const Half = styled.View`flex: 1;`;
const Attach = styled.TouchableOpacity`height: 58px; margin-top: 20px; border-radius: 16px; border: 1px dashed ${({ theme }) => theme.colors.primary}; align-items: center; justify-content: center; flex-direction: row; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const AttachText = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-size: 14px; font-weight: 800; margin-left: 8px;`;
const Offline = styled.View`padding: 12px; border-radius: 12px; background-color: #FFF4D6; flex-direction: row; align-items: center; margin-top: 16px;`;
const OfflineText = styled.Text`font-size: 12px; color: #71540D; margin-left: 8px; flex: 1;`;
const Submit = styled.TouchableOpacity`height: 56px; border-radius: 16px; background-color: ${({ theme }) => theme.colors.primary}; margin: 24px 0; align-items: center; justify-content: center; opacity: ${({ disabled }) => disabled ? .55 : 1};`;
const SubmitText = styled.Text`color: white; font-size: 16px; font-weight: 900;`;

function FormField({ control, name, label, rules, keyboardType, multiline, placeholder }) {
  const { field, fieldState } = useController({ control, name, rules, defaultValue: '' });
  return <><Label>{label}</Label><InputShell error={fieldState.error}><Input value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} keyboardType={keyboardType} multiline={multiline} placeholder={placeholder} placeholderTextColor="#9AA5B8" /></InputShell>{fieldState.error && <ErrorText>{fieldState.error.message}</ErrorText>}</>;
}

export function RequestMaterialScreen() {
  const { goBack, isOffline, submitRequest } = useApp();
  const { control, handleSubmit, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const request = await submitRequest(data);
      reset();
      Alert.alert('Solicitação registrada', `${request.id}\n${request.status}`, [{ text: 'Concluir', onPress: goBack }]);
    } catch { Alert.alert('Erro', 'Não foi possível registrar a solicitação.'); }
    finally { setIsSubmitting(false); }
  };
  return <Screen><ScreenHeader title="Solicitar material" /><Scroll><Content><Intro>Informe a necessidade da obra. Campos obrigatórios são validados antes do envio.</Intro>
    <FormField control={control} name="material" label="MATERIAL" placeholder="Ex.: Cimento CP II 50 kg" rules={{ required: 'Informe o material.' }} />
    <Double><Half><FormField control={control} name="quantity" label="QUANTIDADE" keyboardType="numeric" placeholder="120" rules={{ required: 'Obrigatório.', validate: (value) => Number(value) > 0 || 'Valor inválido.' }} /></Half><Half><FormField control={control} name="unit" label="UNIDADE" placeholder="saco" rules={{ required: 'Obrigatório.' }} /></Half></Double>
    <FormField control={control} name="neededAt" label="DATA NECESSÁRIA" placeholder="18/09/2026" rules={{ required: 'Informe a data.' }} />
    <FormField control={control} name="justification" label="JUSTIFICATIVA" multiline placeholder="Explique onde o material será utilizado" rules={{ required: 'Informe a justificativa.', minLength: { value: 8, message: 'Use pelo menos 8 caracteres.' } }} />
    <Attach><Ionicons name="camera-outline" size={22} color="#5A1B73" /><AttachText>Adicionar foto ou documento</AttachText></Attach>
    {isOffline && <Offline><Ionicons name="cloud-offline" size={20} color="#71540D" /><OfflineText>Sem conexão: a solicitação ficará salva no aparelho para sincronização posterior.</OfflineText></Offline>}
    <Submit disabled={isSubmitting} onPress={handleSubmit(onSubmit)}><SubmitText>{isSubmitting ? 'Salvando...' : 'Enviar solicitação'}</SubmitText></Submit>
  </Content></Scroll></Screen>;
}
