import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';
import { getRoleTabs, SCREENS } from '../../navigation/routes';

const Bar = styled.View`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 82px;
  padding: 8px 5px 16px;
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

const Item = styled.TouchableOpacity`
  flex: 1;
  min-width: 52px;
  align-items: center;
  justify-content: center;
`;

const IconBox = styled.View`
  width: 42px;
  height: 30px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.accentSoft : 'transparent')};
  border-radius: 12px;
`;

const Label = styled.Text`
  margin-top: 3px;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  font-size: 9px;
  font-weight: ${({ $active }) => ($active ? 900 : 600)};
`;

export function BottomTabs() {
  const { activeTab, currentScreen, currentUser, openScreen, selectTab } = useApp();
  const items = getRoleTabs(currentUser?.role);

  return (
    <Bar accessibilityRole="tablist">
      {items.map((item) => {
        const isMoreScreen = item.id === 'more' && [
          SCREENS.PROFILE,
          SCREENS.REPORTS,
          SCREENS.SETTINGS,
          SCREENS.COMPANY_PERMISSIONS,
        ].includes(currentScreen);
        const isStockFlow = item.id === 'stock' && [
          SCREENS.STOCK,
          SCREENS.LABEL,
          SCREENS.SCANNER,
          SCREENS.TRANSFERS,
        ].includes(currentScreen);
        const isPurchaseFlow = item.id === 'purchases' && [
          SCREENS.PURCHASES,
          SCREENS.RECEIPT,
        ].includes(currentScreen);
        const active = item.tab
          ? (currentScreen === SCREENS.TABS || (item.id === 'home' && currentScreen === SCREENS.MASTER_PANEL))
            && activeTab === item.tab
          : currentScreen === item.screen || isMoreScreen || isStockFlow || isPurchaseFlow;
        const icon = active ? item.icon : `${item.icon}-outline`;

        return (
          <Item
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            onPress={() => (item.tab ? selectTab(item.tab) : openScreen(item.screen))}
          >
            <IconBox $active={active}>
              <Ionicons name={icon} size={21} color={active ? '#EA6A12' : '#686C78'} />
            </IconBox>
            <Label $active={active}>{item.label}</Label>
          </Item>
        );
      })}
    </Bar>
  );
}
