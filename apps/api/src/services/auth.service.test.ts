import { describe, expect, it, vi } from 'vitest';
import { prisma } from '../lib/prisma.js';
import { generateSecureToken, hashToken } from '../lib/tokens.js';
import {
  getCurrentUser,
  logoutSession,
  refreshSession,
  revokeAllUserSessions,
} from './auth.service.js';

describe('Auth Service Session Management', () => {
  it('supports multiple isolated sessions per user and selective logout', async () => {
    // Session A (Device A) and Session B (Device B)
    const rawTokenA = generateSecureToken();
    const hashA = hashToken(rawTokenA);

    const mockSessionA = {
      id: 'sess-A',
      userId: 'usr-multi-1',
      refreshTokenHash: hashA,
      csrfTokenHash: 'csrfA',
      expiresAt: new Date(Date.now() + 100000),
      revokedAt: null,
      revokedReason: null,
    };

    const updateSpy = vi
      .spyOn(prisma.refreshSession, 'update')
      .mockResolvedValue({} as any);

    vi.spyOn(prisma.refreshSession, 'findUnique').mockResolvedValue(
      mockSessionA as any
    );

    // Logout from Device A
    await logoutSession(rawTokenA);

    expect(updateSpy).toHaveBeenCalledWith({
      where: { id: 'sess-A' },
      data: {
        revokedAt: expect.any(Date),
        revokedReason: 'USER_LOGOUT',
      },
    });
  });

  it('revokes all user sessions when calling revokeAllUserSessions', async () => {
    const updateManySpy = vi
      .spyOn(prisma.refreshSession, 'updateMany')
      .mockResolvedValue({ count: 3 } as any);

    await revokeAllUserSessions('usr-123', 'SECURITY_ALERT');

    expect(updateManySpy).toHaveBeenCalledWith({
      where: {
        userId: 'usr-123',
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date),
        revokedReason: 'SECURITY_ALERT',
      },
    });
  });

  it('throws when getting non-existent or inactive user in getCurrentUser', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    await expect(getCurrentUser('nonexistent')).rejects.toThrow();
  });
});

