import 'dotenv/config';
import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import { loadEnv } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createApp } from './app.js';

const env = loadEnv();
const logger = createLogger(env);
mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

let connectionPromise: Promise<typeof mongoose> | undefined;

function connectDatabase() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  connectionPromise ??= mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10_000,
  }).catch((error: unknown) => {
    connectionPromise = undefined;
    throw error;
  });
  return connectionPromise;
}

const requireDatabase: RequestHandler = async (_req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    logger.error({ err: error }, 'Database connection failed');
    res.status(503).json({
      ok: false,
      error: { code: 'DATABASE_UNAVAILABLE', message: 'Service temporarily unavailable.' },
    });
  }
};

const app = createApp(env, requireDatabase);

async function start() {
  await connectDatabase();
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

if (!process.env.VERCEL) {
  start().catch((error) => {
    logger.fatal({ err: error }, 'API startup failed');
    process.exitCode = 1;
  });
}

export default app;
