import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Expense } from '../../interfaces';
import { expenseService } from '../../services/expenseService';
import { AppLayout } from '../../components/layout/AppLayout';

export const MonthWiseHistory: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedExpenses = await expenseService.getExpenses(user.id);
        setExpenses(fetchedExpenses);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    expenses.forEach(expense => {
      const date = new Date(expense.createdAt);
      const monthYear = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(expense);
    });
    return groups;
  }, [expenses]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Month-wise History</h2>
          <p className="text-sm text-slate-500 font-medium">Your expenses grouped by month</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(groupedByMonth).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByMonth).map(([month, monthExpenses]) => {
              const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
              const count = monthExpenses.length;
              return (
                <div key={month} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{month}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">{count} transaction{count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-xl text-blue-600">₹{total.toFixed(2)}</span>
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
