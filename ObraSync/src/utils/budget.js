import { getProjectBudgetItems, sumBudgetItems } from './budgetItems';

export function calculateBudgetMetrics({
  budget,
  budgetItems,
  expenses,
  projectId,
}) {
  const projectItems = getProjectBudgetItems(budgetItems, projectId);
  const projectExpenses = expenses.filter((expense) => expense.projectId === projectId);
  const addedItemsTotal = sumBudgetItems(projectItems);
  const extraExpensesTotal = projectExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );
  const plannedTotal = budget.total + addedItemsTotal;
  const realizedTotal = budget.realized + extraExpensesTotal;
  const balance = plannedTotal - realizedTotal;
  const usagePercentage = plannedTotal > 0 ? (realizedTotal / plannedTotal) * 100 : 0;

  return {
    addedItemsTotal,
    balance,
    extraExpensesTotal,
    isOverBudget: balance < 0,
    plannedTotal,
    progressPercentage: Math.min(100, Math.max(0, usagePercentage)),
    projectItems,
    realizedTotal,
    usagePercentage,
  };
}
