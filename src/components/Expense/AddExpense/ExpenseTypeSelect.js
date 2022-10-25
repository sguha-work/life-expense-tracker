import ListCategory from '../../Category/ListCategory';
import './ExpenseTypeSelect.css';
const ExpenseTypeSelect = (props) => {
    const categorySelectionChanged = (event) => {
        props.setExpenseType(event.target.value);
    }
    return (
        <ListCategory categorySelectionChanged={categorySelectionChanged}></ListCategory>
    );
}
export default ExpenseTypeSelect;