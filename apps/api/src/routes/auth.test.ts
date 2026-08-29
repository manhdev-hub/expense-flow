import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../app.js';
import { signAccessToken } from '../lib/jwt.js';
import { hashPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma.js';
import { generateSecureToken, hashToken } from '../lib/tokens.js';

describe('Authentication Routes: /api/v1/auth', () => {
  const testEmail = 'demo_test_user@example.com';
  const testPassword = 'SecureDemoPassword123!';
  let testPasswordHash: string;

  beforeEach(async () => {
    testPasswordHash = await hashPassword(testPassword);
    vi.restoreAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
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

  describe('GET /api/v1/auth/csrf', () => {
    it('returns raw csrf token and sets Cache-Control: no-store', async () => {
      const rawRefreshToken = generateSecureToken();
      const tokenHash = hashToken(rawRefreshToken);

      vi.spyOn(prisma.refreshSession, 'findUnique').mockResolvedValue({
        id: 'sess-csrf-1',
        userId: 'usr-1',
        refreshTokenHash: tokenHash,
        csrfTokenHash: 'prev-csrf-hash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      } as any);

      const updateSpy = vi
        .spyOn(prisma.refreshSession, 'update')
        .mockResolvedValue({} as any);

      const res = await request(app)
        .get('/api/v1/auth/csrf')
        .set('Cookie', [`refreshToken=${rawRefreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.csrfToken).toBeDefined();
      expect(res.headers['cache-control']).toContain('no-store');

      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sess-csrf-1' },
          data: expect.objectContaining({
            csrfTokenHash: expect.any(String),
          }),
        })
      );
    });

    it('rejects CSRF request without refresh cookie (401 INVALID_REFRESH_TOKEN)', async () => {
      const res = await request(app).get('/api/v1/auth/csrf');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('successfully rotates tokens with valid refresh cookie, X-CSRF-Token, and matching Origin', async () => {
      const rawRefreshToken = generateSecureToken();
      const rawCsrfToken = generateSecureToken();

      const refreshHash = hashToken(rawRefreshToken);
      const csrfHash = hashToken(rawCsrfToken);

      vi.spyOn(prisma.refreshSession, 'findUnique').mockResolvedValue({
        id: 'sess-active-1',
        userId: 'usr-1',
        refreshTokenHash: refreshHash,
        csrfTokenHash: csrfHash,
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        revokedReason: null,
        createdAt: new Date(),
        lastUsedAt: new Date(),
        userAgent: 'test-agent',
        ipAddress: '127.0.0.1',
        user: {
          id: 'usr-1',
          email: testEmail,
          name: 'Demo User',
          role: 'EMPLOYEE',
          managerId: null,
          passwordHash: testPasswordHash,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any);

      const updateSessionSpy = vi
        .spyOn(prisma.refreshSession, 'update')
        .mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Origin', 'http://localhost:3000')
        .set('X-CSRF-Token', rawCsrfToken)
        .set('Cookie', [`refreshToken=${rawRefreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.expiresInSeconds).toBe(900);
      expect(res.body.data.csrfToken).toBeDefined();

      // Check rotated cookie
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      const newCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(newCookie).toBeDefined();
      expect(newCookie).not.toContain(rawRefreshToken); // Rotated to new token

      expect(updateSessionSpy).toHaveBeenCalledTimes(1);
    });

    it('rejects refresh when X-CSRF-Token is missing (403 INVALID_CSRF_TOKEN)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', ['refreshToken=some-token']);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INVALID_CSRF_TOKEN');
    });

    it('rejects refresh when Origin is untrusted (403 INVALID_ORIGIN)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Origin', 'http://malicious-site.com')
        .set('X-CSRF-Token', 'token')
        .set('Cookie', ['refreshToken=token']);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INVALID_ORIGIN');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('revokes current session and clears refresh cookie when CSRF and Origin are valid', async () => {
      const rawRefreshToken = generateSecureToken();
      const rawCsrfToken = generateSecureToken();

      const refreshHash = hashToken(rawRefreshToken);
      const csrfHash = hashToken(rawCsrfToken);

      vi.spyOn(prisma.refreshSession, 'findUnique').mockResolvedValue({
        id: 'sess-logout-1',
        userId: 'usr-1',
        refreshTokenHash: refreshHash,
        csrfTokenHash: csrfHash,
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        revokedReason: null,
        createdAt: new Date(),
        lastUsedAt: new Date(),
        userAgent: null,
        ipAddress: null,
      });

      const updateSessionSpy = vi
        .spyOn(prisma.refreshSession, 'update')
        .mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Origin', 'http://localhost:3000')
        .set('X-CSRF-Token', rawCsrfToken)
        .set('Cookie', [`refreshToken=${rawRefreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Logged out successfully');

      // Cookie should be cleared
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies).toBeDefined();
      const clearCookie = cookies.find((c) => c.startsWith('refreshToken=;'));
      expect(clearCookie).toBeDefined();

      expect(updateSessionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sess-logout-1' },
          data: expect.objectContaining({
            revokedReason: 'USER_LOGOUT',
          }),
        })
      );
    });

    it('rejects logout when CSRF token is invalid (403 INVALID_CSRF_TOKEN)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Origin', 'http://localhost:3000')
        .set('Cookie', ['refreshToken=token']);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INVALID_CSRF_TOKEN');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns current user profile with valid Bearer token', async () => {
      const token = signAccessToken({
        sub: 'usr-me-1',
        role: 'EMPLOYEE',
        name: 'Demo Employee User',
      });

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'usr-me-1',
        email: 'employee@example.com',
        name: 'Demo Employee User',
        role: 'EMPLOYEE',
        managerId: 'usr-mgr-1',
        isActive: true,
      } as any);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user).toEqual({
        id: 'usr-me-1',
        email: 'employee@example.com',
        name: 'Demo Employee User',
        role: 'EMPLOYEE',
        managerId: 'usr-mgr-1',
      });
    });

    it('rejects request without Bearer token (401 UNAUTHORIZED)', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
