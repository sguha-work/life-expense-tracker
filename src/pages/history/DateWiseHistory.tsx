import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Expense, Category } from '../../interfaces';
import { expenseService } from '../../services/expenseService';
import { categoryService } from '../../services/categoryService';
import { AppLayout } from '../../components/layout/AppLayout';

export const DateWiseHistory: React.FC = () => {
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

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(expense);
    });
    return groups;
  }, [expenses]);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Date-wise History</h2>
          <p className="text-sm text-slate-500 font-medium">Your expenses grouped by date</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, dateExpenses]) => {
              const total = dateExpenses.reduce((sum, e) => sum + e.amount, 0);
              return (
                <div key={date} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">{date}</h3>
                    <span className="font-bold text-blue-600">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {dateExpenses.map(expense => (
                      <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{expense.description}</p>
                          <div className="flex space-x-2 text-[10px] font-medium mt-1">
                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {getCategoryName(expense.categoryId)}
                            </span>
                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              {expense.mode}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-700">₹{expense.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
