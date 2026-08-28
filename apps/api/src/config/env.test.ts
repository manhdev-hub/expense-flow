import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.js';

describe('validateEnv', () => {
  it('returns default configuration when no env vars provided', () => {
    const config = validateEnv({});
    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(4000);
    expect(config.CLIENT_ORIGIN).toBe('http://localhost:3000');
    expect(config.LOG_LEVEL).toBe('info');
  });

  it('defaults LOG_LEVEL to silent in test environment', () => {
    const config = validateEnv({ NODE_ENV: 'test' });
    expect(config.NODE_ENV).toBe('test');
    expect(config.LOG_LEVEL).toBe('silent');
  });

  it('correctly parses and coerces custom valid environment variables', () => {
    const config = validateEnv({
      NODE_ENV: 'production',
      PORT: '8080',
      CLIENT_ORIGIN: 'https://expenseflow.vercel.app',
      LOG_LEVEL: 'warn',
    });
    expect(config.NODE_ENV).toBe('production');
    expect(config.PORT).toBe(8080);
    expect(config.CLIENT_ORIGIN).toBe('https://expenseflow.vercel.app');
    expect(config.LOG_LEVEL).toBe('warn');
  });

  it('throws a descriptive error on invalid PORT', () => {
    expect(() => validateEnv({ PORT: 'invalid_port' })).toThrowError(
      /Invalid environment configuration/
    );
    expect(() => validateEnv({ PORT: '-1' })).toThrowError(
      /Invalid environment configuration/
    );
    expect(() => validateEnv({ PORT: '99999' })).toThrowError(
      /Invalid environment configuration/
    );
  });

  it('throws a descriptive error on invalid NODE_ENV', () => {
    expect(() => validateEnv({ NODE_ENV: 'staging' })).toThrowError(
      /Invalid environment configuration/
    );
  });

  it('throws a descriptive error on invalid LOG_LEVEL', () => {
    expect(() => validateEnv({ LOG_LEVEL: 'verbose' })).toThrowError(
      /Invalid environment configuration/
    );
  });
});

