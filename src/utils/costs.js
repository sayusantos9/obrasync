export function calculateCostSummary({ budget, expenses }) {
  const addedExpensesTotal = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );
  const realizedTotal = budget.realized + addedExpensesTotal;
  const availableBalance = budget.total - realizedTotal;
  const usagePercentage = budget.total > 0
    ? (realizedTotal / budget.total) * 100
    : 0;

  return {
    availableBalance,
    budgetLimit: budget.total,
    isOverBudget: availableBalance < 0,
    progressPercentage: Math.min(100, Math.max(0, usagePercentage)),
    realizedTotal,
    usagePercentage,
  };
}
