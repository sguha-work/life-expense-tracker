import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Expense } from '../interfaces';

interface ExpenseCardProps {
  expense: Expense;
  categoryName: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onCategoryClick?: (categoryId: string) => void;
  onPaymentModeClick?: (mode: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  categoryName,
  onEdit,
  onCategoryClick,
  onPaymentModeClick,
  onDelete
}) => {
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div 
      className="select-none [-webkit-tap-highlight-color:transparent] bg-card p-4 rounded-2xl shadow-sm border border-main flex items-center justify-between group transition-all hover:shadow-md cursor-pointer"
      onClick={() => window.location.hash = `#/expense-details/${expense.id}`}
    >
      <div className="flex-1">
        <p className="font-semibold text-main">{truncate(expense.description, 17)} </p>
        <p className="text-xs">( {formatDateTime(expense.createdAt)} )</p>
        <div className="mt-1 flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCategoryClick?.(expense.categoryId);
            }}
            className="inline-flex items-center text-black bg-sky-50 dark:bg-sky-50 px-2.5 py-1 rounded-full text-[10px] font-medium hover:bg-sky-100 dark:hover:bg-sky-100 transition-colors cursor-pointer"
            title={categoryName}
          >
            {truncate(categoryName, 10)}
          </button>
          {onPaymentModeClick ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPaymentModeClick(expense.mode);
              }}
              className="inline-flex items-center text-black bg-sky-50 dark:bg-sky-50 px-2.5 py-1 rounded-full text-[10px] font-medium hover:bg-sky-100 dark:hover:bg-sky-100 transition-colors cursor-pointer"
              title={expense.mode}
            >
              {truncate(expense.mode, 10)}
            </button>
          ) : (
            <span className="inline-flex items-center text-black bg-sky-50 dark:bg-sky-50 px-2.5 py-1 rounded-full text-[10px] font-medium" title={expense.mode}>
              {truncate(expense.mode, 10)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
        <span className="font-bold text-main whitespace-nowrap">₹{expense.amount.toFixed(2)}</span>
        <div className="flex space-x-1">
          <button 
            onClick={() => onEdit(expense)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => expense.id && onDelete(expense.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
