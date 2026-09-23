import { Ionicons } from '@expo/vector-icons';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { useApp } from '../contexts/AppContext';
import { defaultExpenses } from '../data/mockData';
import { SCREENS } from '../navigation/routes';
import { theme } from '../theme';
import { formatCompactCurrency, formatCurrency } from '../utils/currency';
import { costStyles as styles } from './CostsScreen.styles';

const BASE_REALIZED_TOTAL = 684250;
const BUDGET_LIMIT = 702000;

export function CostsScreen() {
  const { openScreen, selectedProject, extraExpenses } = useApp();
  const projectExpenses = extraExpenses.filter(
    (expense) => expense.projectId === selectedProject.id,
  );
  const visibleExpenses = [...projectExpenses, ...defaultExpenses];
  const addedExpensesTotal = projectExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );
  const realizedTotal = BASE_REALIZED_TOTAL + addedExpensesTotal;
  const availableBalance = BUDGET_LIMIT - realizedTotal;
  const usagePercentage = (realizedTotal / BUDGET_LIMIT) * 100;
  const progressPercentage = Math.min(100, Math.max(0, usagePercentage));
  const isOverBudget = availableBalance < 0;

  function handleBudgetWarningPress() {
    const message = isOverBudget
      ? `O limite foi ultrapassado em ${formatCurrency(Math.abs(availableBalance))}.`
      : `Restam ${formatCurrency(availableBalance)} até o limite atual.`;

    Alert.alert('Atenção ao orçamento', message);
  }

  function handleAddExpensePress() {
    openScreen(SCREENS.ADD_EXPENSE);
  }

  return (
    <Screen>
      <Scroll>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Custos da obra</Text>
            <View style={styles.headerIcon}>
              <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.subtitle}>{selectedProject.name}</Text>
        </View>

        <Content>
          <View style={styles.totalCard}>
            <Text style={styles.label}>TOTAL REALIZADO</Text>
            <Text style={styles.total}>{formatCompactCurrency(realizedTotal)}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: isOverBudget ? theme.colors.danger : theme.colors.accent,
                  },
                ]}
              />
            </View>
            <View style={styles.totalFooter}>
              <Text style={styles.smallText}>
                {usagePercentage.toFixed(1).replace('.', ',')}% do limite
              </Text>
              <Text style={styles.smallText}>
                Limite: {formatCompactCurrency(BUDGET_LIMIT)}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.iconTile,
                  { backgroundColor: isOverBudget ? theme.colors.dangerSoft : theme.colors.successSoft },
                ]}
              >
                <Ionicons
                  name={isOverBudget ? 'alert-circle-outline' : 'wallet-outline'}
                  size={21}
                  color={isOverBudget ? theme.colors.danger : theme.colors.success}
                />
              </View>
              <Text style={styles.label}>{isOverBudget ? 'Acima do limite' : 'Disponível'}</Text>
              <Text
                style={[
                  styles.summaryValue,
                  isOverBudget && { color: theme.colors.danger },
                ]}
              >
                {formatCompactCurrency(availableBalance)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.iconTile, { backgroundColor: theme.colors.primarySoft }]}>
                <Ionicons name="document-text-outline" size={21} color={theme.colors.primary} />
              </View>
              <Text style={styles.label}>Limite atual</Text>
              <Text style={styles.summaryValue}>{formatCompactCurrency(BUDGET_LIMIT)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.warning} onPress={handleBudgetWarningPress}>
            <Ionicons name="warning" size={27} color={theme.colors.danger} />
            <View style={styles.warningInfo}>
              <Text style={styles.warningTitle}>
                {isOverBudget ? 'Limite ultrapassado' : 'Atenção'}
              </Text>
              <Text style={styles.warningText}>
                {isOverBudget
                  ? `As novas despesas deixaram a obra ${formatCompactCurrency(Math.abs(availableBalance))} acima do limite.`
                  : `Você está a ${formatCompactCurrency(availableBalance)} do limite. Monitore as próximas despesas.`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.danger} />
          </TouchableOpacity>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Últimas despesas</Text>
            <Text style={styles.linkText}>{visibleExpenses.length} registros</Text>
          </View>

          {visibleExpenses.slice(0, 8).map((expense) => (
            <View key={expense.id} style={styles.expenseCard}>
              <View style={[styles.iconTile, { backgroundColor: expense.backgroundColor }]}>
                <Ionicons name={expense.icon} size={21} color={expense.color} />
              </View>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseDate}>
                  {expense.date}
                  {expense.category ? ` • ${expense.category}` : ''}
                </Text>
              </View>
              <Text style={styles.expenseValue}>{formatCurrency(expense.amount)}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={handleAddExpensePress}>
            <Ionicons name="add-circle" size={22} color={theme.colors.primaryDark} />
            <Text style={styles.addButtonText}>Adicionar despesa</Text>
          </TouchableOpacity>
        </Content>
      </Scroll>
    </Screen>
  );
}
