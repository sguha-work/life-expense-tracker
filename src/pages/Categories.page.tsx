import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Category } from '../interfaces';
import { categoryService } from '../services/category.service';
import { ButtonComponent } from '../components/ui/Button.component';
import { InputComponent } from '../components/ui/Input.component';
import { ModalComponent } from '../components/ui/Modal.component';
import { AppLayout } from '../components/layout/AppLayout.component';

export const Categories: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ name: string }>();

  useEffect(() => {
    fetchCategories();
  }, [user.id]);

  useEffect(() => {
    if (editingCategory) {
      reset({ name: editingCategory.name });
    } else {
      reset({ name: '' });
    }
  }, [editingCategory, reset]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const fetched = await categoryService.getCategories(user.id);
      setCategories(fetched);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(undefined);
    reset({ name: '' });
  };

  const onSubmit = async (data: { name: string }) => {
    setIsSubmitting(true);
    try {
      let categorieNamesList: string[] = []
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_categories_')) {
          let categories = JSON.parse(localStorage.getItem(key) || '[]') as Category[];
          categories.forEach(cat => {
            if (cat.createdBy === user.id) {
              categorieNamesList.push(cat.name.toLowerCase());
            }
          });
        }
      })
      if (categorieNamesList.includes(data.name.toLowerCase())) {
        toast.error('Category with this name already exists!');
        setIsSubmitting(false);
        return;
      }
      if (editingCategory?.id) {
        await categoryService.updateCategory(editingCategory.id, {
          name: data.name,
          modifiedBy: user.id,
          modifiedOn: Date.now()
        });
        toast.success('Category updated!');
      } else {
        await categoryService.addCategory({
          name: data.name,
          createdBy: user.id,
          createdOn: Date.now()
        });
        toast.success('Category added!');
      }
      await fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? (Expenses using this category might not display properly)')) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('Category deleted');
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-main tracking-tight">Categories</h2>
            <p className="text-sm text-muted font-medium">Manage your expense types</p>
          </div>
          <ButtonComponent onClick={() => handleOpenModal()} className="rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md dark:shadow-none">
            <Plus size={24} />
          </ButtonComponent>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-main shadow-sm">
            <p className="text-muted font-medium mb-4">No categories added yet.</p>
            <ButtonComponent variant="outline" onClick={() => handleOpenModal()}>
              Create First Category
            </ButtonComponent>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-card p-4 rounded-xl shadow-sm border border-main flex items-center justify-between group transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900">
                <div className="flex flex-col min-w-0">
                  {cat.budgetAmount && cat.budgetAmount > 0 && cat.id ? (
                    <Link
                      to={`/category-details?id=${cat.id}&backto=categories`}
                      className="group flex flex-col text-left rounded-lg -m-1 p-1 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-main group-hover:text-blue-700 dark:group-hover:text-blue-300 underline-offset-2 group-hover:underline">
                          {cat.name}
                        </span>
                        <ChevronRight size={16} className="text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      </div>
                      <span className="text-xs text-muted font-medium">
                        budget {cat.budgetMode === 'd' ? 'daily' : cat.budgetMode === 'y' ? 'yearly' : 'monthly'}{' '}
                        {cat.budgetAmount} INR
                      </span>
                    </Link>
                  ) : (
                    <>
                      <span className="font-semibold text-main">{cat.name}</span>
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(cat)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => cat.id && handleDelete(cat.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalComponent
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? "Edit Category" : "New Category"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputComponent
            maxLength={200}
            label="Category Name"
            placeholder="e.g. Utilities"
            {...register('name', { required: 'Category name is required' })}
            error={errors.name?.message}
          />
          <div className="pt-4 flex space-x-3">
            <ButtonComponent type="button" variant="outline" className="flex-1" onClick={handleCloseModal} disabled={isSubmitting}>
              Cancel
            </ButtonComponent>
            <ButtonComponent type="submit" className="flex-1" isLoading={isSubmitting}>
              {editingCategory ? 'Update' : 'Add'}
            </ButtonComponent>
          </div>
        </form>
      </ModalComponent>
    </AppLayout>
  );
};
