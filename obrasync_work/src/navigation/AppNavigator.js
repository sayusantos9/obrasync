import { View } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { BottomTabs } from '../components/layout/BottomTabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { MaterialsScreen } from '../screens/MaterialsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CostsScreen } from '../screens/CostsScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { LabelScreen } from '../screens/LabelScreen';
import { RequestMaterialScreen } from '../screens/RequestMaterialScreen';
import { FeatureScreen } from '../screens/FeatureScreen';
import { CompanyPermissionsScreen } from '../screens/CompanyPermissionsScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { SCREENS, TABS } from './routes';

const tabScreens = {
  [TABS.HOME]: HomeScreen,
  [TABS.PROJECTS]: ProjectsScreen,
  [TABS.MATERIALS]: MaterialsScreen,
  [TABS.COSTS]: CostsScreen,
};

export function AppNavigator() {
  const { activeTab, screen } = useApp();
  if (screen === SCREENS.REQUEST) return <RequestMaterialScreen />;
  if (screen === SCREENS.PROFILE) return <View style={{ flex: 1 }}><ProfileScreen /><BottomTabs /></View>;
  if (screen === SCREENS.COMPANY_PERMISSIONS) return <CompanyPermissionsScreen />;
  if (screen === SCREENS.ADD_EXPENSE) return <AddExpenseScreen />;
  if (screen === SCREENS.SCANNER) return <View style={{ flex: 1 }}><ScannerScreen /><BottomTabs /></View>;
  if (screen === SCREENS.LABEL) return <LabelScreen />;
  if (screen !== SCREENS.TABS) return <FeatureScreen type={screen} />;
  const CurrentScreen = tabScreens[activeTab] || HomeScreen;
  return <View style={{ flex: 1 }}><CurrentScreen /><BottomTabs /></View>;
}
