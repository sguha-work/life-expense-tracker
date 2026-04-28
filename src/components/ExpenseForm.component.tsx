import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import { InputComponent } from './ui/Input.component';
import { SelectComponent } from './ui/Select.component';
import { ButtonComponent } from './ui/Button.component';
import { Expense, Category, PaymentMode, DEFAULT_PAYMENT_MODES } from '../interfaces';

interface ExpenseFormProps {
  initialData?: Expense;
  categories: Category[];
  paymentModes: PaymentMode[];
  onSubmit: (data: Omit<Expense, 'id' | 'modifiedAt' | 'userId'>) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
  isSubmitting?: boolean;
}

interface FormData {
  description: string;
  amount: string;
  mode: string;
  categoryId: string;
  datetime: string;
}

const evaluateExpression = (expr: string | number): number => {
  if (expr === undefined || expr === null || expr === '') return 0;
  if (typeof expr === 'number') return expr;
  return expr
    .split('+')
    .map(part => parseFloat(part.trim()))
    .filter(val => !isNaN(val))
    .reduce((sum, val) => sum + val, 0);
};

const validateNotFuture = (value: string) => new Date(value).getTime() <= Date.now() || 'Cannot select a future date and time';

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
  isSubmitting,
  isEditing
}) => {
  const [showDateTime, setShowDateTime] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    defaultValues: {
      description: initialData?.description || '',
      amount: initialData?.amount?.toString() || '',
      mode: initialData?.mode || 'Cash',
      categoryId: initialData?.categoryId || '',
    }
  });

  useEffect(() => {
    // Set datetime and maxDatetime after initial render to avoid calling impure functions during render
    const datetimeValue = toLocalISOString(initialData?.createdAt ?? Date.now());
    reset({
      description: initialData?.description || '',
      amount: initialData?.amount?.toString() || '',
      mode: initialData?.mode || 'Cash',
      categoryId: initialData?.categoryId || '',
      datetime: datetimeValue,
    });
  }, [initialData, reset]);

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
      amount: evaluateExpression(data.amount),
      mode: data.mode,
      categoryId: data.categoryId,
      createdAt: new Date(data.datetime).getTime(),
    });
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes('+')) {
      const result = evaluateExpression(val);
      if (result > 0) {
        setValue('amount', result.toString());
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
      <InputComponent
        label="Description"
        maxLength= {200}
        placeholder="e.g. Groceries"
        {...register('description', { required: 'Description is required' })}
        error={errors.description?.message}
      />
      
      <div className={showDateTime || isEditing ? "block animate-in fade-in slide-in-from-top-2 duration-300" : "hidden"}>
        <InputComponent
          label="Date & Time"
          type="datetime-local"
          {...register('datetime', { 
            required: 'Date and time is required',
            validate: validateNotFuture
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
      
      <InputComponent
        label="Amount"
        type="text"
        placeholder="0.00 (supports 10+20)"
        {...register('amount', { 
          required: 'Amount is required',
          validate: (val) => evaluateExpression(val) > 0 || 'Amount must be greater than 0'
        })}
        onBlur={handleAmountBlur}
        error={errors.amount?.message}
      />

      <SelectComponent
        label="Category"
        {...register('categoryId', { required: 'Category is required' })}
        error={errors.categoryId?.message}
        options={[{ label: 'Select a category...', value: '' }, ...categoryOptions]}
      />

      <SelectComponent
        label="Payment Mode"
        {...register('mode', { required: 'Payment mode is required' })}
        error={errors.mode?.message}
        options={paymentOptions}
      />

      <div className="pt-4 flex space-x-3">
        <ButtonComponent 
          type="button" 
          variant="outline" 
          className="flex-1" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </ButtonComponent>
        <ButtonComponent 
          type="submit" 
          className="flex-1"
          isLoading={isSubmitting}
        >
          {initialData ? 'Update' : 'Add'} Expense
        </ButtonComponent>
      </div>
    </form>
  );
};
