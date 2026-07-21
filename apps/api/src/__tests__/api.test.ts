import argon2 from 'argon2';
import request from 'supertest';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Env } from '../config/env.js';
import { createApp } from '../app.js';
import {
  AssessmentRequest,
  AuditLog,
  ContactSubmission,
  Lead,
  RefreshSession,
  Report,
  Resource,
  User,
} from '../models/index.js';
import { sha256 } from '../lib/security.js';

const env: Env = {
  NODE_ENV: 'test',
  PORT: 4000,
  MONGODB_URI: 'mongodb://unused/test',
  WEB_ORIGIN: 'http://localhost:5173',
  PUBLIC_URL: 'http://localhost:5173',
  SESSION_COOKIE_NAME: 'portal_session',
  SESSION_TTL_MINUTES: 30,
  SESSION_REFRESH_TTL_DAYS: 7,
  COOKIE_SECURE: false,
  TRUST_PROXY: false,
  LOG_LEVEL: 'silent',
  IP_HASH_SECRET: 'test-secret-that-is-at-least-thirty-two-characters',
  EMAIL_PROVIDER: 'console',
  EMAIL_FROM: 'security@example.com',
  ADMIN_NOTIFICATION_EMAIL: 'admin@example.com',
  SMTP_PORT: 587,
  SMTP_SECURE: false,
};
const app = createApp(env);
const validContact = {
  name: 'Amina Mensah',
  workEmail: 'amina@example.com',
  organisation: 'Example Org',
  phone: '',
  topic: 'services',
  message: 'We need help scoping an assessment.',
  consent: true,
  website: '',
  idempotencyKey: '45c642d7-b8db-45bf-9cee-8b43f90cf9fa',
};

beforeAll(async () => {
  await argon2.hash('warmup-password');
});
afterEach(() => vi.restoreAllMocks());

function queryResult<T>(value: T) {
  return { select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(value) }) };
}
function auditMocks() {
  vi.spyOn(AuditLog, 'findOne').mockReturnValue({
    sort: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
    }),
  } as never);
  vi.spyOn(AuditLog, 'create').mockResolvedValue({} as never);
}
function authenticatedUserMocks(roles: string[], csrfToken?: string) {
  vi.spyOn(RefreshSession, 'findOne').mockReturnValue(
    queryResult({
      _id: 'session-id',
      userId: 'user-id',
      csrfHash: csrfToken ? sha256(csrfToken) : 'unused',
    }) as never,
  );
  vi.spyOn(RefreshSession, 'updateOne').mockResolvedValue({} as never);
  vi.spyOn(User, 'findOne').mockReturnValue({
    lean: vi.fn().mockResolvedValue({
      _id: 'user-id',
      name: 'Authorised user',
      email: 'authorised@example.com',
      roleKeys: roles,
      organisationId: '507f1f77bcf86cd799439011',
      status: 'active',
    }),
  } as never);
  if (csrfToken)
    vi.spyOn(RefreshSession, 'findById').mockReturnValue(
      queryResult({ _id: 'session-id', csrfHash: sha256(csrfToken) }) as never,
    );
}

