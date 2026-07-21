import { z } from 'zod';

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().min(1),
  WEB_ORIGIN: z.string().url(),
  PUBLIC_URL: z.string().url(),
  SESSION_COOKIE_NAME: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/)
    .default('portal_session'),
  SESSION_TTL_MINUTES: z.coerce.number().int().min(5).max(60).default(30),
  SESSION_REFRESH_TTL_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  COOKIE_SECURE: booleanString.default('true'),
  TRUST_PROXY: booleanString.default('false'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  IP_HASH_SECRET: z.string().min(32),
  EMAIL_PROVIDER: z.enum(['console', 'smtp']).default('console'),
  EMAIL_FROM: z.string().email(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_SECURE: booleanString.default('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const names = result.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`Invalid environment configuration: ${names}`);
  }
  if (result.data.NODE_ENV === 'production' && !result.data.COOKIE_SECURE)
    throw new Error('COOKIE_SECURE must be true in production');
  if (
    result.data.EMAIL_PROVIDER === 'smtp' &&
    (!result.data.SMTP_HOST || !result.data.SMTP_USER || !result.data.SMTP_PASSWORD)
  )
    throw new Error('SMTP settings are required when EMAIL_PROVIDER=smtp');
  return result.data;
}
