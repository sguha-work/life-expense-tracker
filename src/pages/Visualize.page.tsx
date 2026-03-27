import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Expense, Category } from '../interfaces';
import { expenseService } from '../services/expense.service';
import { categoryService } from '../services/category.service';
import { AppLayout } from '../components/layout/AppLayout';
import { ExpensePieChart } from '../components/charts/ExpensePieChart';
import { ExpenseBarChart } from '../components/charts/ExpenseBarChart';

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

  const prepareCategoryData = (filteredExpenses: Expense[]) => {
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

  const preparePaymentModeData = (filteredExpenses: Expense[]) => {
    const group: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      group[e.mode] = (group[e.mode] || 0) + e.amount;
    });
    return Object.keys(group)
      .map(name => ({ name, value: group[name] }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const currentMonthCategoryData = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return prepareCategoryData(currentMonthExpenses);
  }, [expenses, categories]);

  const currentMonthPaymentData = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return preparePaymentModeData(currentMonthExpenses);
  }, [expenses]);

  const yearlyTrendData = useMemo(() => {
    const now = new Date();
    const currentYearExpenses = expenses.filter(e => {
      const d = new Date(e.createdAt);
      return d.getFullYear() === now.getFullYear();
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals: Record<string, number> = {};
    
    // Initialize all months of current year up to current month or all 12?
    // Let's do all 12 so the chart looks consistent.
    monthNames.forEach(m => monthlyTotals[m] = 0);

    currentYearExpenses.forEach(e => {
      const d = new Date(e.createdAt);
      const mName = monthNames[d.getMonth()];
      monthlyTotals[mName] += e.amount;
    });

    return monthNames.map(name => ({ name, value: monthlyTotals[name] }));
  }, [expenses]);

  const currentYearCategoryData = useMemo(() => {
    const now = new Date();
    const currentYearExpenses = expenses.filter(e => {
      const d = new Date(e.createdAt);
      return d.getFullYear() === now.getFullYear();
    });
    return prepareCategoryData(currentYearExpenses);
  }, [expenses, categories]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div>
          <h2 className="text-2xl font-extrabold text-main tracking-tight">Visualize</h2>
          <p className="text-sm text-muted font-medium">Expense breakdown and trends</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            
            <ExpensePieChart 
              data={currentMonthCategoryData} 
              title="Month's Category Breakdown" 
            />
            
            <ExpensePieChart 
              data={currentMonthPaymentData} 
              title="Month's Payment Mode Breakdown" 
            />

            <ExpensePieChart 
              data={currentYearCategoryData} 
              title="Year's Category Breakdown" 
            />

            <ExpenseBarChart 
              data={yearlyTrendData} 
              title="Yearly Expense Trend (Monthly)" 
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};
