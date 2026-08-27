import { describe, expect, it } from 'vitest';
import { expenseCategories, expenseStatuses, roles } from './index.js';

describe('shared domain contracts', () => {
  it('exposes the approved role, status, and category values', () => {
    expect(roles).toEqual(['EMPLOYEE', 'MANAGER']);
    expect(expenseStatuses).toEqual(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']);
    expect(expenseCategories).toEqual(['TRAVEL', 'MEAL', 'OFFICE', 'TRAINING', 'OTHER']);
  });
});
