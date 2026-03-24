import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { User, Expense, Category, PaymentMode } from '../interfaces';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { paymentModeService } from '../services/paymentModeService';
import toast from 'react-hot-toast';
import { AppLayout } from '../components/layout/AppLayout';
import { ExpenseCard } from '../components/ExpenseCard';
import { Modal } from '../components/ui/Modal';
import { ExpenseForm } from '../components/ExpenseForm';

export const CategoryDetails: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('id');

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      toast.error('Category not found');
      navigate('/');
      return;
    }
    fetchData();
  }, [user.id, categoryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedExpenses, fetchedCategories, fetchedPaymentModes] = await Promise.all([
        expenseService.getExpenses(user.id),
        categoryService.getCategories(user.id),
        paymentModeService.getPaymentModes(user.id)
      ]);
      setExpenses(fetchedExpenses);
      setCategories(fetchedCategories);
      setPaymentModes(fetchedPaymentModes);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = useMemo(() => {
    return categories.find(c => c.id === categoryId);
  }, [categories, categoryId]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const monthExpenses = useMemo(() => {
    return expenses.filter(
      e => e.categoryId === categoryId && e.createdAt >= monthStart.getTime() && e.createdAt <= monthEnd.getTime()
    );
  }, [expenses, categoryId, monthStart, monthEnd]);

  const totalAmount = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

  const expensesByPaymentMode = useMemo(() => {
    const byMode: { [key: string]: number } = {};
    monthExpenses.forEach(expense => {
      byMode[expense.mode] = (byMode[expense.mode] || 0) + expense.amount;
    });
    return byMode;
  }, [monthExpenses]);

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

  const monthName = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 pb-24 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !currentCategory ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-main shadow-sm">
            <p className="text-muted font-medium">Category not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-purple-100 font-medium tracking-wide text-sm mb-1 uppercase">
                {currentCategory.name} - {monthName}
              </p>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold tracking-tight">₹{totalAmount.toFixed(2)}</span>
                <span className="text-purple-200 text-sm font-medium">Total</span>
              </div>
              <p className="text-purple-100 text-sm mt-2">{monthExpenses.length} transaction(s)</p>
            </div>

            {/* Payment Mode Breakdown */}
            {Object.keys(expensesByPaymentMode).length > 0 && (
              <div className="bg-card rounded-2xl p-6 border border-main shadow-sm">
                <h3 className="text-lg font-bold text-main mb-4">Breakdown by Payment Mode</h3>
                <div className="space-y-3">
                  {Object.entries(expensesByPaymentMode).map(([mode, amount]) => (
                    <div key={mode} className="flex items-center justify-between p-3 bg-primary rounded-lg">
                      <span className="font-medium text-main">{mode}</span>
                      <span className="font-bold text-main">₹{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses List */}
            <div>
              <h3 className="text-lg font-bold text-main mb-4 px-1">Transactions</h3>
              {monthExpenses.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-main shadow-sm">
                  <p className="text-muted font-medium">No expenses in this category for {monthName}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {monthExpenses.map((expense) => (
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
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseForm}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
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
