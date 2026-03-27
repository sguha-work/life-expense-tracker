// src/interfaces/index.ts

export interface User {
  id: string; // Firebase document ID
  name: string;
  phone: string;
  /** Lowercase; optional for accounts created before email was added */
  email?: string;
  passwordHash: string;
  createdAt: number;
  passwordResetOtp?: string;
  passwordResetOtpExpiresAt?: number;
}

export const DEFAULT_PAYMENT_MODES = [
  { id: 'Cash', name: 'Cash', isCredit: false },
  { id: 'Credit card', name: 'Credit card', isCredit: true },
  { id: 'Debit card', name: 'Debit card', isCredit: false },
  { id: 'UPI', name: 'UPI', isCredit: false },
  { id: 'UPI Credit', name: 'UPI credit', isCredit: true }
];

export interface PaymentMode {
  id?: string;
  createdBy: string;
  name: string;
  isCredit: boolean;
  createdOn: number;
  modifiedBy?: string;
  modifiedOn?: number;
}

export interface Expense {
  id?: string;
  userId: string;
  description: string;
  amount: number;
  mode: string;
  categoryId: string;
  createdAt: number;
  modifiedAt?: number;
}

export interface Category {
  id?: string;
  createdBy: string;
  name: string;
  color?: string;
  createdOn: number;
  modifiedBy?: string;
  modifiedOn?: number;
  budgetMode?: 'd' | 'm' | 'y';
  budgetAmount?: number;
}

export interface AuthSession {
  userId: string;
  expiresAt: number;
}
