import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../adaptors/firebase';
import { PaymentMode } from '../interfaces';

const PAYMENT_MODES_COLLECTION = 'payment_modes';

export const paymentModeService = {
  async getPaymentModes(userId: string): Promise<PaymentMode[]> {
    const q = query(
      collection(db, PAYMENT_MODES_COLLECTION),
      where('createdBy', '==', userId)
    );
    const snapshot = await getDocs(q);
    const modes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentMode));
    return modes.sort((a, b) => a.name.localeCompare(b.name));
  },

  async addPaymentMode(mode: Omit<PaymentMode, 'id'>): Promise<PaymentMode> {
    const docRef = await addDoc(collection(db, PAYMENT_MODES_COLLECTION), mode);
    return { id: docRef.id, ...mode };
  },

  async updatePaymentMode(id: string, updates: Partial<PaymentMode>): Promise<void> {
    const docRef = doc(db, PAYMENT_MODES_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  async deletePaymentMode(id: string): Promise<void> {
    const docRef = doc(db, PAYMENT_MODES_COLLECTION, id);
    await deleteDoc(docRef);
  }
};
