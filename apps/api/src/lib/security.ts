import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}
export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}
export function hmac(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}
export function safeIpHash(ip: string | undefined, secret: string) {
  return hmac(ip ?? 'unknown', secret);
}
export function reference(prefix: string) {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `${prefix}-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function containsUnsafeMongoKey(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(containsUnsafeMongoKey);
  return Object.entries(value as Record<string, unknown>).some(
    ([key, child]) => key.startsWith('$') || key.includes('.') || containsUnsafeMongoKey(child),
  );
}

export function normalizeString(value: string) {
  return value.normalize('NFKC').replaceAll(String.fromCharCode(0), '').trim();
}

export function normalizeObject<T>(value: T): T {
  if (typeof value === 'string') return normalizeString(value) as T;
  if (Array.isArray(value)) return value.map(normalizeObject) as T;
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [
        key,
        normalizeObject(child),
      ]),
    ) as T;
  return value;
}
