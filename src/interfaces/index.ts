// src/interfaces/index.ts

export interface User {
  id: string; // Firebase document ID
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: number;
}

export type ExpenseMode = 'Credit' | 'Direct';

export interface Expense {
  id?: string;
  userId: string;
  description: string;
  amount: number;
  mode: ExpenseMode;
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
