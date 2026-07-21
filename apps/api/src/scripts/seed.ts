import 'dotenv/config';
import argon2 from 'argon2';
import mongoose from 'mongoose';
import { z } from 'zod';
import { loadEnv } from '../config/env.js';
import {
  Engagement,
  Finding,
  Organisation,
  Report,
  Role,
  Service,
  SupportTicket,
  User,
} from '../models/index.js';
import { writeAudit } from '../services/audit.js';

const env = loadEnv();
if (env.NODE_ENV === 'production') throw new Error('Development seed is disabled in production.');
const credentials = z
  .object({
    SEED_ADMIN_EMAIL: z.string().email(),
    SEED_ADMIN_PASSWORD: z.string().min(16),
    SEED_CLIENT_EMAIL: z.string().email(),
    SEED_CLIENT_PASSWORD: z.string().min(16),
  })
  .parse(process.env);
await mongoose.connect(env.MONGODB_URI);

const roles = [
  ['super_admin', 'Super Admin', ['*']],
  ['administrator', 'Administrator', ['admin:read', 'admin:write', 'users:manage']],
  [
    'security_analyst',
    'Security Analyst',
    ['engagements:read', 'findings:write', 'reports:write', 'tickets:write'],
  ],
  ['content_editor', 'Content Editor', ['content:read', 'content:write', 'content:publish']],
  [
    'sales_support',
    'Sales / Support',
    ['leads:read', 'leads:write', 'tickets:read', 'tickets:write'],
  ],
  ['client_user', 'Client User', ['portal:read', 'tickets:write', 'profile:write']],
] as const;
for (const [key, name, permissions] of roles)
  await Role.updateOne({ key }, { $set: { name, permissions, system: true } }, { upsert: true });

const organisation = await Organisation.findOneAndUpdate(
  { name: 'Fictional Example Organisation' },
  {
    $set: {
      name: 'Fictional Example Organisation',
      industry: 'Technology (fictional sample)',
      status: 'active',
      dataRegion: 'Development only',
    },
  },
  { upsert: true, new: true },
);
const [adminHash, clientHash] = await Promise.all([
  argon2.hash(credentials.SEED_ADMIN_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  }),
  argon2.hash(credentials.SEED_CLIENT_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  }),
]);
const admin = await User.findOneAndUpdate(
  { email: credentials.SEED_ADMIN_EMAIL.toLowerCase() },
  {
    $set: {
      name: 'Development Administrator',
      passwordHash: adminHash,
      roleKeys: ['super_admin'],
      status: 'active',
      passwordChangedAt: new Date(),
      deletedAt: null,
    },
  },
  { upsert: true, new: true },
);
const client = await User.findOneAndUpdate(
  { email: credentials.SEED_CLIENT_EMAIL.toLowerCase() },
  {
    $set: {
      name: 'Development Client User',
      passwordHash: clientHash,
      roleKeys: ['client_user'],
      organisationId: organisation._id,
      status: 'active',
      passwordChangedAt: new Date(),
      deletedAt: null,
    },
  },
  { upsert: true, new: true },
);

const service = await Service.findOneAndUpdate(
  { slug: 'security-assessments' },
  {
    $set: {
      name: 'Security Assessments',
      summary: 'Development service seed.',
      active: true,
      order: 1,
      publishedAt: new Date(),
      deletedAt: null,
    },
  },
  { upsert: true, new: true },
);
const engagement = await Engagement.findOneAndUpdate(
  { reference: 'DEV-ENG-001' },
  {
    $set: {
      organisationId: organisation._id,
      serviceId: service._id,
      title: 'Sample cloud security assessment',
      status: 'active',
      ownerId: admin._id,
      summary: 'Fictional development engagement. No client or production data.',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60_000),
      sampleData: true,
      deletedAt: null,
    },
  },
  { upsert: true, new: true },
);
await Finding.updateOne(
  { organisationId: organisation._id, reference: 'DEV-FND-001' },
  {
    $set: {
      engagementId: engagement._id,
      title: 'Sample excessive development privilege',
      severity: 'high',
      status: 'in_progress',
      description: 'Fictional finding for interface development.',
      remediation: 'Fictional remediation guidance.',
      sampleData: true,
      deletedAt: null,
    },
  },
  { upsert: true },
);
await Finding.updateOne(
  { organisationId: organisation._id, reference: 'DEV-FND-002' },
  {
    $set: {
      engagementId: engagement._id,
      title: 'Sample logging coverage gap',
      severity: 'medium',
      status: 'open',
      description: 'Fictional finding for interface development.',
      remediation: 'Fictional remediation guidance.',
      sampleData: true,
      deletedAt: null,
    },
  },
  { upsert: true },
);
await Report.updateOne(
  { engagementId: engagement._id, version: 1 },
  {
    $set: {
      organisationId: organisation._id,
      title: 'Sample assessment report metadata',
      status: 'published',
      storageKey: 'development/sample-report-not-present.pdf',
      sha256: '0000000000000000000000000000000000000000000000000000000000000000',
      mimeType: 'application/pdf',
      size: 0,
      publishedAt: new Date(),
      sampleData: true,
      deletedAt: null,
    },
  },
  { upsert: true },
);
await SupportTicket.updateOne(
  { reference: 'DEV-TKT-001' },
  {
    $set: {
      organisationId: organisation._id,
      title: 'Sample remediation clarification',
      idempotencyKey: '1d79cd67-68af-44e2-b442-1bb8ec86e68f',
      status: 'open',
      priority: 'normal',
      createdBy: client._id,
      assignedTo: admin._id,
      sampleData: true,
      deletedAt: null,
    },
  },
  { upsert: true },
);
await writeAudit({
  actorId: String(admin._id),
  action: 'development.seed',
  targetType: 'System',
  outcome: 'success',
  metadata: { sampleData: true },
});

process.stdout.write(
  'Development seed complete. All seeded operational records are fictional sample data.\n',
);
await mongoose.disconnect();
