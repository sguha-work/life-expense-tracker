import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Expense, Category } from '../interfaces';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { AppLayout } from '../components/layout/AppLayout';
import { ExpensePieChart } from '../components/charts/ExpensePieChart';

export const Visualize: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedExpenses, fetchedCategories] = await Promise.all([
          expenseService.getExpenses(user.id),
          categoryService.getCategories(user.id)
        ]);
        setExpenses(fetchedExpenses);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  const prepareChartData = (filteredExpenses: Expense[]) => {
    const group: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      const catName = getCategoryName(e.categoryId);
      group[catName] = (group[catName] || 0) + e.amount;
    });
    return Object.keys(group)
      .map(name => ({ name, value: group[name] }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return prepareChartData(currentMonthExpenses);
  }, [expenses, categories]);

  const currentYearData = useMemo(() => {
    const now = new Date();
    const currentYearExpenses = expenses.filter(e => {
      const d = new Date(e.createdAt);
      return d.getFullYear() === now.getFullYear();
    });
    return prepareChartData(currentYearExpenses);
  }, [expenses, categories]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Visualize</h2>
          <p className="text-sm text-slate-500 font-medium">Category-wise expense breakdown</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <ExpensePieChart 
              data={currentMonthData} 
              title="This Month's Category Breakdown" 
            />
            <ExpensePieChart 
              data={currentYearData} 
              title="This Year's Category Breakdown" 
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};
