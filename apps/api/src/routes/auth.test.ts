import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../app.js';
import { hashPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma.js';

describe('Authentication Route: POST /api/v1/auth/login', () => {
  const testEmail = 'demo_test_user@example.com';
  const testPassword = 'SecureDemoPassword123!';
  let testPasswordHash: string;

  beforeEach(async () => {
    testPasswordHash = await hashPassword(testPassword);
    vi.restoreAllMocks();
  });

  it('successfully logs in with valid credentials, returns tokens and sets HttpOnly cookie', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'usr-demo-1',
      email: testEmail,
      name: 'Demo Employee User',
      role: 'EMPLOYEE',
      managerId: null,
      passwordHash: testPasswordHash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createSessionSpy = vi
      .spyOn(prisma.refreshSession, 'create')
      .mockResolvedValue({
        id: 'sess-1',
        userId: 'usr-demo-1',
        refreshTokenHash: 'hash',
        csrfTokenHash: 'hash',
        expiresAt: new Date(),
        createdAt: new Date(),
        lastUsedAt: new Date(),
        revokedAt: null,
        revokedReason: null,
        userAgent: null,
        ipAddress: null,
      });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .set('Origin', 'http://localhost:3000');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();

    // Response structure
    const data = res.body.data;
    expect(typeof data.accessToken).toBe('string');
    expect(data.expiresInSeconds).toBe(900);
    expect(typeof data.csrfToken).toBe('string');
    expect(data.user).toEqual({
      id: 'usr-demo-1',
      role: 'EMPLOYEE',
      name: 'Demo Employee User',
    });

    // Refresh token MUST NOT be in response body
    expect(data.refreshToken).toBeUndefined();

    // Check HttpOnly cookie
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie).toContain('Path=/api/v1/auth');

    // Confirm session created in database
    expect(createSessionSpy).toHaveBeenCalledTimes(1);
  });

  it('rejects login with wrong password (401 INVALID_CREDENTIALS)', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'usr-demo-1',
      email: testEmail,
      name: 'Demo Employee User',
      role: 'EMPLOYEE',
      managerId: null,
      passwordHash: testPasswordHash,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testEmail,
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects login for nonexistent user (401 INVALID_CREDENTIALS)', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'Password123456!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects login for deactivated user (401 ACCOUNT_INACTIVE)', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'usr-inactive',
      email: 'inactive@example.com',
      name: 'Inactive User',
      role: 'EMPLOYEE',
      managerId: null,
      passwordHash: testPasswordHash,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'inactive@example.com',
      password: testPassword,
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('ACCOUNT_INACTIVE');
  });

  it('validates request payload (422 VALIDATION_ERROR for invalid email)', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'not-an-email',
      password: 'SomePassword123!',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();
  });
});

