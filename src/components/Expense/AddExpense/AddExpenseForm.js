import './AddExpenseForm.css';
import ExpenseTypeSelect from './ExpenseTypeSelect';
const AddExpenseForm = () => {
    /**
     * The value is coming from the ListCategory->ExpenseTypeSelect component
     * @param {*} value 
     */
    const setExpenseType = (value)=>{
        alert(value);
    }
    return (
        <form method="post" action="/" id="form" className="validate">
            <div className="form-field">
                <label htmlFor="expense-type">Expense type</label>
                <ExpenseTypeSelect setExpenseType={setExpenseType}></ExpenseTypeSelect>
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