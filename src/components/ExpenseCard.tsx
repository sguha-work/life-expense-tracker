import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Expense } from '../interfaces';

interface ExpenseCardProps {
  expense: Expense;
  categoryName: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  categoryName,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-card p-4 rounded-2xl shadow-sm border border-main flex items-center justify-between group transition-all hover:shadow-md">
      <div className="flex-1">
        <p className="font-semibold text-main">{expense.description}</p>
        <div className="flex space-x-2 text-xs font-medium mt-1">
          <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
            {categoryName}
          </span>
          <span className="text-muted bg-primary px-2 py-0.5 rounded-full">
            {expense.mode}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
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
