import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useApp } from '../../contexts/AppContext';
import { TAB_ITEMS } from '../../navigation/routes';

const Bar = styled.View`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 86px;
  padding: 10px 6px 18px;
  flex-direction: row;
  background-color: white;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;

const Item = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Label = styled.Text`
  margin-top: 4px;
  color: ${({ $isActive, theme }) => (
    $isActive ? theme.colors.primaryDark : theme.colors.textMuted
  )};
  font-size: 10px;
  font-weight: ${({ $isActive }) => ($isActive ? 800 : 600)};
`;

const IconBox = styled.View`
  width: 38px;
  height: 30px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isActive, theme }) => (
    $isActive ? theme.colors.accentSoft : 'transparent'
  )};
  border-radius: 11px;
`;

export function BottomTabs() {
  const { activeTab, selectTab } = useApp();

  return (
    <Bar>
      {TAB_ITEMS.map((tab) => {
        const isActive = tab.id === activeTab;
        const iconName = isActive ? tab.icon : `${tab.icon}-outline`;

        return (
          <Item
            key={tab.id}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            onPress={() => selectTab(tab.id)}
          >
            <IconBox $isActive={isActive}>
              <Ionicons
                name={iconName}
                size={22}
                color={isActive ? '#E0A526' : '#756D7A'}
              />
            </IconBox>
            <Label $isActive={isActive}>{tab.label}</Label>
          </Item>
        );
      })}
    </Bar>
  );
}
