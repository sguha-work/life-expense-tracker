// src/interfaces/index.ts

export interface User {
  id: string; // Firebase document ID
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: number;
}

export const DEFAULT_PAYMENT_MODES = [
  { id: 'Cash', name: 'Cash' },
  { id: 'Credit', name: 'Credit' },
  { id: 'UPI', name: 'UPI' },
  { id: 'UPI Credit', name: 'UPI Credit' }
];

export interface PaymentMode {
  id?: string;
  createdBy: string;
  name: string;
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
}

export interface AuthSession {
  userId: string;
  expiresAt: number;
}
