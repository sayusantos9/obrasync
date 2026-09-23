import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';
import { TAB_ITEMS } from '../../navigation/routes';

const Bar = styled.View`position: absolute; left: 0; right: 0; bottom: 0; height: 86px; padding: 10px 6px 18px; flex-direction: row; background-color: white; border-top-width: 1px; border-top-color: ${({ theme }) => theme.colors.border};`;
const Item = styled.TouchableOpacity`flex: 1; align-items: center; justify-content: center;`;
const Label = styled.Text`font-size: 10px; margin-top: 4px; color: ${({ active, theme }) => active ? theme.colors.primaryDark : theme.colors.textMuted}; font-weight: ${({ active }) => active ? 800 : 600};`;
const IconShell = styled.View`width: 38px; height: 30px; border-radius: 11px; align-items: center; justify-content: center; background-color: ${({ active, theme }) => active ? theme.colors.accentSoft : 'transparent'};`;

export function BottomTabs() {
  const { activeTab, selectTab } = useApp();
  return <Bar>{TAB_ITEMS.map(({ id, label, icon }) => {
    const active = id === activeTab;
    return <Item key={id} onPress={() => selectTab(id)} accessibilityRole="button" accessibilityLabel={label}>
      <IconShell active={active}><Ionicons name={active ? icon : `${icon}-outline`} size={22} color={active ? '#E0A526' : '#756D7A'} /></IconShell>
      <Label active={active}>{label}</Label>
    </Item>;
  })}</Bar>;
}
