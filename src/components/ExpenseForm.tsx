import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Expense, Category, ExpenseMode } from '../interfaces';

interface ExpenseFormProps {
  initialData?: Expense;
  categories: Category[];
  onSubmit: (data: Omit<Expense, 'id' | 'createdAt' | 'modifiedAt' | 'userId'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  description: string;
  amount: number;
  mode: ExpenseMode;
  categoryId: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      description: initialData?.description || '',
      amount: initialData?.amount || 0,
      mode: initialData?.mode || 'Direct',
      categoryId: initialData?.categoryId || '',
    }
  });

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id! }));
  if (categoryOptions.length === 0) {
    categoryOptions.push({ label: 'No Categories Available', value: '' });
  }

  const submitHandler = async (data: FormData) => {
    await onSubmit({
      ...data,
      amount: Number(data.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
      <Input
        label="Description"
        placeholder="e.g. Groceries"
        {...register('description', { required: 'Description is required' })}
        error={errors.description?.message}
      />
      
      <Input
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        {...register('amount', { 
          required: 'Amount is required',
          min: { value: 0.01, message: 'Amount must be greater than 0' }
        })}
        error={errors.amount?.message}
      />

      <Select
        label="Category"
        {...register('categoryId', { required: 'Category is required' })}
        error={errors.categoryId?.message}
        options={[{ label: 'Select a category...', value: '' }, ...categoryOptions]}
      />

      <Select
        label="Payment Mode"
        {...register('mode', { required: 'Payment mode is required' })}
        error={errors.mode?.message}
        options={[
          { label: 'Direct', value: 'Direct' },
          { label: 'Credit', value: 'Credit' }
        ]}
      />

      <div className="pt-4 flex space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          isLoading={isSubmitting}
        >
          {initialData ? 'Update' : 'Add'} Expense
        </Button>
      </div>
    </form>
  );
};
