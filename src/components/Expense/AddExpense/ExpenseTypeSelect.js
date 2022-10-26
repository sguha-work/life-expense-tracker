import { useState, useEffect } from 'react';
import ListCategory from '../../Category/ListCategory';
import './ExpenseTypeSelect.css';
const ExpenseTypeSelect = (props) => {
    const [categories, setCategories] = useState([]);
    useEffect(()=>{
        if(props.categories.length) {
            setCategories(props.categories);
        }
    },[props.categories]);// eslint-disable-line react-hooks/exhaustive-deps 
    const categorySelectionChanged = (value) => {
        props.setExpenseType(value);
    }
    return (
        <ListCategory categories={categories} categorySelectionChanged={categorySelectionChanged}></ListCategory>
    );
}
export default ExpenseTypeSelect;