describe('API security and workflows', () => {
  it('serves health and secure headers', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body.data.status).toBe('healthy');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('validates and accepts a contact submission only after persistence', async () => {
    vi.spyOn(ContactSubmission, 'findOne').mockReturnValue(queryResult(null) as never);
    vi.spyOn(ContactSubmission, 'create').mockResolvedValue({ _id: 'submission-id' } as never);
    vi.spyOn(Lead, 'create').mockResolvedValue({} as never);
    const response = await request(app)
      .post('/api/forms/contact')
      .set('Origin', env.WEB_ORIGIN)
      .set('Idempotency-Key', validContact.idempotencyKey)
      .send(validContact)
      .expect(201);
    expect(response.body.ok).toBe(true);
    expect(response.body.data.reference).toMatch(/^CON-/);
    expect(ContactSubmission.create).toHaveBeenCalledOnce();
  });

  it('returns the original reference for a duplicate submission', async () => {
    vi.spyOn(ContactSubmission, 'findOne').mockReturnValue(
      queryResult({ reference: 'CON-ORIGINAL', status: 'received' }) as never,
    );
    const response = await request(app)
      .post('/api/forms/contact')
      .set('Idempotency-Key', validContact.idempotencyKey)
      .send(validContact)
      .expect(200);
    expect(response.body.data).toMatchObject({ reference: 'CON-ORIGINAL', duplicate: true });
  });

  it('validates and persists an assessment request with a reference', async () => {
    vi.spyOn(AssessmentRequest, 'findOne').mockReturnValue(queryResult(null) as never);
    vi.spyOn(AssessmentRequest, 'create').mockResolvedValue({ _id: 'assessment-id' } as never);
    vi.spyOn(Lead, 'create').mockResolvedValue({} as never);
    const assessment = {
      name: 'Amina Mensah',
      workEmail: 'amina@example.com',
      organisation: 'Example Org',
      phone: '',
      service: 'security-assessments',
      organisationSize: '50-249',
      timeframe: 'within-30-days',
      context: 'We need an evidence-led review of our external attack surface.',
      consent: true,
      website: '',
      idempotencyKey: 'dad0f789-0e61-44aa-88a0-a6dde4bb980e',
    };
    const response = await request(app)
      .post('/api/forms/assessment')
      .set('Idempotency-Key', assessment.idempotencyKey)
      .send(assessment)
      .expect(201);
    expect(response.body.data.reference).toMatch(/^ASM-/);
    expect(AssessmentRequest.create).toHaveBeenCalledOnce();
  });

  it('rejects validation errors and NoSQL injection keys', async () => {
    await request(app)
      .post('/api/forms/contact')
      .send({ ...validContact, workEmail: 'bad' })
      .expect(422);
    const response = await request(app)
      .post('/api/forms/contact')
      .send({ ...validContact, message: { $ne: '' } })
      .expect(400);
    expect(response.body.error.code).toBe('UNSAFE_INPUT');
  });

  it('protects admin routes and enforces roles', async () => {
    await request(app).get('/api/admin/summary').expect(401);
    vi.spyOn(RefreshSession, 'findOne').mockReturnValue(
      queryResult({ _id: 'session-id', userId: 'user-id', csrfHash: 'x' }) as never,
    );
    vi.spyOn(RefreshSession, 'updateOne').mockResolvedValue({} as never);
    vi.spyOn(User, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: 'user-id',
        name: 'Client',
        email: 'client@example.com',
        roleKeys: ['client_user'],
        organisationId: '507f1f77bcf86cd799439011',
        status: 'active',
      }),
    } as never);
    await request(app)
      .get('/api/admin/summary')
      .set('Cookie', 'portal_session=access-token')
      .expect(403);
  });

  it('prevents BOLA by including the authorised organisation in report queries', async () => {
    const organisationId = '507f1f77bcf86cd799439011';
    vi.spyOn(RefreshSession, 'findOne').mockReturnValue(
      queryResult({ _id: 'session-id', userId: 'user-id', csrfHash: 'x' }) as never,
    );
    vi.spyOn(RefreshSession, 'updateOne').mockResolvedValue({} as never);
    vi.spyOn(User, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: 'user-id',
        name: 'Client',
        email: 'client@example.com',
        roleKeys: ['client_user'],
        organisationId,
        status: 'active',
      }),
    } as never);
    const find = vi.spyOn(Report, 'findOne').mockReturnValue(queryResult(null) as never);
    await request(app)
      .get('/api/portal/reports/507f1f77bcf86cd799439012')
      .set('Cookie', 'portal_session=access-token')
      .expect(404);
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ organisationId }));
  });

  it('sets secure cookie architecture on valid login', async () => {
    const password = 'A-strong-development-password';
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    vi.spyOn(User, 'findOne').mockReturnValue(
      queryResult({
        _id: 'user-id',
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash,
        roleKeys: ['super_admin'],
        status: 'active',
        failedLoginCount: 0,
      }) as never,
    );
    vi.spyOn(User, 'updateOne').mockResolvedValue({} as never);
    vi.spyOn(RefreshSession, 'create').mockResolvedValue({} as never);
    auditMocks();
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password })
      .expect(200);
    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies.join(' ')).toContain('HttpOnly');
    expect(cookies.join(' ')).toContain('SameSite=Strict');
    expect(cookies.join(' ')).toContain('csrf_token=');
  });

  it('does not reveal whether a password-reset account exists', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null);
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'unknown@example.com' })
      .expect(202);
    expect(response.body.data.message).toContain('If an eligible account exists');
  });

  it('resets a password and revokes existing sessions', async () => {
    const user = {
      _id: 'user-id',
      id: 'user-id',
      email: 'client@example.com',
      organisationId: '507f1f77bcf86cd799439011',
      passwordHash: 'previous-hash',
      resetTokenHash: 'stored-hash',
      resetExpiresAt: new Date(Date.now() + 60_000),
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(User, 'findOne').mockReturnValue({
      select: vi.fn().mockResolvedValue(user),
    } as never);
    vi.spyOn(RefreshSession, 'updateMany').mockResolvedValue({} as never);
    auditMocks();
    await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: 'a-valid-reset-token-that-is-long-enough',
        password: 'A-new-password-with-adequate-entropy',
      })
      .expect(200);
    expect(user.passwordHash).not.toBe('previous-hash');
    expect(user.resetTokenHash).toBeUndefined();
    expect(RefreshSession.updateMany).toHaveBeenCalledWith(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: expect.any(Date) } },
    );
  });

  it('rate-limits repeated authentication attempts', async () => {
    const limitedApp = createApp({ ...env, NODE_ENV: 'development' });
    for (let attempt = 0; attempt < 12; attempt += 1)
      await request(limitedApp).post('/api/auth/login').send({}).expect(422);
    const response = await request(limitedApp).post('/api/auth/login').send({}).expect(429);
    expect(response.body.error.code).toBe('RATE_LIMITED');
  });

  it('requires confirmation and publishes a resource for an authorised editor', async () => {
    const csrfToken = 'csrf-token-for-publishing';
    authenticatedUserMocks(['content_editor'], csrfToken);
    vi.spyOn(Resource, 'findOneAndUpdate').mockResolvedValue({
      _id: '507f1f77bcf86cd799439012',
      status: 'published',
      publishedAt: new Date(),
    } as never);
    auditMocks();
    const response = await request(app)
      .post('/api/admin/content/507f1f77bcf86cd799439012/publish')
      .set('Cookie', [`portal_session=access-token`, `csrf_token=${csrfToken}`])
      .set('X-CSRF-Token', csrfToken)
      .set('X-Confirm-Action', 'publish-resource')
      .expect(200);
    expect(response.body.data.status).toBe('published');
    expect(Resource.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: '507f1f77bcf86cd799439012', deletedAt: null }),
      expect.objectContaining({ $set: expect.objectContaining({ status: 'published' }) }),
      { new: true },
    );
  });
});
