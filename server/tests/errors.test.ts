import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import pinoHttp from 'pino-http';
import request from 'supertest';
import { logger } from '../src/utils/logger';
import { AppError } from '../src/utils/AppError';
import { validate } from '../src/middleware/validate';
import { errorHandler } from '../src/middleware/errorHandler';

const schema = z.object({
  email: z.string().email(),
  age: z.number().positive(),
});

const buildApp = () => {
  const app = express();
  app.use(pinoHttp({ logger }));
  app.use(express.json());

  app.post(
    '/test',
    validate({ body: schema }),
    (_req: Request, res: Response): void => {
      res.json({ ok: true });
    }
  );

  app.post(
    '/echo',
    validate({ body: schema }),
    (_req: Request, res: Response): void => {
      // res.locals holds the validated (unknown-key-stripped) body.
      res.json(res.locals.validated?.body);
    }
  );

  app.get('/boom', (_req: Request, res: Response, next: NextFunction): void => {
    next(new AppError(400, 'BAD_REQUEST', 'boom'));
  });

  app.get(
    '/unknown-err',
    (_req: Request, res: Response, next: NextFunction): void => {
      next(new Error('internal details that must not leak'));
    }
  );

  app.get(
    '/reject-async',
    async (_req: Request, res: Response): Promise<void> => {
      throw new Error('async rejection');
    }
  );

  app.use(errorHandler);
  return app;
};

describe('error system', () => {
  it('validate rejects a bad body and lists ALL issues', async () => {
    const app = buildApp();
    const res = await request(app).post('/test').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toHaveLength(2);
  });

  it('validate accepts a good body and strips unknown keys', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/echo')
      .send({ email: 'a@b.com', age: 30, role: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('a@b.com');
    expect(res.body.age).toBe(30);
    expect(res.body.role).toBeUndefined();
  });

  it('malformed JSON -> 400 INVALID_JSON', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send('{not valid json');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('thrown AppError keeps its status and message', async () => {
    const app = buildApp();
    const res = await request(app).get('/boom');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.message).toBe('boom');
  });

  it('unknown Error -> 500 INTERNAL without leaking the internal message', async () => {
    const app = buildApp();
    const res = await request(app).get('/unknown-err');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL');
    expect(res.body.error.message).toBe('Something went wrong');
    expect(JSON.stringify(res.body)).not.toContain('internal details');
  });

  it('a rejected async handler reaches the error handler (Express 5)', async () => {
    const app = buildApp();
    const res = await request(app).get('/reject-async');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL');
  });
});
