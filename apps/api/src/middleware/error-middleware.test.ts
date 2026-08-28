import express, { type Express } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
} from '../errors/app-error.js';
import { errorHandler } from './error-handler.js';
import { notFoundHandler } from './not-found.js';
import { requestIdMiddleware } from './request-id.js';
import { validateRequest } from './validate.js';

function createTestApp(): Express {
  const testApp = express();
  testApp.use(requestIdMiddleware);
  testApp.use(express.json({ limit: '1mb' }));

  // Test routes
  testApp.get('/test/request-id', (req, res) => {
    res.status(200).json({ requestId: req.id });
  });

  testApp.post(
    '/test/validation',
    validateRequest({
      body: z.object({
        title: z.string().min(1, 'Title is required').max(120, 'Title too long'),
        amount: z.number().int().positive('Amount must be positive'),
      }),
    }),
    (req, res) => {
      res.status(200).json({ success: true, data: req.body });
    }
  );

  testApp.get('/test/bad-request', () => {
    throw new BadRequestError('Invalid syntax format');
  });

  testApp.get('/test/unauthorized', () => {
    throw new UnauthorizedError('Authentication required');
  });

  testApp.get('/test/forbidden', () => {
    throw new ForbiddenError('Permission denied');
  });

  testApp.get('/test/conflict', () => {
    throw new ConflictError(
      'Manager required to submit',
      'EMPLOYEE_MANAGER_REQUIRED'
    );
  });

  testApp.get('/test/unhandled-500', () => {
    throw new Error('Secret DB connection error with password secret_pass_123');
  });

  // 404 & Error handlers
  testApp.use(notFoundHandler);
  testApp.use(errorHandler);

  return testApp;
}

describe('Error & Request ID middlewares integration', () => {
  const app = createTestApp();

  describe('Request ID middleware', () => {
    it('generates a new UUID when no X-Request-Id header is provided', async () => {
      const res = await request(app).get('/test/request-id');
      expect(res.status).toBe(200);
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.body.requestId).toBe(res.headers['x-request-id']);
      expect(res.body.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('propagates custom X-Request-Id when provided in request headers', async () => {
      const customId = 'custom-request-id-12345';
      const res = await request(app)
        .get('/test/request-id')
        .set('X-Request-Id', customId);

      expect(res.status).toBe(200);
      expect(res.headers['x-request-id']).toBe(customId);
      expect(res.body.requestId).toBe(customId);
    });
  });

  describe('404 Not Found handler', () => {
    it('returns standard 404 error envelope on unmatched route', async () => {
      const res = await request(app).get('/non-existent-route');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: expect.stringContaining('Route not found: GET /non-existent-route'),
          requestId: expect.any(String),
        },
      });
      expect(res.body.error.requestId).toBe(res.headers['x-request-id']);
    });
  });

  describe('Zod Validation middleware (HTTP 422)', () => {
    it('passes valid request body and returns 200', async () => {
      const validPayload = { title: 'Office supplies', amount: 150000 };
      const res = await request(app).post('/test/validation').send(validPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(validPayload);
    });

    it('returns HTTP 422 with field errors details on invalid body', async () => {
      const invalidPayload = { title: '', amount: -500 };
      const res = await request(app).post('/test/validation').send(invalidPayload);

      expect(res.status).toBe(422);
      expect(res.body).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: {
            fields: {
              title: ['Title is required'],
              amount: ['Amount must be positive'],
            },
          },
          requestId: expect.any(String),
        },
      });
    });
  });

  describe('AppError status mapping and envelope format', () => {
    it('handles BadRequestError with HTTP 400', async () => {
      const res = await request(app).get('/test/bad-request');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toBe('Invalid syntax format');
      expect(res.body.error.requestId).toBeDefined();
    });

    it('handles UnauthorizedError with HTTP 401', async () => {
      const res = await request(app).get('/test/unauthorized');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Authentication required');
    });

    it('handles ForbiddenError with HTTP 403', async () => {
      const res = await request(app).get('/test/forbidden');
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toBe('Permission denied');
    });

    it('handles ConflictError with custom code and HTTP 409', async () => {
      const res = await request(app).get('/test/conflict');
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMPLOYEE_MANAGER_REQUIRED');
      expect(res.body.error.message).toBe('Manager required to submit');
    });
  });

  describe('Malformed JSON parsing (HTTP 400)', () => {
    it('catches SyntaxError from express.json and returns HTTP 400 MALFORMED_JSON', async () => {
      const res = await request(app)
        .post('/test/validation')
        .set('Content-Type', 'application/json')
        .send('{"title": "invalid-json');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('MALFORMED_JSON');
      expect(res.body.error.message).toBe('Malformed JSON in request body');
      expect(res.body.error.requestId).toBeDefined();
    });
  });

  describe('Unhandled 500 error & security masking', () => {
    it('returns HTTP 500 without leaking stack trace or secret messages in response body', async () => {
      const res = await request(app).get('/test/unhandled-500');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected internal server error occurred',
          requestId: expect.any(String),
        },
      });

      // Crucial security verification: no stack trace, no leaked password/secret in response
      expect(res.body.error.stack).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('secret_pass_123');
      expect(JSON.stringify(res.body)).not.toContain('Database connection error');
    });
  });
});
