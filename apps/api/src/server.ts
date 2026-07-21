import 'dotenv/config';
import mongoose from 'mongoose';
import { loadEnv } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createApp } from './app.js';

const env = loadEnv();
const logger = createLogger(env);
mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

async function start() {
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10_000,
  });
  const app = createApp(env);
  const server = app.listen(env.PORT, () => logger.info({ port: env.PORT }, 'API listening'));
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Graceful shutdown started');
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

start().catch((error) => {
  logger.fatal({ err: error }, 'API startup failed');
  process.exit(1);
});
