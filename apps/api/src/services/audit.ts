import { AuditLog } from '../models/index.js';
import { sha256 } from '../lib/security.js';

type AuditInput = {
  actorId?: string;
  organisationId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  outcome: 'success' | 'failure' | 'denied';
  requestId?: string;
  ipHash?: string;
  metadata?: Record<string, unknown>;
};

export async function writeAudit(input: AuditInput) {
  const previous = await AuditLog.findOne().sort({ createdAt: -1 }).select('entryHash').lean();
  const previousHash = previous?.entryHash ?? 'GENESIS';
  const createdAt = new Date();
  const entryHash = sha256(
    JSON.stringify({ previousHash, ...input, createdAt: createdAt.toISOString() }),
  );
  await AuditLog.create({ ...input, previousHash, entryHash, createdAt });
}
