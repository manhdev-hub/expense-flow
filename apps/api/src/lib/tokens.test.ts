import { describe, expect, it } from 'vitest';
import { generateSecureToken, hashToken } from './tokens.js';

describe('Tokens Module', () => {
  it('generates cryptographically random hex tokens', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();

    expect(token1).toHaveLength(64); // 32 bytes hex = 64 chars
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it('hashes tokens deterministically with SHA-256', () => {
    const token = 'sample-secret-token-value';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(token);
  });
});

