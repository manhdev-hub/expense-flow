import { describe, expect, it } from 'vitest';
import {
  hashPassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePassword,
  verifyPassword,
} from './password.js';

describe('Password Module (Argon2id & Policy)', () => {
  it('validates password policy boundaries (12 to 128 chars)', () => {
    // Too short (< 12)
    expect(validatePassword('short').isValid).toBe(false);
    expect(validatePassword('12345678901').isValid).toBe(false);

    // Valid minimum (12)
    expect(validatePassword('123456789012').isValid).toBe(true);

    // Valid standard
    expect(validatePassword('secure-demo-password-123').isValid).toBe(true);

    // Valid maximum (128)
    const maxPass = 'a'.repeat(PASSWORD_MAX_LENGTH);
    expect(validatePassword(maxPass).isValid).toBe(true);

    // Too long (> 128)
    const tooLongPass = 'a'.repeat(PASSWORD_MAX_LENGTH + 1);
    expect(validatePassword(tooLongPass).isValid).toBe(false);
  });

  it('hashes passwords using Argon2id algorithm', async () => {
    const plainPassword = 'secure-demo-password-123';
    const hash = await hashPassword(plainPassword);

    expect(hash).toBeDefined();
    expect(hash).toContain('$argon2id$');
  });

  it('correctly verifies valid and invalid passwords', async () => {
    const plainPassword = 'secure-demo-password-123';
    const wrongPassword = 'wrong-demo-password-456';
    const hash = await hashPassword(plainPassword);

    const isMatch = await verifyPassword(hash, plainPassword);
    expect(isMatch).toBe(true);

    const isMismatch = await verifyPassword(hash, wrongPassword);
    expect(isMismatch).toBe(false);
  });

  it('throws error when attempting to hash password failing policy', async () => {
    await expect(hashPassword('short')).rejects.toThrow(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
    );
  });
});

