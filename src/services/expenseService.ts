import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import { Expense } from '../interfaces';

const EXPENSES_COLLECTION = 'expenses';

export const expenseService = {
  async getExpenses(userId: string, startDate?: number, endDate?: number): Promise<Expense[]> {
    let q = query(
      collection(db, EXPENSES_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    let expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    
    // Sort descending by createdAt
    expenses.sort((a, b) => b.createdAt - a.createdAt);
    
    if (startDate) {
      expenses = expenses.filter(e => e.createdAt >= startDate);
    }
    if (endDate) {
      expenses = expenses.filter(e => e.createdAt <= endDate);
    }
    
    return expenses;
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), expense);
    return { id: docRef.id, ...expense };
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await updateDoc(docRef, { ...updates, modifiedAt: Date.now() });
  },

  async deleteExpense(id: string): Promise<void> {
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await deleteDoc(docRef);
  }
};
