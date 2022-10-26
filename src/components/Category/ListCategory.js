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
    useEffect(() => {
        if (props.categories.length) {
            setCategories(props.categories);
        }
    }, [props.categories]);
    const selectionChanged = (event) => {
        props.categorySelectionChanged(event.target.value)
    }
    const deleteCategory = async (event, categoryIdToDelete)=>{
        event.preventDefault();
        if(!categoryIdToDelete) {
            alert('This element is yet to sync, refresh the page before delete');
        } else {
            if(window.confirm('Do you realy want to delete this category?')) {
                service.deleteCategory(categoryIdToDelete);
                await getCategories();
            }
        }
    }
    const editCategory = (event, categoryIdToDelete)=>{

    }
    return (
        <div>
            <p>Following table contains list of already added categories</p>
            <table>
                <thead>
                    <tr>
                        <th>
                        Title
                        </th>
                        <th>
                            Edit
                        </th>
                        <th>
                            Delete
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        categories.map((category)=>(
                            <tr key={category.id ? category.id : 'xxx'}>
                        <td>{category.title}</td>
                        <td><a href="/" onClick={(e)=>editCategory(e,category.id)}>Edit</a></td>
                        <td><a href="/" onClick={(e)=>deleteCategory(e,category.id)}>Delete</a></td>
                    </tr>
                        ))
                    }
                </tbody>
            </table>
            <select onChange={selectionChanged}>
                {
                    categories.map((category) => (
                        <option data-key={category.id ? category.id : 'xxx'} key={category.id ? category.id : 'xxx'} value={category.value}>{category.title}</option>
                    ))
                }
                <option value="">Please select category</option>
            </select>
        </div>
    );
}
export default ListCategory;