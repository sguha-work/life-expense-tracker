import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Expense } from '../../interfaces';
import { expenseService } from '../../services/expenseService';
import { AppLayout } from '../../components/layout/AppLayout';

export const YearWiseHistory: React.FC = () => {
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

  const groupedByYear = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    expenses.forEach(expense => {
      const year = new Date(expense.createdAt).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(expense);
    });
    return groups;
  }, [expenses]);

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Yearly History</h2>
          <p className="text-sm text-slate-500 font-medium">Your expenses grouped by year</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(groupedByYear).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByYear)
              .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
              .map(([year, yearExpenses]) => {
              const total = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
              const count = yearExpenses.length;
              return (
                <div key={year} className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors" />
                  <div className="relative z-10 flex items-center justify-between text-white">
                    <div>
                      <h3 className="font-bold text-2xl tracking-tight">{year}</h3>
                      <p className="text-blue-100 font-medium mt-1">{count} transaction{count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold mb-1">Total</p>
                      <span className="block font-extrabold text-2xl">₹{total.toFixed(2)}</span>
                    </div>
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
