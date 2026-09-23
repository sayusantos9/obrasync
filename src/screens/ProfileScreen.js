import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';

const Header = styled.View`padding: 52px 20px 32px; background-color: ${({ theme }) => theme.colors.primary}; align-items: center;`;
const Avatar = styled.View`width: 78px; height: 78px; border-radius: 39px; background-color: white; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,.4);`;
const Name = styled.Text`font-size: 22px; color: white; font-weight: 900; margin-top: 12px;`;
const Role = styled.Text`font-size: 13px; color: rgba(255,255,255,.76); margin-top: 3px;`;
const Menu = styled.TouchableOpacity`height: 62px; background-color: white; border-radius: 16px; margin-top: 12px; padding: 0 15px; flex-direction: row; align-items: center; border: 1px solid ${({ theme }) => theme.colors.border};`;
const MenuIcon = styled.View`width: 38px; height: 38px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.primarySoft}; align-items: center; justify-content: center;`;
const MenuText = styled.Text`flex: 1; color: ${({ theme }) => theme.colors.text}; font-size: 15px; font-weight: 700; margin-left: 12px;`;
const Toggle = styled.Switch.attrs(({ theme }) => ({ trackColor: { false: '#D7DFEA', true: theme.colors.primary }, thumbColor: '#FFFFFF' }))``;
const Hint = styled.Text`font-size: 12px; line-height: 18px; color: ${({ theme }) => theme.colors.textMuted}; margin: 18px 4px;`;

export function ProfileScreen() {
  const { isOffline, setIsOffline, pendingRequests, sync, isSyncing } = useApp();
  return <Screen><Scroll><Header><Avatar><Ionicons name="person" size={38} color="#5A1B73" /></Avatar><Name>Emelly Santos</Name><Role>Gestora • PLANENGEN</Role></Header><Content>
    <Menu><MenuIcon><Ionicons name="business-outline" size={21} color="#5A1B73" /></MenuIcon><MenuText>Empresa e permissões</MenuText><Ionicons name="chevron-forward" size={20} color="#756D7A" /></Menu>
    <Menu><MenuIcon><Ionicons name="cloud-offline-outline" size={21} color="#E0A526" /></MenuIcon><MenuText>Modo offline</MenuText><Toggle value={isOffline} onValueChange={setIsOffline} /></Menu>
    <Menu onPress={sync} disabled={isSyncing}><MenuIcon><Ionicons name="sync" size={21} color="#2F9E7A" /></MenuIcon><MenuText>{isSyncing ? 'Sincronizando...' : `Sincronizar (${pendingRequests.length})`}</MenuText><Ionicons name="chevron-forward" size={20} color="#756D7A" /></Menu>
    <Menu><MenuIcon><Ionicons name="shield-checkmark-outline" size={21} color="#B5473E" /></MenuIcon><MenuText>Privacidade e segurança</MenuText><Ionicons name="chevron-forward" size={20} color="#756D7A" /></Menu>
    <Menu><MenuIcon><Ionicons name="help-circle-outline" size={21} color="#7B3F91" /></MenuIcon><MenuText>Ajuda e manual</MenuText><Ionicons name="chevron-forward" size={20} color="#756D7A" /></Menu>
    <Hint>O modo offline salva solicitações no aparelho. Ao recuperar a conexão, use “Sincronizar” para enviar os registros.</Hint>
  </Content></Scroll></Screen>;
}
