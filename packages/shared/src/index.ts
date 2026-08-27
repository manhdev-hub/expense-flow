export const roles = ['EMPLOYEE', 'MANAGER'] as const;
export type Role = (typeof roles)[number];

export const expenseStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'] as const;
export type ExpenseStatus = (typeof expenseStatuses)[number];

export const expenseCategories = ['TRAVEL', 'MEAL', 'OFFICE', 'TRAINING', 'OTHER'] as const;
export type ExpenseCategory = (typeof expenseCategories)[number];
