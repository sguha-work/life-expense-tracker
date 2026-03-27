import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import { Expense, PaymentMode, DEFAULT_PAYMENT_MODES } from '../interfaces';
import { cacheService } from './cacheService';
import { paymentModeService } from './paymentModeService';

const EXPENSES_COLLECTION = 'expenses';

const CACHE_TODAY = (userId: string) => `expenses_today_${userId}`;
/** Local calendar day id so cache is ignored after midnight. */
const CACHE_TODAY_DAY = (userId: string) => `expenses_today_day_${userId}`;
const CACHE_YESTERDAY_TOTALS = (userId: string) => `yesterday_totals_${userId}`;

function currentLocalDayKey(): string {
  const n = new Date();
  return `${n.getFullYear()}-${n.getMonth()}-${n.getDate()}`;
}

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

/** Calendar bounds for a single local day. */
function dayBounds(year: number, month: number, date: number): { start: number; end: number } {
  const start = new Date(year, month, date).getTime();
  const end = new Date(year, month, date, 23, 59, 59, 999).getTime();
  return { start, end };
}

/**
 * Resolves a [start, end] createdAt window. Defaults to today when year is omitted.
 * Month is 0–11 (Date.getMonth()).
 */
function resolveTimeRange(
  date?: number,
  month?: number,
  year?: number
): { start: number; end: number } {
  const now = new Date();
  if (year === undefined) {
    return dayBounds(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (month === undefined) {
    const start = new Date(year, 0, 1).getTime();
    const end = new Date(year, 11, 31, 23, 59, 59, 999).getTime();
    return { start, end };
  }
  if (date === undefined) {
    const start = new Date(year, month, 1).getTime();
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
    return { start, end };
  }
  return dayBounds(year, month, date);
}

function rangesIntersect(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart <= bEnd && aEnd >= bStart;
}

async function fetchExpensesInRange(
  userId: string,
  startMs: number,
  endMs: number
): Promise<Expense[]> {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId),
    where('createdAt', '>=', startMs),
    where('createdAt', '<=', endMs),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Expense));
}

/** Cache holds only today's expense list; yesterday stores aggregate totals only. */
function setTodayCache(userId: string, todayExpenses: Expense[]): void {
  cacheService.set(CACHE_TODAY(userId), todayExpenses);
  cacheService.set(CACHE_TODAY_DAY(userId), currentLocalDayKey());
}

function getCachedTodayExpensesIfValid(userId: string): Expense[] | null {
  const day = cacheService.get<string>(CACHE_TODAY_DAY(userId));
  if (day !== currentLocalDayKey()) return null;
  const list = cacheService.get<Expense[]>(CACHE_TODAY(userId));
  return list ?? null;
}

async function setYesterdayTotalsFromExpenses(userId: string, yesterdayExpenses: Expense[]): Promise<void> {
  const paymentModes = await paymentModeService.getPaymentModes(userId);
  const creditTotal = yesterdayExpenses
    .filter(e => isCreditExpense(e.mode, paymentModes))
    .reduce((sum, e) => sum + e.amount, 0);
  const total = yesterdayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const otherTotal = total - creditTotal;
  cacheService.set(CACHE_YESTERDAY_TOTALS(userId), { total, creditTotal, otherTotal });
}

async function updateCachesAfterRangeFetch(
  userId: string,
  expenses: Expense[],
  rangeStart: number,
  rangeEnd: number
): Promise<void> {
  const now = new Date();
  const today = dayBounds(now.getFullYear(), now.getMonth(), now.getDate());
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterday = dayBounds(y.getFullYear(), y.getMonth(), y.getDate());

  if (rangesIntersect(rangeStart, rangeEnd, today.start, today.end)) {
    const todayEx = expenses.filter(e => e.createdAt >= today.start && e.createdAt <= today.end);
    setTodayCache(userId, todayEx);
  }

  if (rangesIntersect(rangeStart, rangeEnd, yesterday.start, yesterday.end)) {
    const yEx = expenses.filter(e => e.createdAt >= yesterday.start && e.createdAt <= yesterday.end);
    await setYesterdayTotalsFromExpenses(userId, yEx);
  } else {
    const yEx = await fetchExpensesInRange(userId, yesterday.start, yesterday.end);
    await setYesterdayTotalsFromExpenses(userId, yEx);
  }
}

async function refreshRecentDayCaches(userId: string): Promise<void> {
  const now = new Date();
  const today = dayBounds(now.getFullYear(), now.getMonth(), now.getDate());
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterday = dayBounds(y.getFullYear(), y.getMonth(), y.getDate());

  const [todayEx, yEx] = await Promise.all([
    fetchExpensesInRange(userId, today.start, today.end),
    fetchExpensesInRange(userId, yesterday.start, yesterday.end)
  ]);
  setTodayCache(userId, todayEx);
  await setYesterdayTotalsFromExpenses(userId, yEx);
}

async function loadTodayFromCacheOrFirebase(userId: string): Promise<Expense[]> {
  const cached = getCachedTodayExpensesIfValid(userId);
  if (cached !== null) return cached;
  return loadExpensesFromFirebaseAndCacheRecent(userId);
}

async function loadExpensesFromFirebaseAndCacheRecent(
  userId: string,
  date?: number,
  month?: number,
  year?: number
): Promise<Expense[]> {
  const { start, end } = resolveTimeRange(date, month, year);
  const expenses = await fetchExpensesInRange(userId, start, end);
  await updateCachesAfterRangeFetch(userId, expenses, start, end);
  return expenses;
}

export const expenseService = {
  /**
   * Loads expenses from Firebase for the resolved date range (day, month, or year).
   * If year is omitted, loads today only. Updates today's list cache and yesterday totals when needed.
   */
  getExpenses: loadExpensesFromFirebaseAndCacheRecent,

  getExpensesFromFirebase: loadExpensesFromFirebaseAndCacheRecent,

  /**
   * Today's expenses: returns cached list when it matches the current local day (no Firebase read).
   * Otherwise loads today from Firebase and refreshes caches.
   */
  getTodayExpensesPreferCache: loadTodayFromCacheOrFirebase,

  getCachedYesterdayTotals(userId: string): YesterdayTotalsCache | null {
    return cacheService.get<YesterdayTotalsCache>(CACHE_YESTERDAY_TOTALS(userId));
  },

  async getExpenseById(id: string): Promise<Expense | null> {
    const snap = await getDoc(doc(db, EXPENSES_COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Expense;
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
