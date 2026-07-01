import React from 'react';
import { Category } from '../../interfaces';

export interface CategoryMonthlySpendingRow {
  categoryId: string;
  name: string;
  spent: number;
  budget?: number;
  gap?: number;
}

interface CategoryMonthlySpendingTableProps {
  rows: CategoryMonthlySpendingRow[];
}

const formatInr = (value: number) => `₹${value.toFixed(2)}`;

export const CategoryMonthlySpendingTable: React.FC<CategoryMonthlySpendingTableProps> = ({ rows }) => {
  const hasAnyBudget = rows.some((row) => row.budget != null);

  if (rows.length === 0) {
    return (
      <div className="bg-card p-6 rounded-2xl shadow-sm border border-main w-full">
        <h3 className="text-lg font-bold text-main mb-2">Category Spending Summary</h3>
        <p className="text-muted font-medium text-sm">No spending recorded this month</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-main w-full overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-lg font-bold text-main">Category Spending Summary</h3>
        <p className="text-sm text-muted font-medium mt-1">This month&apos;s totals by category</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-sm">
          <thead>
            <tr className="border-t border-b border-main bg-slate-50/80 dark:bg-slate-900/40">
              <th className="text-left px-6 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">
                Category
              </th>
              <th className="text-right px-6 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">
                Spent
              </th>
              {hasAnyBudget && (
                <th className="text-right px-6 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">
                  Gap
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-main">
            {rows.map((row) => (
              <tr key={row.categoryId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                <td className="px-6 py-3.5 font-semibold text-main">
                  {row.name}
                  {row.budget != null && (
                    <span className="font-medium text-muted"> ({formatInr(row.budget)})</span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-right font-semibold text-main">{formatInr(row.spent)}</td>
                {hasAnyBudget && (
                  <td className="px-6 py-3.5 text-right font-semibold">
                    {row.gap != null ? (
                      <span className={row.gap < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                        {formatInr(row.gap)}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export function getMonthlyBudgetLimit(cat: Category): number {
  if (!cat.budgetAmount || cat.budgetAmount <= 0) return 0;
  if (cat.budgetMode === 'd') return cat.budgetAmount * 30;
  if (cat.budgetMode === 'y') return cat.budgetAmount / 12;
  return cat.budgetAmount;
}

export function buildCategoryMonthlySpendingRows(
  expenses: { categoryId: string; amount: number; createdAt: number }[],
  categories: Category[]
): CategoryMonthlySpendingRow[] {
  const now = new Date();
  const spentByCategoryId: Record<string, number> = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.createdAt);
    if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) {
      return;
    }
    spentByCategoryId[expense.categoryId] = (spentByCategoryId[expense.categoryId] || 0) + expense.amount;
  });

  return Object.entries(spentByCategoryId)
    .map(([categoryId, spent]) => {
      const category = categories.find((c) => c.id === categoryId);
      const name = category?.name || 'Unknown';
      let budget: number | undefined;
      let gap: number | undefined;

      if (category?.budgetAmount && category.budgetAmount > 0) {
        budget = getMonthlyBudgetLimit(category);
        gap = budget - spent;
      }

      return { categoryId, name, spent, budget, gap };
    })
    .filter((row) => row.spent > 0)
    .sort((a, b) => b.spent - a.spent);
}
