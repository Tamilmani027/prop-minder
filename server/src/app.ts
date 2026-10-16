import express, { Express } from 'express';
import crypto from 'crypto';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';

export const createApp = (): Express => {
  const app = express();

  // Hide the framework from response headers.
  app.disable('x-powered-by');
  // Trust the reverse proxy (Docker, ingress, etc.) so req.ip is the real client.
  app.set('trust proxy', 1);

  // Every request gets an id (from x-request-id or a new UUID). pino-http attaches
  // it as req.log/req.id so all request logs are correlated.
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => {
        const header = req.headers['x-request-id'];
        return typeof header === 'string' ? header : crypto.randomUUID();
      },
    })
  );

  // Echo the request id back so clients can correlate logs with responses.
  app.use((req, res, next) => {
    res.setHeader('x-request-id', String(req.id ?? crypto.randomUUID()));
    next();
  });

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/v1', routes);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // 404 for any route not matched above.
  app.use(notFound);
  // Error handler (registered last).
  app.use(errorHandler);

  return app;
};
