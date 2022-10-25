import { useState, useEffect } from "react";
import CategoryService from "../../services/CategoryService";
const ListCategory = (props) => {
    const [categories, setCategories] = useState([]);
    const service = CategoryService.getInstance();
    const getCategories = async () => {
        const data = await service.getCategory();
        console.log('data from db', data)
        setCategories(data);
    }
    useEffect(() => {
        (async () => {
            getCategories();
        })();
    }, []);    // eslint-disable-line react-hooks/exhaustive-deps 
    const selectionChanged = (event) => {
        props.categorySelectionChanged(event.target.value)
    }
    return (
        <select onChange={selectionChanged}>
            {
                categories.map((category) => (
                    <option key={category.id} value={category.value}>{category.title}</option>
                ))
            }
            <option value="">Please select category</option>
        </select>
    );
}
export default ListCategory;