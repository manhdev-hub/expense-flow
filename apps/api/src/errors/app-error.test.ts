import { describe, expect, it } from 'vitest';
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './app-error.js';

describe('AppError classes', () => {
  it('instantiates base AppError with correct properties', () => {
    const error = new AppError(418, 'I_AM_A_TEAPOT', 'Short and stout', { custom: true });
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('I_AM_A_TEAPOT');
    expect(error.message).toBe('Short and stout');
    expect(error.details).toEqual({ custom: true });
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
  });

  it('instantiates BadRequestError with status 400', () => {
    const error = new BadRequestError('Invalid input syntax');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
    expect(error.message).toBe('Invalid input syntax');
  });

  it('instantiates UnauthorizedError with status 401', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Unauthorized');
  });

  it('instantiates ForbiddenError with status 403', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.message).toBe('Forbidden');
  });

  it('instantiates NotFoundError with status 404', () => {
    const error = new NotFoundError('Expense not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Expense not found');
  });

  it('instantiates ConflictError with status 409 and custom code support', () => {
    const error = new ConflictError(
      'Manager is required to submit an expense',
      'EMPLOYEE_MANAGER_REQUIRED'
    );
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('EMPLOYEE_MANAGER_REQUIRED');
    expect(error.message).toBe('Manager is required to submit an expense');
  });

  it('instantiates ValidationError with status 422 and field details', () => {
    const error = new ValidationError('Request validation failed', {
      fields: {
        title: ['Title is required'],
        amount: ['Amount must be a positive integer'],
      },
    });
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details?.fields?.title).toEqual(['Title is required']);
    expect(error.details?.fields?.amount).toEqual([
      'Amount must be a positive integer',
    ]);
  });

  it('instantiates InternalServerError with status 500', () => {
    const error = new InternalServerError();
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.message).toBe('Internal server error');
  });
});

