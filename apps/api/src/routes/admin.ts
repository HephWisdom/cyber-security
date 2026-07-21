import { Router } from 'express';
import { z } from 'zod';
import type { Env } from '../config/env.js';
import { HttpError } from '../lib/errors.js';
import { safeIpHash } from '../lib/security.js';
import { authenticate, csrfProtection, requireRoles } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import {
  Application,
  AuditLog,
  CareerOpening,
  Engagement,
  Finding,
  Lead,
  NewsletterSubscriber,
  Organisation,
  Resource,
  SiteSetting,
  SupportTicket,
  User,
} from '../models/index.js';
import { writeAudit } from '../services/audit.js';

const adminRoles = [
  'super_admin',
  'administrator',
  'security_analyst',
  'content_editor',
  'sales_support',
];
const resourceInput = z
  .object({
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .max(160),
    title: z.string().trim().min(3).max(300),
    summary: z.string().trim().min(10).max(1000),
    body: z.string().trim().min(20).max(100000),
  })
  .strict();

export function adminRoutes(env: Env) {
  const router = Router();
  router.use(authenticate(env), requireRoles(...adminRoles));

  router.get('/summary', async (req, res, next) => {
    try {
      const [newLeads, activeEngagements, openFindings, openTickets, audit] = await Promise.all([
        Lead.countDocuments({ status: 'new', deletedAt: null }),
        Engagement.countDocuments({ status: 'active', deletedAt: null }),
        Finding.countDocuments({ status: { $in: ['open', 'in_progress'] }, deletedAt: null }),
        SupportTicket.countDocuments({ status: { $nin: ['resolved', 'closed'] }, deletedAt: null }),
        AuditLog.find()
          .select('action actorId createdAt')
          .sort({ createdAt: -1 })
          .limit(8)
          .populate('actorId', 'name')
          .lean(),
      ]);
      res.json({
        ok: true,
        data: {
          sampleData: process.env.NODE_ENV !== 'production',
          counts: { newLeads, activeEngagements, openFindings, openTickets },
          recentAudit: audit.map((entry) => ({
            id: String(entry._id),
            action: entry.action,
            actor: actorName(entry.actorId),
            createdAt: entry.createdAt,
          })),
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get(
    '/leads',
    list(Lead, 'reference type status organisation createdAt updatedAt', (row) => ({
      title: `${row.reference} · ${row.type}`,
      status: row.status,
      updatedAt: row.updatedAt,
    })),
  );
  router.get(
    '/organisations',
    list(Organisation, 'name status industry updatedAt', (row) => ({
      title: row.name,
      status: row.status,
      updatedAt: row.updatedAt,
    })),
  );
  router.get(
    '/users',
    requireRoles('super_admin', 'administrator'),
    list(User, 'name roleKeys status updatedAt', (row) => ({
      title: row.name,
      status: Array.isArray(row.roleKeys) ? row.roleKeys.join(', ') : row.status,
      updatedAt: row.updatedAt,
    })),
  );
  router.get(
    '/engagements',
    list(Engagement, 'title reference status updatedAt sampleData', standard),
  );
  router.get(
    '/findings',
    list(Finding, 'title reference severity status updatedAt sampleData', (row) => ({
      title: `${row.reference} · ${row.title}`,
      status: `${row.severity} · ${row.status}`,
      updatedAt: row.updatedAt,
    })),
  );
  router.get(
    '/tickets',
    list(SupportTicket, 'title reference status updatedAt sampleData', standard),
  );
  router.get('/content', list(Resource, 'title slug status updatedAt', standard));
  router.get('/careers', list(CareerOpening, 'title location status updatedAt', standard));
  router.get(
    '/newsletter',
    requireRoles('super_admin', 'administrator', 'content_editor'),
    list(NewsletterSubscriber, 'status confirmedAt updatedAt', (row) => ({
      title: 'Subscriber (address redacted)',
      status: row.status,
      updatedAt: row.updatedAt,
    })),
  );
  router.get(
    '/settings',
    requireRoles('super_admin', 'administrator'),
    list(SiteSetting, 'key public version updatedAt', (row) => ({
      title: row.key,
      status: row.public ? 'public' : 'private',
      updatedAt: row.updatedAt,
    })),
  );
  router.get(
    '/audit',
    requireRoles('super_admin', 'administrator'),
    list(
      AuditLog as unknown as import('mongoose').Model<Record<string, unknown>>,
      'action targetType outcome createdAt',
      (row) => ({
        title: row.action,
        status: `${row.targetType} · ${row.outcome}`,
        updatedAt: row.createdAt,
      }),
    ),
  );

  router.post(
    '/content',
    requireRoles('super_admin', 'administrator', 'content_editor'),
    csrfProtection(),
    validateBody(resourceInput),
    async (req, res, next) => {
      try {
        const created = await Resource.create({
          ...req.body,
          status: 'draft',
          authorId: req.auth!.id,
        });
        await writeAudit(auditInput(req, env, 'content.create', 'Resource', String(created._id)));
        res.status(201).json({
          ok: true,
          data: { id: String(created._id), status: created.status },
          requestId: req.requestId,
        });
      } catch (error) {
        next(error);
      }
    },
  );
  router.post(
    '/content/:id/publish',
    requireRoles('super_admin', 'administrator', 'content_editor'),
    csrfProtection(),
    async (req, res, next) => {
      try {
        if (req.get('X-Confirm-Action') !== 'publish-resource')
          throw new HttpError(
            400,
            'CONFIRMATION_REQUIRED',
            'Explicit publish confirmation is required.',
          );
        const updated = await Resource.findOneAndUpdate(
          { _id: req.params.id, deletedAt: null, status: { $in: ['draft', 'review'] } },
          { $set: { status: 'published', publishedAt: new Date() } },
          { new: true },
        );
        if (!updated)
          throw new HttpError(404, 'RESOURCE_NOT_FOUND', 'An eligible resource was not found.');
        await writeAudit(auditInput(req, env, 'content.publish', 'Resource', String(updated._id)));
        res.json({
          ok: true,
          data: {
            id: String(updated._id),
            status: updated.status,
            publishedAt: updated.publishedAt,
          },
          requestId: req.requestId,
        });
      } catch (error) {
        next(error);
      }
    },
  );
  router.delete(
    '/applications/:id',
    requireRoles('super_admin', 'administrator'),
    csrfProtection(),
    async (req, res, next) => {
      try {
        if (req.get('X-Confirm-Action') !== 'delete-application')
          throw new HttpError(
            400,
            'CONFIRMATION_REQUIRED',
            'Explicit deletion confirmation is required.',
          );
        const updated = await Application.findOneAndUpdate(
          { _id: req.params.id, deletedAt: null },
          { $set: { deletedAt: new Date() } },
        );
        if (!updated)
          throw new HttpError(404, 'APPLICATION_NOT_FOUND', 'The application was not found.');
        await writeAudit(
          auditInput(req, env, 'application.delete', 'Application', String(req.params.id)),
        );
        res.json({ ok: true, data: { deleted: true }, requestId: req.requestId });
      } catch (error) {
        next(error);
      }
    },
  );
  return router;
}

function list<T>(
  Model: import('mongoose').Model<T>,
  select: string,
  map: (row: Record<string, unknown>) => Record<string, unknown>,
) {
  return async (
    req: import('express').Request,
    res: import('express').Response,
    next: import('express').NextFunction,
  ) => {
    try {
      const rows = await Model.find({ deletedAt: null })
        .select(select)
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(200)
        .lean();
      res.json({
        ok: true,
        data: {
          sampleData: rows.some((row) => Boolean((row as Record<string, unknown>).sampleData)),
          items: rows.map((row) => ({
            id: String((row as Record<string, unknown>)._id),
            ...map(row as Record<string, unknown>),
          })),
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  };
}
function standard(row: Record<string, unknown>) {
  return { title: row.title, status: row.status, updatedAt: row.updatedAt };
}
function actorName(value: unknown) {
  if (value && typeof value === 'object' && 'name' in value) return String(value.name);
  return 'System or unavailable actor';
}
function auditInput(
  req: import('express').Request,
  env: Env,
  action: string,
  targetType: string,
  targetId: string,
) {
  return {
    actorId: req.auth!.id,
    organisationId: req.auth!.organisationId,
    action,
    targetType,
    targetId,
    outcome: 'success' as const,
    requestId: req.requestId,
    ipHash: safeIpHash(req.ip, env.IP_HASH_SECRET),
  };
}
