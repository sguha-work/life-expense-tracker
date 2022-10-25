import AddExpenseForm from "../../components/Expense/AddExpense/AddExpenseForm";
import AddCategory from "../../components/Category/AddCategory";
const AddExpense = () => {
  return (
    <div>
      <AddCategory></AddCategory>
      <AddExpenseForm></AddExpenseForm>
    </div>
  );
};

export default AddExpense;