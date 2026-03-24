import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Expense, Category, PaymentMode, DEFAULT_PAYMENT_MODES } from '../../interfaces';
import { expenseService } from '../../services/expenseService';
import { categoryService } from '../../services/categoryService';
import { paymentModeService } from '../../services/paymentModeService';
import { AppLayout } from '../../components/layout/AppLayout';
import { ExpenseCard } from '../../components/ExpenseCard';
import { Modal } from '../../components/ui/Modal';
import { ExpenseForm } from '../../components/ExpenseForm';
import toast from 'react-hot-toast';

export const DateWiseHistory: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [selectedDate, setSelectedDate] = useState(yesterday.toISOString().split('T')[0]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user.id, selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateObj = new Date(selectedDate);
      const [fetchedExpenses, fetchedCategories, fetchedPaymentModes] = await Promise.all([
        expenseService.getExpenses(user.id, dateObj.getDate(), dateObj.getMonth(), dateObj.getFullYear()),
        categoryService.getCategories(user.id),
        paymentModeService.getPaymentModes(user.id)
      ]);
      setExpenses(fetchedExpenses);
      setCategories(fetchedCategories);
      setPaymentModes(fetchedPaymentModes);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const credit = expenses
      .filter(e => {
        const mode = paymentModes.find(m => m.name === e.mode) || DEFAULT_PAYMENT_MODES.find(m => m.name === e.mode);
        return mode?.isCredit;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    const other = total - credit;
    return { total, credit, other };
  }, [expenses, paymentModes]);

  const handleOpenForm = (expense?: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditingExpense(undefined);
  };

  const handleSubmit = async (data: Omit<Expense, 'id' | 'modifiedAt' | 'userId'>) => {
    setIsSubmitting(true);
    try {
      if (editingExpense?.id) {
        await expenseService.updateExpense(editingExpense.id, data);
        toast.success('Expense updated!');
      } else {
        await expenseService.addExpense({
          ...data,
          userId: user.id
        });
        toast.success('Expense added!');
      }
      await fetchData();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        toast.success('Expense deleted');
        await fetchData();
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Date-wise History</h2>
            <p className="text-sm text-slate-500 font-medium">View and manage expenses by date</p>
          </div>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-4 py-2 text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            />
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Total Spends</p>
            <p className="text-2xl font-extrabold text-slate-800">₹{totals.total.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <p className="text-[10px] text-red-400 uppercase font-bold tracking-wider mb-1">Credit Spends</p>
            <p className="text-2xl font-extrabold text-slate-800">₹{totals.credit.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <p className="text-[10px] text-green-400 uppercase font-bold tracking-wider mb-1">Other Spends</p>
            <p className="text-2xl font-extrabold text-slate-800">₹{totals.other.toFixed(2)}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">No expenses recorded for this date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                categoryName={getCategoryName(expense.categoryId)}
                onEdit={handleOpenForm}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseForm} 
        title={editingExpense ? "Edit Expense" : "Add Expense"}
      >
        <ExpenseForm
          initialData={editingExpense}
          categories={categories}
          paymentModes={paymentModes}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </AppLayout>
  );
};
