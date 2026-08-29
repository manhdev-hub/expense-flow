import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from './jwt.js';

describe('JWT Module', () => {
  it('signs and verifies valid access tokens with 15 minutes TTL', () => {
    const payload = {
      sub: 'user-123',
      role: 'EMPLOYEE' as const,
      name: 'Demo Employee',
    };

    const token = signAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.name).toBe(payload.name);
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();

    // Check expiration delta (around 900 seconds)
    const delta = decoded.exp! - decoded.iat!;
    expect(delta).toBe(900);
  });

  it('rejects invalid or tampered access tokens', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });
});

