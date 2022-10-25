import ListCategory from '../../Category/ListCategory';
import './ExpenseTypeSelect.css';
const ExpenseTypeSelect = (props) => {
    const categorySelectionChanged = (value) => {
        props.setExpenseType(value);
    }
    return (
        <ListCategory categorySelectionChanged={categorySelectionChanged}></ListCategory>
    );
}
export default ExpenseTypeSelect;