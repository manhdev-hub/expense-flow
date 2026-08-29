import { z } from 'zod';

export const roles = ['EMPLOYEE', 'MANAGER'] as const;
export type Role = (typeof roles)[number];

export const expenseStatuses = [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'REJECTED',
] as const;
export type ExpenseStatus = (typeof expenseStatuses)[number];

export const expenseCategories = [
  'TRAVEL',
  'MEAL',
  'OFFICE',
  'TRAINING',
  'OTHER',
] as const;
export type ExpenseCategory = (typeof expenseCategories)[number];

// Auth Schemas & Types
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
}

export interface LoginResponseData {
  accessToken: string;
  expiresInSeconds: number;
  csrfToken: string;
  user: AuthUser;
}

export interface LoginResponse {
  data: LoginResponseData;
}
