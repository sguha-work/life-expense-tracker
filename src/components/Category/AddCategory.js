import { useState } from "react";
import CategoryService from "../../services/CategoryService";
const AddCategory = (props) => {
    const [title, setTitle] = useState('');
    const expenceTypeTitleChanged = (event) => {
        setTitle(event.target.value);
    }
    const addCategoryFormSubmit = (event) => {
        event.preventDefault();
        const service = CategoryService.getInstance();
        service.setCategory({
            title: title,
            value: title.toLowerCase()
        });
        if (props.afterCategoryAdded) {console.log(1);
            props.afterCategoryAdded();
        }
    }
    return (
        <form onSubmit={addCategoryFormSubmit}>
            <p>if needed enter new category from here</p>
            <label>Enter category name</label>
            <input type="text" value={title} onChange={expenceTypeTitleChanged}></input>
            <br></br>
            <button>Add expense type</button>
        </form>
    );
}
export default AddCategory;