import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('Express application foundation', () => {
  it('exports Express app instance without binding a port on import', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  it('applies Helmet security headers on HTTP responses', async () => {
    const response = await request(app).get('/test-security-headers');

    expect(response.headers['x-dns-prefetch-control']).toBe('off');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('includes environment-based CORS headers with credentials allowed', async () => {
    const response = await request(app)
      .get('/test-cors')
      .set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000'
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('sets X-Request-Id header on all HTTP responses', async () => {
    const response = await request(app).get('/test-request-id');
    expect(response.headers['x-request-id']).toBeDefined();
  });

  it('returns standard 404 error envelope on unmatched route', async () => {
    const response = await request(app).get('/unknown-api-endpoint');
    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error.requestId).toBe(response.headers['x-request-id']);
  });

  it('rejects oversized JSON bodies (>1MB) with HTTP 413 and standard error envelope', async () => {
    const oversizedPayload = 'a'.repeat(1024 * 1024 * 1.5);
    const response = await request(app)
      .post('/test-oversized')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ data: oversizedPayload }));

    expect(response.status).toBe(413);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    expect(response.body.error.requestId).toBe(response.headers['x-request-id']);
  });
});
