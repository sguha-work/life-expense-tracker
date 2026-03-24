import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import { Category } from '../interfaces';

const CATEGORIES_COLLECTION = 'categories';

export const categoryService = {
  async getCategories(userId: string): Promise<Category[]> {
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('createdBy', '==', userId)
    );
    const snapshot = await getDocs(q);
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  },

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), category);
    return { id: docRef.id, ...category };
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  async deleteCategory(id: string): Promise<void> {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
  }
};
