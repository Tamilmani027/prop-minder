import { createApp } from '../src/app';
import request from 'supertest';

describe('app', () => {
  it('GET /health returns 200 {status: ok}', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('unknown route returns 404 NOT_FOUND with a requestId', async () => {
    const app = createApp();
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(typeof res.body.error.requestId).toBe('string');
  });

  it('echoes back a provided x-request-id', async () => {
    const app = createApp();
    const res = await request(app)
      .get('/health')
      .set('x-request-id', 'custom-id-123');
    expect(res.headers['x-request-id']).toBe('custom-id-123');
  });

  it('does not send X-Powered-By', async () => {
    const app = createApp();
    const res = await request(app).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
