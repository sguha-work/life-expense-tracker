import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Expense, Category, PaymentMode, DEFAULT_PAYMENT_MODES } from '../interfaces';

interface ExpenseFormProps {
  initialData?: Expense;
  categories: Category[];
  paymentModes: PaymentMode[];
  onSubmit: (data: Omit<Expense, 'id' | 'modifiedAt' | 'userId'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface FormData {
  description: string;
  amount: number;
  mode: string;
  categoryId: string;
  datetime: string;
}

const toLocalISOString = (timestamp: number) => {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  categories,
  paymentModes,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [showDateTime, setShowDateTime] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      description: initialData?.description || '',
      amount: initialData?.amount || 0,
      mode: initialData?.mode || 'Cash',
      categoryId: initialData?.categoryId || '',
      datetime: toLocalISOString(initialData?.createdAt || Date.now()),
    }
  });

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id! }));
  if (categoryOptions.length === 0) {
    categoryOptions.push({ label: 'No Categories Available', value: '' });
  }

  const paymentOptions = [
    ...DEFAULT_PAYMENT_MODES.map(pm => ({ label: pm.name, value: pm.name })),
    ...paymentModes.map(pm => ({ label: pm.name, value: pm.name }))
  ];

  const submitHandler = async (data: FormData) => {
    await onSubmit({
      description: data.description,
      amount: Number(data.amount),
      mode: data.mode,
      categoryId: data.categoryId,
      createdAt: new Date(data.datetime).getTime(),
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
      
      <div className={showDateTime ? "block animate-in fade-in slide-in-from-top-2 duration-300" : "hidden"}>
        <Input
          label="Date & Time"
          type="datetime-local"
          max={toLocalISOString(Date.now())}
          {...register('datetime', { 
            required: 'Date and time is required',
            validate: (value) => new Date(value).getTime() <= Date.now() || 'Cannot select a future date and time'
          })}
          error={errors.datetime?.message}
        />
      </div>
      
      {!showDateTime && (
        <div className="flex justify-end -mt-2 mb-2">
          <button 
            type="button" 
            onClick={() => setShowDateTime(true)}
            className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center transition-colors"
          >
            <Calendar size={14} className="mr-1.5" /> 
            Show date & time
          </button>
        </div>
      )}
      
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
        options={paymentOptions}
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
