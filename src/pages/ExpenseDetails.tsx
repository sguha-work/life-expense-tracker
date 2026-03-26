import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, CreditCard, IndianRupee } from 'lucide-react';
import { User, Expense, Category, PaymentMode, DEFAULT_PAYMENT_MODES } from '../interfaces';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { paymentModeService } from '../services/paymentModeService';
import toast from 'react-hot-toast';
import { AppLayout } from '../components/layout/AppLayout';

export const ExpenseDetails: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      toast.error('Expense ID is missing');
      navigate('/');
      return;
    }
    fetchData();
  }, [user.id, id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedExpenses, fetchedCategories, fetchedPaymentModes] = await Promise.all([
        expenseService.getExpenses(user.id),
        categoryService.getCategories(user.id),
        paymentModeService.getPaymentModes(user.id)
      ]);
      
      const foundExpense = fetchedExpenses.find(e => e.id === id);
      if (!foundExpense) {
        toast.error('Expense not found');
        navigate('/');
        return;
      }
      
      setExpense(foundExpense);
      setCategories(fetchedCategories);
      setPaymentModes(fetchedPaymentModes);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const categoryName = useMemo(() => {
    if (!expense) return 'Unknown';
    return categories.find(c => c.id === expense.categoryId)?.name || 'Unknown';
  }, [expense, categories]);

  const paymentModeDetails = useMemo(() => {
    if (!expense) return null;
    return paymentModes.find(m => m.name === expense.mode) || 
           DEFAULT_PAYMENT_MODES.find(m => m.id === expense.mode || m.name === expense.mode);
  }, [expense, paymentModes]);

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 pb-24 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !expense ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-main shadow-sm">
            <p className="text-muted font-medium">Expense not found</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Amount Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-10 -mt-10" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mb-10" />
              
              <div className="bg-white/20 p-3 rounded-full mb-4 backdrop-blur-md">
                <IndianRupee size={32} />
              </div>
              <p className="text-blue-100 font-medium tracking-widest text-xs uppercase mb-1">Expense Amount</p>
              <h2 className="text-5xl font-black tracking-tighter mb-2">₹{expense.amount.toFixed(2)}</h2>
              <div className="flex items-center space-x-2 bg-black/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                <Calendar size={14} />
                <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-card rounded-2xl border border-main shadow-sm divide-y divide-main overflow-hidden">
              {/* Category */}
              <div className="p-5 flex items-start space-x-4">
                <div className="p-2.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-xl">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Category</p>
                  <p className="text-lg font-bold text-main">{categoryName}</p>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="p-5 flex items-start space-x-4">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Payment Mode</p>
                  <p className="text-lg font-bold text-main">{expense.mode}</p>
                  {paymentModeDetails?.isCredit && (
                    <span className="inline-flex mt-1 px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-md uppercase">Credit Mode</span>
                  )}
                </div>
              </div>

              {/* Date & Time */}
              <div className="p-5 flex items-start space-x-4">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="text-sm font-semibold text-main leading-relaxed">
                    {formatDateTime(expense.createdAt)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="p-5 flex items-start space-x-4">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Tag size={20} className="rotate-90" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Description</p>
                  <p className="text-base font-medium text-main text-justify leading-relaxed break-words">
                    {expense.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Metadata */}
            {expense.modifiedAt && (
              <p className="text-center text-[10px] text-muted font-medium">
                Last modified on {formatDateTime(expense.modifiedAt)}
              </p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
