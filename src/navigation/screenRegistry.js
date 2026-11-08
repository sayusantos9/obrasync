import {SecurityScreen} from '../screens/SecurityScreen';
import {CompanyBdiScreen} from '../screens/CompanyBdiScreen';
import {UsersScreen} from '../screens/UsersScreen';
import {PurchasePlanningScreen} from '../screens/PurchasePlanningScreen';
import {SuppliersScreen} from '../screens/SuppliersScreen';
import {AuditScreen} from '../screens/AuditScreen';
import { ComparisonScreen } from '../screens/ComparisonScreen';
import { MarketPricesScreen } from '../screens/MarketPricesScreen';
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
import { USER_ROLES } from '../data/authData';
import { SCREENS, TABS } from './routes';

const TAB_COMPONENTS = Object.freeze({
  [TABS.HOME]: HomeScreen,
  [TABS.PROJECTS]: ProjectsScreen,
  [TABS.BUDGET]: BudgetScreen,
  [TABS.MATERIALS]: MaterialsScreen,
  [TABS.COSTS]: CostsScreen,
});

const SCREEN_COMPONENTS = Object.freeze({
  [SCREENS.COMPANY_BDI]: CompanyBdiScreen,
  [SCREENS.SECURITY]: SecurityScreen,
  [SCREENS.USERS]: UsersScreen,
  [SCREENS.PURCHASE_PLANNING]: PurchasePlanningScreen,
  [SCREENS.SUPPLIERS]: SuppliersScreen,
  [SCREENS.AUDIT]: AuditScreen,
  [SCREENS.COMPARISON]: ComparisonScreen,
  [SCREENS.MARKET_PRICES]: MarketPricesScreen,
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
  [SCREENS.APPROVALS]: PurchasesScreen,
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
  SCREENS.SECURITY,
  SCREENS.COMPANY_BDI,
  SCREENS.USERS,SCREENS.PURCHASE_PLANNING,
  SCREENS.SUPPLIERS,
  SCREENS.SETTINGS,
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

const MASTER_TAB_SCREENS = new Set([
  SCREENS.USERS,
  SCREENS.TABS,
  SCREENS.MASTER_PANEL,
  SCREENS.COMPANIES,
  SCREENS.CREATE_MEMBER,
  SCREENS.COMPANY_PERMISSIONS,
  SCREENS.REPORTS,
  SCREENS.SUPPLIERS,
  SCREENS.SETTINGS,
  SCREENS.PROFILE,
]);

export function resolveScreenComponent(screenId, activeTab) {
  if (screenId === SCREENS.TABS) {
    return TAB_COMPONENTS[activeTab] ?? HomeScreen;
  }

  return SCREEN_COMPONENTS[screenId] ?? HomeScreen;
}

export function shouldShowBottomTabs(screenId, role) {
  if (role === USER_ROLES.MASTER) return MASTER_TAB_SCREENS.has(screenId);
  return BOTTOM_TAB_SCREENS.has(screenId);
}
