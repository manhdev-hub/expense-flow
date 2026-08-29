import { describe, expect, it, vi } from 'vitest';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { generateSecureToken, hashToken } from '../lib/tokens.js';
import { requireCsrf, validateOrigin } from './security.js';

describe('Security Middleware', () => {
  describe('validateOrigin', () => {
    it('allows requests with matching CLIENT_ORIGIN', () => {
      const req: any = { headers: { origin: env.CLIENT_ORIGIN } };
      const res: any = {};
      const next = vi.fn();

      validateOrigin(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('allows requests without origin header', () => {
      const req: any = { headers: {} };
      const res: any = {};
      const next = vi.fn();

      validateOrigin(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('throws ForbiddenError when origin does not match CLIENT_ORIGIN', () => {
      const req: any = { headers: { origin: 'http://malicious-attacker.com' } };
      const res: any = {};
      const next = vi.fn();

      expect(() => validateOrigin(req, res, next)).toThrowError(
        expect.objectContaining({
          code: 'INVALID_ORIGIN',
          statusCode: 403,
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireCsrf', () => {
    it('allows request when valid CSRF token and refresh cookie are provided', async () => {
      const rawRefreshToken = generateSecureToken();
      const rawCsrfToken = generateSecureToken();

      const refreshHash = hashToken(rawRefreshToken);
      const csrfHash = hashToken(rawCsrfToken);

      vi.spyOn(prisma.refreshSession, 'findUnique').mockResolvedValue({
        id: 'sess-1',
        userId: 'usr-1',
        refreshTokenHash: refreshHash,
        csrfTokenHash: csrfHash,
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      } as any);

      const req: any = {
        headers: { 'x-csrf-token': rawCsrfToken },
        cookies: { refreshToken: rawRefreshToken },
      };
      const res: any = {};
      const next = vi.fn();

      await requireCsrf(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('throws ForbiddenError when X-CSRF-Token is missing', async () => {
      const req: any = {
        headers: {},
        cookies: { refreshToken: 'token' },
      };
      const res: any = {};
      const next = vi.fn();

      await expect(requireCsrf(req, res, next)).rejects.toThrowError(
        expect.objectContaining({
          code: 'INVALID_CSRF_TOKEN',
          statusCode: 403,
        })
      );
    });

    it('throws ForbiddenError when X-CSRF-Token does not match session hash', async () => {
      const rawRefreshToken = generateSecureToken();
      const refreshHash = hashToken(rawRefreshToken);

      vi.spyOn(prisma.refreshSession, 'findUnique').mockResolvedValue({
        id: 'sess-1',
        userId: 'usr-1',
        refreshTokenHash: refreshHash,
        csrfTokenHash: 'stored-csrf-hash',
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
      } as any);

      const req: any = {
        headers: { 'x-csrf-token': 'wrong-csrf-token' },
        cookies: { refreshToken: rawRefreshToken },
      };
      const res: any = {};
      const next = vi.fn();

      await expect(requireCsrf(req, res, next)).rejects.toThrowError(
        expect.objectContaining({
          code: 'INVALID_CSRF_TOKEN',
          statusCode: 403,
        })
      );
    });
  });
});

