import { randomUUID } from 'node:crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmetImport, { type HelmetOptions } from 'helmet';
import mongoose from 'mongoose';
import { pinoHttp } from 'pino-http';
import type { Env } from './config/env.js';
import { createLogger } from './config/logger.js';
import { errorHandler, HttpError, notFound } from './lib/errors.js';
import { rejectUnsafeKeys } from './middleware/validation.js';
import { adminRoutes } from './routes/admin.js';
import { authRoutes } from './routes/auth.js';
import { formRoutes } from './routes/forms.js';
import { portalRoutes } from './routes/portal.js';
import { publicRoutes } from './routes/public.js';
import { createEmailProvider } from './services/email.js';

// Helmet's declarations differ between ESM and CommonJS resolution modes. Normalize
// the import so clean platform builds and local builds use the same callable value.
const helmet = (
  typeof helmetImport === 'function'
    ? helmetImport
    : (helmetImport as unknown as { default: unknown }).default
) as (options?: Readonly<HelmetOptions>) => RequestHandler;

export function createApp(env: Env) {
  const app = express();
  const logger = createLogger(env);
  const email = createEmailProvider(env, logger);
  if (env.TRUST_PROXY) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    req.requestId = req.get('X-Request-ID')?.slice(0, 100) ?? randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    next();
  });
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/api/health' },
      customProps: (req) => ({ requestId: req.id }),
    }),
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
      referrerPolicy: { policy: 'no-referrer' },
      strictTransportSecurity:
        env.NODE_ENV === 'production'
          ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
          : false,
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origin === env.WEB_ORIGIN) return callback(null, true);
        return callback(new HttpError(403, 'ORIGIN_DENIED', 'The request origin is not allowed.'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'X-CSRF-Token',
        'X-Request-ID',
        'Idempotency-Key',
        'X-Confirm-Action',
      ],
      exposedHeaders: ['X-Request-ID'],
      maxAge: 600,
    }),
  );
  app.use(cookieParser());
  app.use(
    express.json({ limit: '64kb', strict: true, type: ['application/json', 'application/*+json'] }),
  );
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use(rejectUnsafeKeys);

  const standardLimiter = rateLimit({
    windowMs: 60_000,
    limit: env.NODE_ENV === 'test' ? 1000 : 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      ok: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again later.' },
    },
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: env.NODE_ENV === 'test' ? 1000 : 12,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
      ok: false,
      error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' },
    },
  });
  const formLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: env.NODE_ENV === 'test' ? 1000 : 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      ok: false,
      error: { code: 'RATE_LIMITED', message: 'Too many submissions. Try again later.' },
    },
  });
  app.use('/api', standardLimiter);
  app.get('/api/health', (_req, res) =>
    res.json({
      ok: true,
      data: { status: 'healthy', uptimeSeconds: Math.floor(process.uptime()) },
    }),
  );
  app.get('/api/ready', (_req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({
      ok: ready,
      data: {
        status: ready ? 'ready' : 'not_ready',
        database: ready ? 'connected' : 'disconnected',
      },
    });
  });
  app.use('/api/auth', authLimiter, authRoutes(env, email, logger));
  app.use('/api/forms', formLimiter, formRoutes(env, email, logger));
  app.use('/api/public', formLimiter, publicRoutes(env, email, logger));
  app.use('/api/portal', portalRoutes(env));
  app.use('/api/admin', adminRoutes(env));
  app.use(notFound);
  app.use(errorHandler(logger, env.NODE_ENV === 'production'));
  return app;
}
