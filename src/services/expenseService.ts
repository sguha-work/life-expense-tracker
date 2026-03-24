import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import { Expense } from '../interfaces';
import { cacheService } from './cacheService';

const EXPENSES_COLLECTION = 'expenses';
const CACHE_KEY = (userId: string) => `expenses_${userId}`;

export const expenseService = {
  async getExpenses(userId: string, date?: number, month?: number, year?: number): Promise<Expense[]> {
    let expenses = cacheService.get<Expense[]>(CACHE_KEY(userId));

    if (!expenses) {
      console.log('Fetching expenses from Firebase...');
      const q = query(
        collection(db, EXPENSES_COLLECTION),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      
      // Sort descending by createdAt
      expenses.sort((a, b) => b.createdAt - a.createdAt);
      
      // Cache the full list
      cacheService.set(CACHE_KEY(userId), expenses);
    } else {
      console.log('Reading expenses from cache...');
    }
    
    // Apply filtering locally on the cached/fetched data
    let filteredExpenses = [...expenses];
    
    if (year !== undefined) {
      if (month !== undefined) {
        if (date !== undefined) {
          // Specific date
          const start = new Date(year, month, date).getTime();
          const end = new Date(year, month, date, 23, 59, 59, 999).getTime();
          filteredExpenses = filteredExpenses.filter(e => e.createdAt >= start && e.createdAt <= end);
        } else {
          // Specific month
          const start = new Date(year, month, 1).getTime();
          const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
          filteredExpenses = filteredExpenses.filter(e => e.createdAt >= start && e.createdAt <= end);
        }
      } else {
        // Specific year
        const start = new Date(year, 0, 1).getTime();
        const end = new Date(year, 11, 31, 23, 59, 59, 999).getTime();
        filteredExpenses = filteredExpenses.filter(e => e.createdAt >= start && e.createdAt <= end);
      }
    }
    
    return filteredExpenses;
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), expense);
    cacheService.remove(CACHE_KEY(expense.userId));
    return { id: docRef.id, ...expense };
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await updateDoc(docRef, { ...updates, modifiedAt: Date.now() });
    // We don't have direct access to userId here, so we might need to clear all expense caches or pass userId.
    // For simplicity, let's clear all cache if starts with 'expenses_'
    Object.keys(localStorage).forEach(key => {
      if (key.includes('expenses_')) localStorage.removeItem(key);
    });
  },

  async deleteExpense(id: string): Promise<void> {
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await deleteDoc(docRef);
    Object.keys(localStorage).forEach(key => {
      if (key.includes('expenses_')) localStorage.removeItem(key);
    });
  }
};
