import {
  AddBudgetItemScreen,
  AddExpenseScreen,
  AlertsScreen,
  BudgetScreen,
  CompanyPermissionsScreen,
  CostsScreen,
  CreateBudgetScreen,
  CreateQuoteScreen,
  FeatureScreen,
  HomeScreen,
  LabelScreen,
  MaterialsScreen,
  ProfileScreen,
  ProjectsScreen,
  QuotesScreen,
  RequestMaterialScreen,
  ScannerScreen,
} from '../screens';
import { SCREENS, TABS } from './routes';

const TAB_COMPONENTS = Object.freeze({
  [TABS.HOME]: HomeScreen,
  [TABS.PROJECTS]: ProjectsScreen,
  [TABS.BUDGET]: BudgetScreen,
  [TABS.MATERIALS]: MaterialsScreen,
  [TABS.COSTS]: CostsScreen,
});

const SCREEN_COMPONENTS = Object.freeze({
  [SCREENS.REQUEST]: RequestMaterialScreen,
  [SCREENS.QUOTES]: QuotesScreen,
  [SCREENS.CREATE_QUOTE]: CreateQuoteScreen,
  [SCREENS.CREATE_BUDGET]: CreateBudgetScreen,
  [SCREENS.ALERTS]: AlertsScreen,
  [SCREENS.PROFILE]: ProfileScreen,
  [SCREENS.COMPANY_PERMISSIONS]: CompanyPermissionsScreen,
  [SCREENS.ADD_EXPENSE]: AddExpenseScreen,
  [SCREENS.ADD_BUDGET_ITEM]: AddBudgetItemScreen,
  [SCREENS.SCANNER]: ScannerScreen,
  [SCREENS.LABEL]: LabelScreen,
  [SCREENS.RECEIPT]: FeatureScreen,
  [SCREENS.STOCK]: FeatureScreen,
  [SCREENS.ORDERS]: FeatureScreen,
  [SCREENS.APPROVALS]: FeatureScreen,
});

const BOTTOM_TAB_SCREENS = new Set([
  SCREENS.TABS,
  SCREENS.PROFILE,
  SCREENS.SCANNER,
]);

export function resolveScreenComponent(screenId, activeTab) {
  if (screenId === SCREENS.TABS) {
    return TAB_COMPONENTS[activeTab] ?? HomeScreen;
  }

  return SCREEN_COMPONENTS[screenId] ?? HomeScreen;
}

export function shouldShowBottomTabs(screenId) {
  return BOTTOM_TAB_SCREENS.has(screenId);
}
