import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import { PaymentMode } from '../interfaces';
import { cacheService } from './cacheService';

const PAYMENT_MODES_COLLECTION = 'payment_modes';
const CACHE_KEY = (userId: string) => `payment_modes_${userId}`;

export const paymentModeService = {
  async getPaymentModes(userId: string): Promise<PaymentMode[]> {
    let modes = cacheService.get<PaymentMode[]>(CACHE_KEY(userId));

    if (!modes) {
      console.log('Fetching payment modes from Firebase...');
      const q = query(
        collection(db, PAYMENT_MODES_COLLECTION),
        where('createdBy', '==', userId)
      );
      const snapshot = await getDocs(q);
      modes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentMode));
      modes.sort((a, b) => a.name.localeCompare(b.name));
      cacheService.set(CACHE_KEY(userId), modes);
    } else {
      console.log('Reading payment modes from cache...');
    }

    return modes;
  },

  async addPaymentMode(mode: Omit<PaymentMode, 'id'>): Promise<PaymentMode> {
    const docRef = await addDoc(collection(db, PAYMENT_MODES_COLLECTION), mode);
    cacheService.remove(CACHE_KEY(mode.createdBy));
    return { id: docRef.id, ...mode };
  },

  async updatePaymentMode(id: string, updates: Partial<PaymentMode>): Promise<void> {
    const docRef = doc(db, PAYMENT_MODES_COLLECTION, id);
    await updateDoc(docRef, updates);
    Object.keys(localStorage).forEach(key => {
      if (key.includes('payment_modes_')) localStorage.removeItem(key);
    });
  },

  async deletePaymentMode(id: string): Promise<void> {
    const docRef = doc(db, PAYMENT_MODES_COLLECTION, id);
    await deleteDoc(docRef);
    Object.keys(localStorage).forEach(key => {
      if (key.includes('payment_modes_')) localStorage.removeItem(key);
    });
  }
};
