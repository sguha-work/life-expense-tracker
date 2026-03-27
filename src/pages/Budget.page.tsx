import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Wallet } from 'lucide-react';
import { User, Category } from '../interfaces';
import { categoryService } from '../services/category.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { AppLayout } from '../components/layout/AppLayout';

interface BudgetFormData {
  categoryId: string;
  budgetMode: 'd' | 'm' | 'y';
  budgetAmount: number;
}

export const Budget: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BudgetFormData>({
    defaultValues: {
      budgetMode: 'm',
      budgetAmount: 0
    }
  });

  useEffect(() => {
    fetchCategories();
  }, [user.id]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const fetched = await categoryService.getCategories(user.id);
      setCategories(fetched);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      await categoryService.updateCategory(data.categoryId, {
        budgetMode: data.budgetMode,
        budgetAmount: Number(data.budgetAmount),
        modifiedBy: user.id,
        modifiedOn: Date.now()
      });
      toast.success('Budget saved!');
      reset({ categoryId: '', budgetMode: 'm', budgetAmount: 0 });
      await fetchCategories();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setValue('categoryId', cat.id!);
    setValue('budgetMode', cat.budgetMode || 'm');
    setValue('budgetAmount', cat.budgetAmount || 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (cat: Category) => {
    if (confirm(`Are you sure you want to delete budget for ${cat.name}?`)) {
      try {
        await categoryService.updateCategory(cat.id!, {
          budgetAmount: 0,
          modifiedBy: user.id,
          modifiedOn: Date.now()
        });
        toast.success('Budget deleted');
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast.error('Failed to delete budget');
      }
    }
  };

  const categoriesWithBudget = categories.filter(c => c.budgetAmount && c.budgetAmount > 0);

  const getModeLabel = (mode?: string) => {
    switch (mode) {
      case 'd': return 'Daily';
      case 'm': return 'Monthly';
      case 'y': return 'Yearly';
      default: return '';
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div>
          <h2 className="text-2xl font-extrabold text-main tracking-tight">Budget Management</h2>
          <p className="text-sm text-muted font-medium">Set and track your spending limits</p>
        </div>

        {/* Budget Form */}
        <div className="bg-card p-6 rounded-2xl border border-main shadow-sm space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select
              label="Category"
              options={[
                { label: 'Select Category', value: '' },
                ...categories.map(cat => ({ label: cat.name, value: cat.id! }))
              ]}
              {...register('categoryId', { required: 'Please select a category' })}
              error={errors.categoryId?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Budget Mode"
                options={[
                  { label: 'Daily', value: 'd' },
                  { label: 'Monthly', value: 'm' },
                  { label: 'Yearly', value: 'y' }
                ]}
                {...register('budgetMode', { required: true })}
              />

              <Input
                label="Amount (INR)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('budgetAmount', { 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                error={errors.budgetAmount?.message}
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Save Budget
            </Button>
          </form>
        </div>

        {/* Budget List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-main px-1">Active Budgets</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : categoriesWithBudget.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-2xl border border-dashed border-main">
              <p className="text-muted font-medium">No budgets set yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {categoriesWithBudget.map((cat) => (
                <div key={cat.id} className="bg-card p-4 rounded-xl shadow-sm border border-main flex items-center justify-between group transition-all hover:shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-main">{cat.name}</h4>
                      <p className="text-xs text-muted font-medium">
                        {getModeLabel(cat.budgetMode)}: ₹{cat.budgetAmount?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
