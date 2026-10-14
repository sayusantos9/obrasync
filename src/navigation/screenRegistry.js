import {
  AccessibilityScreen,
  AddExpenseScreen,
  AlertsScreen,
  BudgetScreen,
  CompanyPermissionsScreen,
  MasterPanelScreen,
  CreateMemberScreen,
  CreateCompanyScreen,
  CompaniesScreen,
  CostsScreen,
  CreateBudgetScreen,
  CreateQuoteScreen,
  FeatureScreen,
  GuideScreen,
  HomeScreen,
  LabelScreen,
  MaterialsScreen,
  ProfileScreen,
  ProjectsScreen,
  PurchasesScreen,
  QuotesScreen,
  ReceiptScreen,
  ReportsScreen,
  RequestMaterialScreen,
  ScannerScreen,
  SettingsScreen,
  StockScreen,
  TransfersScreen,
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
  [SCREENS.RECEIPT]: ReceiptScreen,
  [SCREENS.STOCK]: StockScreen,
  [SCREENS.PURCHASES]: PurchasesScreen,
  [SCREENS.TRANSFERS]: TransfersScreen,
  [SCREENS.REPORTS]: ReportsScreen,
  [SCREENS.ORDERS]: PurchasesScreen,
  [SCREENS.APPROVALS]: FeatureScreen,
  [SCREENS.ALERTS]: AlertsScreen,
  [SCREENS.PROFILE]: ProfileScreen,
  [SCREENS.COMPANY_PERMISSIONS]: CompanyPermissionsScreen,
  [SCREENS.MASTER_PANEL]: MasterPanelScreen,
  [SCREENS.COMPANIES]: CompaniesScreen,
  [SCREENS.CREATE_COMPANY]: CreateCompanyScreen,
  [SCREENS.CREATE_MEMBER]: CreateMemberScreen,
  [SCREENS.ADD_EXPENSE]: AddExpenseScreen,
  [SCREENS.SCANNER]: ScannerScreen,
  [SCREENS.LABEL]: LabelScreen,
  [SCREENS.SETTINGS]: SettingsScreen,
  [SCREENS.GUIDE]: GuideScreen,
  [SCREENS.ACCESSIBILITY]: AccessibilityScreen,
});

const BOTTOM_TAB_SCREENS = new Set([
  SCREENS.TABS,
  SCREENS.PROFILE,
  SCREENS.SCANNER,
  SCREENS.STOCK,
  SCREENS.RECEIPT,
  SCREENS.LABEL,
  SCREENS.PURCHASES,
  SCREENS.REPORTS,
  SCREENS.TRANSFERS,
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
