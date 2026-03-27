import React from 'react';
import { ExpenseForm } from './ExpenseForm.component';
import { ModalComponent } from './ui/Modal.component';
import { Expense } from '../interfaces';
interface AddEditExpenseModalProps {
    isModalOpen: boolean;
    handleCloseForm: () => void;
    editingExpense: any; // Replace with your actual expense type
    categories: any[]; // Replace with your actual category type
    paymentModes: any[]; // Replace with your actual payment mode type
    handleSubmit: (data: Omit<Expense, "id" | "modifiedAt" | "userId">) => Promise<void>; // Replace with your actual submit handler type
    isSubmitting: boolean;
}
export const AddEditExpenseModal: React.FC<AddEditExpenseModalProps> = (props) => (
    <ModalComponent
        isOpen={props.isModalOpen}
        onClose={props.handleCloseForm}
        title={props.editingExpense ? "Edit Expense" : "Add Expense"}
    >
        <ExpenseForm
            initialData={props.editingExpense}
            categories={props.categories}
            paymentModes={props.paymentModes}
            onSubmit={props.handleSubmit}
            onCancel={props.handleCloseForm}
            isSubmitting={props.isSubmitting}
        />
    </ModalComponent>
)