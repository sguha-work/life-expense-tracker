import { useState } from "react";
import AddExpenseForm from "../../components/Expense/AddExpense/AddExpenseForm";
import AddCategory from "../../components/Category/AddCategory";
import CategoryService from "../../services/CategoryService";
const AddExpense = () => {
  const [categoryData, setCategoryData] = useState([]);
  const getLatestCategoryData = async () => {
    console.log(2)
    const categoryServiceInstance = CategoryService.getInstance();
    const categories = await categoryServiceInstance.getCategory(); console.log('categories length', categories);
    setCategoryData(categories);
  }
  return (
    <div>
      <AddCategory afterCategoryAdded={getLatestCategoryData}></AddCategory>
      <AddExpenseForm categories={categoryData}></AddExpenseForm>
    </div>
  );
};

export default AddExpense;