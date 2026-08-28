import { describe, expect, it } from 'vitest';
import { Writable } from 'node:stream';
import { createLogger } from './logger.js';

describe('logger & redaction', () => {
  it('redacts sensitive direct keys like password, token, secret, DATABASE_URL', () => {
    const logs: string[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        logs.push(chunk.toString());
        callback();
      },
    });

    const testLogger = createLogger({ level: 'info' }, stream);

    testLogger.info({
      password: 'super-secret-password',
      token: 'jwt-access-token',
      refreshToken: 'refresh-session-token',
      csrfToken: 'csrf-raw-token',
      secret: 'app-secret-key',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      nonSensitiveField: 'public-data',
    });

    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]);

    expect(parsed.password).toBe('[REDACTED]');
    expect(parsed.token).toBe('[REDACTED]');
    expect(parsed.refreshToken).toBe('[REDACTED]');
    expect(parsed.csrfToken).toBe('[REDACTED]');
    expect(parsed.secret).toBe('[REDACTED]');
    expect(parsed.DATABASE_URL).toBe('[REDACTED]');
    expect(parsed.nonSensitiveField).toBe('public-data');
  });

  it('redacts nested sensitive keys', () => {
    const logs: string[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        logs.push(chunk.toString());
        callback();
      },
    });

    const testLogger = createLogger({ level: 'info' }, stream);

    testLogger.info({
      user: {
        id: 'usr_123',
        password: 'nested-password',
        token: 'nested-token',
      },
    });

    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]);

    expect(parsed.user.id).toBe('usr_123');
    expect(parsed.user.password).toBe('[REDACTED]');
    expect(parsed.user.token).toBe('[REDACTED]');
  });

  it('redacts sensitive headers in request objects', () => {
    const logs: string[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        logs.push(chunk.toString());
        callback();
      },
    });

    const testLogger = createLogger({ level: 'info' }, stream);

    testLogger.info({
      req: {
        headers: {
          authorization: 'Bearer sensitive-jwt-token',
          cookie: 'refreshToken=secret-cookie-val',
          'x-csrf-token': 'secret-csrf-token',
          'set-cookie': 'sensitive-set-cookie',
          'content-type': 'application/json',
        },
      },
    });

    expect(logs.length).toBe(1);
    const parsed = JSON.parse(logs[0]);

    expect(parsed.req.headers.authorization).toBe('[REDACTED]');
    expect(parsed.req.headers.cookie).toBe('[REDACTED]');
    expect(parsed.req.headers['x-csrf-token']).toBe('[REDACTED]');
    expect(parsed.req.headers['set-cookie']).toBe('[REDACTED]');
    expect(parsed.req.headers['content-type']).toBe('application/json');
  });
});
