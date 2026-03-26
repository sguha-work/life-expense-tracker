import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import { Expense, PaymentMode, DEFAULT_PAYMENT_MODES } from '../interfaces';
import { cacheService } from './cacheService';
import { paymentModeService } from './paymentModeService';

const EXPENSES_COLLECTION = 'expenses';

const CACHE_TODAY = (userId: string) => `expenses_today_${userId}`;
const CACHE_YESTERDAY_TOTALS = (userId: string) => `yesterday_totals_${userId}`;

export type YesterdayTotalsCache = {
  total: number;
  creditTotal: number;
  otherTotal: number;
};

function isCreditExpense(modeName: string, paymentModes: PaymentMode[]): boolean {
  const m =
    paymentModes.find(pm => pm.name === modeName) ||
    DEFAULT_PAYMENT_MODES.find(pm => pm.name === modeName);
  return m?.isCredit ?? false;
}

async function fetchAllExpensesFromFirebase(userId: string): Promise<Expense[]> {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  expenses.sort((a, b) => b.createdAt - a.createdAt);
  return expenses;
}

function filterExpenses(
  expenses: Expense[],
  date?: number,
  month?: number,
  year?: number
): Expense[] {
  let filteredExpenses = [...expenses];

  if (year !== undefined) {
    if (month !== undefined) {
      if (date !== undefined) {
        const start = new Date(year, month, date).getTime();
        const end = new Date(year, month, date, 23, 59, 59, 999).getTime();
        filteredExpenses = filteredExpenses.filter(e => e.createdAt >= start && e.createdAt <= end);
      } else {
        const start = new Date(year, month, 1).getTime();
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
        filteredExpenses = filteredExpenses.filter(e => e.createdAt >= start && e.createdAt <= end);
      }
    } else {
      const start = new Date(year, 0, 1).getTime();
      const end = new Date(year, 11, 31, 23, 59, 59, 999).getTime();
      filteredExpenses = filteredExpenses.filter(e => e.createdAt >= start && e.createdAt <= end);
    }
  }

  return filteredExpenses;
}

/** Cache today's expense list; cache only yesterday's aggregate totals (not individual expenses). */
async function applyRecentDayCaches(userId: string, expenses: Expense[]): Promise<void> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterdayStart = new Date(y.getFullYear(), y.getMonth(), y.getDate()).getTime();
  const yesterdayEnd = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999).getTime();

  const todayEx = expenses.filter(e => e.createdAt >= todayStart && e.createdAt <= todayEnd);
  cacheService.set(CACHE_TODAY(userId), todayEx);

  const yesterdayEx = expenses.filter(
    e => e.createdAt >= yesterdayStart && e.createdAt <= yesterdayEnd
  );
  const paymentModes = await paymentModeService.getPaymentModes(userId);
  const creditTotal = yesterdayEx
    .filter(e => isCreditExpense(e.mode, paymentModes))
    .reduce((sum, e) => sum + e.amount, 0);
  const total = yesterdayEx.reduce((sum, e) => sum + e.amount, 0);
  const otherTotal = total - creditTotal;

  cacheService.set(CACHE_YESTERDAY_TOTALS(userId), { total, creditTotal, otherTotal });
}

async function refreshRecentDayCaches(userId: string): Promise<void> {
  const expenses = await fetchAllExpensesFromFirebase(userId);
  await applyRecentDayCaches(userId, expenses);
}

async function loadExpensesFromFirebaseAndCacheRecent(
  userId: string,
  date?: number,
  month?: number,
  year?: number
): Promise<Expense[]> {
  console.log('Fetching expenses from Firebase...');
  const expenses = await fetchAllExpensesFromFirebase(userId);
  await applyRecentDayCaches(userId, expenses);
  return filterExpenses(expenses, date, month, year);
}

export const expenseService = {
  /**
   * Loads expenses from Firebase (never from a full-list cache).
   * Updates today's list cache and yesterday's aggregate totals only.
   */
  getExpenses: loadExpensesFromFirebaseAndCacheRecent,

  /** Same behavior as getExpenses — always Firebase. Prefer on history pages. */
  getExpensesFromFirebase: loadExpensesFromFirebaseAndCacheRecent,

  getCachedYesterdayTotals(userId: string): YesterdayTotalsCache | null {
    return cacheService.get<YesterdayTotalsCache>(CACHE_YESTERDAY_TOTALS(userId));
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), expense);
    await refreshRecentDayCaches(expense.userId);
    return { id: docRef.id, ...expense };
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<void> {
    const snap = await getDoc(doc(db, EXPENSES_COLLECTION, id));
    const userId = snap.data()?.userId as string | undefined;
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await updateDoc(docRef, { ...updates, modifiedAt: Date.now() });
    if (userId) await refreshRecentDayCaches(userId);
  },

  async deleteExpense(id: string): Promise<void> {
    const snap = await getDoc(doc(db, EXPENSES_COLLECTION, id));
    const userId = snap.data()?.userId as string | undefined;
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    await deleteDoc(docRef);
    if (userId) await refreshRecentDayCaches(userId);
  }
};
