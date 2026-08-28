import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.js';

describe('GET /api/v1/health', () => {
  it('returns HTTP 200 with status ok and no auth requirement', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('includes X-Request-Id header on health check response', async () => {
    const customRequestId = 'health-check-req-123';
    const response = await request(app)
      .get('/api/v1/health')
      .set('X-Request-Id', customRequestId);

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBe(customRequestId);
  });

  it('does not expose internal secrets or database metadata in response', async () => {
    const response = await request(app).get('/api/v1/health');

    const stringified = JSON.stringify(response.body);
    expect(stringified).not.toContain('password');
    expect(stringified).not.toContain('secret');
    expect(stringified).not.toContain('DATABASE_URL');
    expect(stringified).not.toContain('postgres');
  });
});

