import { View } from 'react-native';
import { BottomTabs } from '../components/layout/BottomTabs';
import { useApp } from '../contexts/AppContext';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { BudgetScreen } from '../screens/BudgetScreen';
import { CompanyPermissionsScreen } from '../screens/CompanyPermissionsScreen';
import { CostsScreen } from '../screens/CostsScreen';
import { FeatureScreen } from '../screens/FeatureScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LabelScreen } from '../screens/LabelScreen';
import { MaterialsScreen } from '../screens/MaterialsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { RequestMaterialScreen } from '../screens/RequestMaterialScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { SCREENS, TABS } from './routes';

const TAB_COMPONENTS = {
  [TABS.HOME]: HomeScreen,
  [TABS.PROJECTS]: ProjectsScreen,
  [TABS.BUDGET]: BudgetScreen,
  [TABS.MATERIALS]: MaterialsScreen,
  [TABS.COSTS]: CostsScreen,
};

const SCREEN_COMPONENTS = {
  [SCREENS.REQUEST]: RequestMaterialScreen,
  [SCREENS.PROFILE]: ProfileScreen,
  [SCREENS.COMPANY_PERMISSIONS]: CompanyPermissionsScreen,
  [SCREENS.ADD_EXPENSE]: AddExpenseScreen,
  [SCREENS.SCANNER]: ScannerScreen,
  [SCREENS.LABEL]: LabelScreen,
};

const SCREENS_WITH_BOTTOM_TABS = new Set([
  SCREENS.TABS,
  SCREENS.PROFILE,
  SCREENS.SCANNER,
]);

function getScreenComponent(screenId, activeTab) {
  if (screenId === SCREENS.TABS) {
    return TAB_COMPONENTS[activeTab] ?? HomeScreen;
  }

  return SCREEN_COMPONENTS[screenId];
}

export function AppNavigator() {
  const { activeTab, screen } = useApp();
  const ScreenComponent = getScreenComponent(screen, activeTab);
  const screenContent = ScreenComponent
    ? <ScreenComponent />
    : <FeatureScreen type={screen} />;

  if (!SCREENS_WITH_BOTTOM_TABS.has(screen)) {
    return screenContent;
  }

  return (
    <View style={{ flex: 1 }}>
      {screenContent}
      <BottomTabs />
    </View>
  );
}
