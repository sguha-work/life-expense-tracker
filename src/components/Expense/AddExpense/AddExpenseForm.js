import { useState, useEffect } from 'react';
import './AddExpenseForm.css';
import ExpenseTypeSelect from './ExpenseTypeSelect';
const AddExpenseForm = (props) => {
    const [categories, setCategories] = useState([]);
    /**
     * The value is coming from the ListCategory->ExpenseTypeSelect component
     * @param {*} value 
     */
    const setExpenseType = (value)=>{
        alert(value);
    }
    useEffect(()=>{console.warn('AddExpenseForm');
        if(props.categories.length) {console.warn('AddExpenseForm-> use effect called for category changes');
            setCategories(props.categories);
        }
    },[props.categories]);// eslint-disable-line react-hooks/exhaustive-deps 
    return (
        <form method="post" action="/" id="form" className="validate">
            <div className="form-field">
                <label htmlFor="expense-type">Expense type</label>
                <ExpenseTypeSelect categories={categories} setExpenseType={setExpenseType}></ExpenseTypeSelect>
            </div>
            <div className="form-field">
                <label htmlFor="amount">Amount</label>
                <input type="number" name="amount" id="amount" placeholder="199" required />
            </div>
            
            <div className="form-field">
                <label htmlFor=""></label>
                <input type="submit" value="Submit expense" />
            </div>
        </form>
    );
}
export default AddExpenseForm;