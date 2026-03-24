import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import { Expense } from '../interfaces';

const EXPENSES_COLLECTION = 'expenses';

export const expenseService = {
  async getExpenses(userId: string, date?: number, month?: number, year?: number): Promise<Expense[]> {
    let q = query(
      collection(db, EXPENSES_COLLECTION),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    let expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    
    // Sort descending by createdAt
    expenses.sort((a, b) => b.createdAt - a.createdAt);
    
    if (year !== undefined) {
      if (month !== undefined) {
        if (date !== undefined) {
          // Specific date
          const start = new Date(year, month, date).getTime();
          const end = new Date(year, month, date, 23, 59, 59, 999).getTime();
          expenses = expenses.filter(e => e.createdAt >= start && e.createdAt <= end);
        } else {
          // Specific month
          const start = new Date(year, month, 1).getTime();
          const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
          expenses = expenses.filter(e => e.createdAt >= start && e.createdAt <= end);
        }
      } else {
        // Specific year
        const start = new Date(year, 0, 1).getTime();
        const end = new Date(year, 11, 31, 23, 59, 59, 999).getTime();
        expenses = expenses.filter(e => e.createdAt >= start && e.createdAt <= end);
      }
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
