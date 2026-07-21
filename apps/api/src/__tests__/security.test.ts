import { describe, expect, it } from 'vitest';
import { assessmentSchema, contactSchema, loginSchema } from '@platform/shared';
import { containsUnsafeMongoKey, normalizeObject } from '../lib/security.js';

describe('input security', () => {
  it('rejects nested NoSQL operators and dotted keys', () => {
    expect(containsUnsafeMongoKey({ email: { $ne: null } })).toBe(true);
    expect(containsUnsafeMongoKey({ 'profile.role': 'admin' })).toBe(true);
    expect(containsUnsafeMongoKey({ email: 'person@example.com' })).toBe(false);
  });

  it('normalizes unicode and removes null bytes', () => {
    expect(normalizeObject({ name: '  Ａlice\u0000 ' })).toEqual({ name: 'Alice' });
  });

  it('enforces form bounds, consent and idempotency', () => {
    const invalid = contactSchema.safeParse({
      name: 'A',
      workEmail: 'not-an-email',
      organisation: 'Org',
      topic: 'general',
      message: '<script>alert(1)</script>',
      consent: false,
      idempotencyKey: 'guessable',
    });
    expect(invalid.success).toBe(false);
    const assessment = assessmentSchema.safeParse({});
    expect(assessment.success).toBe(false);
  });

  it('requires a strong minimum portal password', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'short' }).success).toBe(
      false,
    );
  });
});
