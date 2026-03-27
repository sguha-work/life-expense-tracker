import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileDown } from 'lucide-react';
import { User, Expense, Category } from '../interfaces';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { useTheme } from '../configuration/ThemeContext';

export const ExportReport: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const { theme } = useTheme();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [fetchedExpenses, fetchedCategories] = await Promise.all([
          expenseService.getExpenses(user.id, undefined, selectedMonth, selectedYear),
          categoryService.getCategories(user.id),
        ]);
        if (!cancelled) {
          setExpenses(fetchedExpenses);
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error('Error loading export data:', error);
        if (!cancelled) toast.error('Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user.id, selectedMonth, selectedYear]);

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || 'Unknown';

  const previewTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const { exportExpenseReportExcel } = await import('../utils/exportExpenseReportExcel');
      await exportExpenseReportExcel(expenses, getCategoryName, selectedYear, selectedMonth, categories);
      toast.success('Excel report downloaded');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Could not generate the report. Try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div>
          <h2
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: theme === 'light' ? 'black' : 'white' }}
          >
            Export report
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Download an Excel workbook with all transactions, category and payment-mode breakdowns, and
            charts for the selected month.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-main shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="block w-full px-4 py-2.5 rounded-xl border border-main bg-white font-medium text-black [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark]"
              >
                {months.map((month, index) => (
                  <option
                    key={month}
                    value={index}
                    className="bg-white text-black dark:bg-slate-900 dark:text-slate-100"
                    disabled={selectedYear === now.getFullYear() && index > now.getMonth()}
                  >
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value, 10);
                  setSelectedYear(year);
                  if (year === now.getFullYear() && selectedMonth > now.getMonth()) {
                    setSelectedMonth(now.getMonth());
                  }
                }}
                className="block w-full px-4 py-2.5 rounded-xl border border-main bg-white font-medium text-black [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark]"
              >
                {[...Array(10)].map((_, i) => (
                  <option
                    key={now.getFullYear() - i}
                    value={now.getFullYear() - i}
                    className="bg-white text-black dark:bg-slate-900 dark:text-slate-100"
                  >
                    {now.getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-primary border border-main px-4 py-3 text-sm text-main">
            {loading ? (
              <span className="text-muted">Loading…</span>
            ) : (
              <>
                <span className="font-semibold">{expenses.length}</span> expense
                {expenses.length !== 1 ? 's' : ''} in this period ·{' '}
                <span className="font-semibold">₹{previewTotal.toFixed(2)}</span> total
              </>
            )}
          </div>

          <Button
            type="button"
            className="w-full sm:w-auto py-3 px-6"
            onClick={handleExport}
            disabled={loading || exporting || expenses.length === 0}
            isLoading={exporting}
          >
            <FileDown size={20} className="mr-2 shrink-0" />
            Export Excel
          </Button>

          <p className="text-xs text-muted leading-relaxed">
            The file includes four sheets: (1) all expenses with date, time, category, payment mode,
            and a grand total; (2) expenses grouped by category with per-category totals; (3) expenses
            grouped by payment mode with totals; (4) a bar chart by category and a pie chart by payment
            method (as images).
          </p>
        </div>
      </div>
    </AppLayout>
  );
};
