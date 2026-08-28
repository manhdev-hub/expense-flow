import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('Express application foundation', () => {
  it('exports Express app instance without binding a port on import', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  it('applies Helmet security headers on HTTP responses', async () => {
    // Define a temporary test endpoint
    app.get('/test/security-headers', (_req, res) => {
      res.status(200).json({ ok: true });
    });

    const response = await request(app).get('/test/security-headers');

    expect(response.status).toBe(200);
    expect(response.headers['x-dns-prefetch-control']).toBe('off');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('parses JSON bodies up to 1mb payload limit', async () => {
    app.post('/test/json-body', (req, res) => {
      res.status(200).json({ received: req.body });
    });

    const validPayload = { message: 'Hello ExpenseFlow' };
    const validRes = await request(app)
      .post('/test/json-body')
      .send(validPayload);

    expect(validRes.status).toBe(200);
    expect(validRes.body.received).toEqual(validPayload);

    // Oversized body (>1MB) should be rejected by express.json limit with HTTP 413
    const oversizedPayload = 'a'.repeat(1024 * 1024 * 1.5);
    const oversizedRes = await request(app)
      .post('/test/json-body')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ data: oversizedPayload }));

    expect(oversizedRes.status).toBe(413);
  });

  it('includes environment-based CORS headers with credentials allowed', async () => {
    app.get('/test/cors', (_req, res) => {
      res.status(200).json({ cors: 'ok' });
    });

    const response = await request(app)
      .get('/test/cors')
      .set('Origin', 'http://localhost:3000');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('attaches logger to request context via httpLogger middleware', async () => {
    app.get('/test/http-logger', (req, res) => {
      expect(req.log).toBeDefined();
      expect(typeof req.log.info).toBe('function');
      res.status(200).json({ loggerAttached: true });
    });

    const response = await request(app).get('/test/http-logger');
    expect(response.status).toBe(200);
    expect(response.body.loggerAttached).toBe(true);
  });
});

