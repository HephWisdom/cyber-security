import pino from 'pino';
import type { Env } from './env.js';

export function createLogger(env: Env) {
  return pino({
    level: env.LOG_LEVEL,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
        'password',
        'passwordHash',
        'token',
        'tokenHash',
        'refreshToken',
        '*.email',
        '*.phone',
        '*.message',
        '*.context',
        '*.summary',
      ],
      censor: '[REDACTED]',
    },
    base: { service: 'cybersecurity-platform-api', environment: env.NODE_ENV },
  });
}
