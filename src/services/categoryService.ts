import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import { Category } from '../interfaces';
import { cacheService } from './cacheService';

const CATEGORIES_COLLECTION = 'categories';
const CACHE_KEY = (userId: string) => `categories_${userId}`;

export const categoryService = {
  async getCategories(userId: string): Promise<Category[]> {
    let categories = cacheService.get<Category[]>(CACHE_KEY(userId));

    if (!categories) {
      console.log('Fetching categories from Firebase...');
      const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where('createdBy', '==', userId)
      );
      const snapshot = await getDocs(q);
      categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      categories.sort((a, b) => a.name.localeCompare(b.name));
      cacheService.set(CACHE_KEY(userId), categories);
    } else {
      console.log('Reading categories from cache...');
    }

    return categories;
  },

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), category);
    cacheService.remove(CACHE_KEY(category.createdBy));
    return { id: docRef.id, ...category };
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await updateDoc(docRef, updates);
    Object.keys(localStorage).forEach(key => {
      if (key.includes('categories_')) localStorage.removeItem(key);
    });
  },

  async deleteCategory(id: string): Promise<void> {
    const docRef = doc(db, CATEGORIES_COLLECTION, id);
    await deleteDoc(docRef);
    Object.keys(localStorage).forEach(key => {
      if (key.includes('categories_')) localStorage.removeItem(key);
    });
  }
};
