import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, RefreshCw } from 'lucide-react';
import { User, Expense, Category, PaymentMode, DEFAULT_PAYMENT_MODES } from '../interfaces';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { paymentModeService } from '../services/paymentModeService';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ExpenseForm } from '../components/ExpenseForm';
import { AppLayout } from '../components/layout/AppLayout';
import { ExpenseCard } from '../components/ExpenseCard';

export const Home: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user.id]);

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
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

  const todaysExpenses = useMemo(() => {
    return expenses.filter(e => e.createdAt >= todayStart.getTime());
  }, [expenses, todayStart]);

  const todayTotal = useMemo(() => {
    return todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [todaysExpenses]);

  const creditTotal = useMemo(() => {
    return todaysExpenses
      .filter(e => {
        const mode = paymentModes.find(m => m.name === e.mode) || DEFAULT_PAYMENT_MODES.find(m => m.name === e.mode);
        return mode?.isCredit;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [todaysExpenses, paymentModes]);

  const otherTotal = useMemo(() => todayTotal - creditTotal, [todayTotal, creditTotal]);

  const monthTotal = useMemo(() => {
    return expenses
      .filter(e => e.createdAt >= monthStart.getTime())
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, monthStart]);

  const handleOpenForm = (expense?: Expense) => {
    if (categories.length === 0) {
      toast.error('Please create at least one category before adding an expense.');
      navigate('/categories');
      return;
    }
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

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category-details?id=${categoryId}`);
  };

  const handlePaymentModeClick = (mode: string) => {
    navigate(`/payment-mode-details?mode=${encodeURIComponent(mode)}`);
  };

  const handleSync = () => {
    localStorage.clear();
    fetchData();
    toast.success('Cache cleared. latest data fetched...');
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 pb-24 space-y-6">
        {/* Header Stats */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <p className="text-blue-100 font-medium tracking-wide text-sm mb-1 uppercase">Today's Expense</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold tracking-tight">₹{todayTotal.toFixed(2)}</span>
            <span className="text-blue-200 text-sm font-medium">INR</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] text-blue-100 uppercase font-bold tracking-wider mb-1">Credit</p>
              <p className="text-xl font-bold">₹{creditTotal.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] text-blue-100 uppercase font-bold tracking-wider mb-1">Other</p>
              <p className="text-xl font-bold">₹{otherTotal.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-blue-50">
              <TrendingUp size={16} />
              <span className="font-semibold">This Month</span>
            </div>
            <span className="font-bold text-white">₹{monthTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full py-4 rounded-2xl shadow-md text-base"
          onClick={() => handleOpenForm()}
        >
          <Plus size={20} className="mr-2" /> Add Expense
        </Button>

        {/* Sync Button */}
        <Button 
          className="w-full py-4 rounded-2xl shadow-md text-base bg-gray-500 hover:bg-gray-600"
          onClick={handleSync}
        >
          <RefreshCw size={20} className="mr-2" /> Sync
        </Button>

        {/* Today's List */}
        <div>
          <h3 className="text-lg font-bold text-main mb-4 px-1">Today's Transactions</h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : todaysExpenses.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-main shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 mb-4">
                <Plus size={32} />
              </div>
              <p className="text-muted font-medium">No expenses recorded today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  categoryName={getCategoryName(expense.categoryId)}
                  onEdit={handleOpenForm}
                  onDelete={handleDelete}
                  onCategoryClick={handleCategoryClick}
                  onPaymentModeClick={handlePaymentModeClick}
                />
              ))}
            </div>
          )}
        </div>
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
