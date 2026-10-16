import { env } from './config/env';
import { logger } from './utils/logger';
import { connectDb, disconnectDb } from './db/connect';
import { createApp } from './app';

const main = async (): Promise<void> => {
  await connectDb();

  const app = createApp();
  const httpServer = app.listen(env.port, () => {
    logger.info(`API listening on port ${env.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down');
    httpServer.close(() => {
      disconnectDb().then(() => process.exit(0));
    });
    // Force exit after 10 seconds if graceful shutdown does not finish. .unref
    // lets the process exit even if this timer is still pending.
    setTimeout(() => {
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (err: unknown) => {
    logger.fatal({ err }, 'unhandled rejection');
    process.exit(1);
  });
};

main().catch((err: unknown) => {
  logger.fatal({ err }, 'failed to start');
  process.exit(1);
});
