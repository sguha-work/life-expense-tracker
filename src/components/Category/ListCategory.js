import { useState, useEffect } from "react";
import CategoryService from "../../services/CategoryService";
const ListCategory = (props) => {
    const [categories, setCategories] = useState([]);
    const service = CategoryService.getInstance();
    const getCategories = async () => {
        let data;
        if (props.categories.length) {
            data = props.categories;
        } else {
            data = await service.getCategory();
        }
        setCategories(data);
    }
    useEffect(() => {
        (async () => {
            getCategories();
        })();
    }, []);    // eslint-disable-line react-hooks/exhaustive-deps 
    useEffect(()=>{
        if(props.categories.length) {
            setCategories(props.categories);
        }
    },[props.categories]);
    const selectionChanged = (event) => {
        props.categorySelectionChanged(event.target.value)
    }
    return (
        <select onChange={selectionChanged}>
            {
                categories.map((category) => (
                    <option key={category.id?category.id:'xxx'} value={category.value}>{category.title}</option>
                ))
            }
            <option value="">Please select category</option>
        </select>
    );
}
export default ListCategory;