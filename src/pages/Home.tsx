import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { User, Expense, Category } from '../interfaces';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ExpenseForm } from '../components/ExpenseForm';
import { AppLayout } from '../components/layout/AppLayout';

export const Home: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

  const todaysExpenses = useMemo(() => {
    return expenses.filter(e => e.createdAt >= todayStart.getTime());
  }, [expenses, todayStart]);

  const todayTotal = useMemo(() => {
    return todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [todaysExpenses]);

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

  const handleSubmit = async (data: Omit<Expense, 'id' | 'createdAt' | 'modifiedAt' | 'userId'>) => {
    setIsSubmitting(true);
    try {
      if (editingExpense?.id) {
        await expenseService.updateExpense(editingExpense.id, data);
        toast.success('Expense updated!');
      } else {
        await expenseService.addExpense({
          ...data,
          userId: user.id,
          createdAt: Date.now()
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
      <div className="p-4 sm:p-6 pb-24 space-y-6">
        {/* Header Stats */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <p className="text-blue-100 font-medium tracking-wide text-sm mb-1 uppercase">Today's Expense</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold tracking-tight">₹{todayTotal.toFixed(2)}</span>
            <span className="text-blue-200 text-sm font-medium">INR</span>
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

        {/* Today's List */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Today's Transactions</h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : todaysExpenses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
                <Plus size={32} />
              </div>
              <p className="text-slate-500 font-medium">No expenses recorded today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysExpenses.map((expense) => (
                <div key={expense.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group transition-all hover:shadow-md">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{expense.description}</p>
                    <div className="flex space-x-2 text-xs font-medium mt-1">
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {getCategoryName(expense.categoryId)}
                      </span>
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {expense.mode}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-slate-800">₹{expense.amount.toFixed(2)}</span>
                    <div className="flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenForm(expense)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => expense.id && handleDelete(expense.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
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
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </AppLayout>
  );
};
