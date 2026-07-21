import { Router } from 'express';
import { supportTicketSchema } from '@platform/shared';
import { Types } from 'mongoose';
import type { Env } from '../config/env.js';
import { HttpError } from '../lib/errors.js';
import { reference, safeIpHash } from '../lib/security.js';
import { authenticate, csrfProtection, requireOrganisation } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import {
  AuditLog,
  Engagement,
  Finding,
  Notification,
  Organisation,
  Report,
  SupportTicket,
  TicketMessage,
} from '../models/index.js';
import { writeAudit } from '../services/audit.js';

export function portalRoutes(env: Env) {
  const router = Router();
  router.use(authenticate(env));

  router.get('/summary', async (req, res, next) => {
    try {
      const organisationId = requireOrganisation(req);
      const [
        organisation,
        openEngagements,
        openFindings,
        reports,
        tickets,
        severity,
        recentEngagements,
        recentTickets,
      ] = await Promise.all([
        Organisation.findOne({ _id: organisationId, deletedAt: null }).select('name').lean(),
        Engagement.countDocuments({
          organisationId,
          status: { $in: ['planned', 'active', 'paused'] },
          deletedAt: null,
        }),
        Finding.countDocuments({
          organisationId,
          status: { $in: ['open', 'accepted', 'in_progress'] },
          deletedAt: null,
        }),
        Report.countDocuments({ organisationId, status: 'published', deletedAt: null }),
        SupportTicket.countDocuments({
          organisationId,
          status: { $nin: ['resolved', 'closed'] },
          deletedAt: null,
        }),
        Finding.aggregate<{ _id: string; count: number }>([
          {
            $match: {
              organisationId: new Types.ObjectId(organisationId),
              status: { $in: ['open', 'accepted', 'in_progress'] },
              deletedAt: null,
            },
          },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
        ]),
        Engagement.find({ organisationId, deletedAt: null })
          .select('title status updatedAt sampleData')
          .sort({ updatedAt: -1 })
          .limit(3)
          .lean(),
        SupportTicket.find({ organisationId, deletedAt: null })
          .select('title status updatedAt sampleData')
          .sort({ updatedAt: -1 })
          .limit(3)
          .lean(),
      ]);
      if (!organisation)
        throw new HttpError(
          404,
          'ORGANISATION_NOT_FOUND',
          'The authorised organisation was not found.',
        );
      const severityMap = Object.fromEntries(severity.map((item) => [item._id, item.count]));
      const severityInfo: Array<[string, string]> = [
        ['Critical', '#fb7185'],
        ['High', '#fb923c'],
        ['Medium', '#facc15'],
        ['Low', '#38bdf8'],
      ];
      const severityData = severityInfo.map(([name, color]) => ({
        name,
        color,
        value: Number(severityMap[name.toLowerCase()] ?? 0),
      }));
      const recent = [
        ...recentEngagements.map((item) => ({
          id: String(item._id),
          type: 'Engagement',
          title: item.title,
          date: item.updatedAt,
          status: item.status,
        })),
        ...recentTickets.map((item) => ({
          id: String(item._id),
          type: 'Ticket',
          title: item.title,
          date: item.updatedAt,
          status: item.status,
        })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      res.json({
        ok: true,
        data: {
          sampleData: [...recentEngagements, ...recentTickets].some((item) => item.sampleData),
          organisation: { name: organisation.name },
          counts: { openEngagements, openFindings, reports, tickets },
          severity: severityData,
          recent,
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/engagements', listScoped(Engagement, 'title status summary updatedAt sampleData'));
  router.get(
    '/assessments',
    listScoped(Engagement, 'title status summary updatedAt sampleData', {
      status: { $ne: 'cancelled' },
    }),
  );
  router.get(
    '/reports',
    listScoped(Report, 'title status version publishedAt updatedAt sampleData'),
  );
  router.get('/tickets', listScoped(SupportTicket, 'title status priority updatedAt sampleData'));
  router.post(
    '/tickets',
    csrfProtection(),
    validateBody(supportTicketSchema),
    async (req, res, next) => {
      try {
        const organisationId = requireOrganisation(req);
        const existing = await SupportTicket.findOne({
          organisationId,
          idempotencyKey: req.body.idempotencyKey,
          deletedAt: null,
        })
          .select('reference status')
          .lean();
        if (existing)
          return res.json({
            ok: true,
            data: { reference: existing.reference, status: existing.status, duplicate: true },
            requestId: req.requestId,
          });
        const ticketReference = reference('TKT');
        const ticket = await SupportTicket.create({
          organisationId,
          reference: ticketReference,
          idempotencyKey: req.body.idempotencyKey,
          title: req.body.title,
          status: 'open',
          priority: req.body.priority,
          createdBy: req.auth!.id,
        });
        try {
          await TicketMessage.create({
            ticketId: ticket._id,
            organisationId,
            authorId: req.auth!.id,
            body: req.body.message,
            internal: false,
          });
        } catch (error) {
          await SupportTicket.deleteOne({ _id: ticket._id });
          throw error;
        }
        await writeAudit({
          actorId: req.auth!.id,
          organisationId,
          action: 'ticket.create',
          targetType: 'SupportTicket',
          targetId: String(ticket._id),
          outcome: 'success',
          requestId: req.requestId,
          ipHash: safeIpHash(req.ip, env.IP_HASH_SECRET),
        });
        return res.status(201).json({
          ok: true,
          data: { reference: ticketReference, status: 'open' },
          requestId: req.requestId,
        });
      } catch (error) {
        next(error);
      }
    },
  );
  router.get('/notifications', async (req, res, next) => {
    try {
      const organisationId = requireOrganisation(req);
      const items = await Notification.find({
        userId: req.auth!.id,
        $or: [{ organisationId }, { organisationId: null }],
      })
        .select('title body readAt updatedAt')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      res.json({
        ok: true,
        data: { sampleData: false, items: items.map(itemToResponse) },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });
  router.get('/settings', async (req, res, next) => {
    try {
      const organisationId = requireOrganisation(req);
      const org = await Organisation.findOne({ _id: organisationId, deletedAt: null })
        .select('name industry dataRegion status updatedAt')
        .lean();
      res.json({
        ok: true,
        data: {
          sampleData: false,
          items: org
            ? [
                {
                  id: String(org._id),
                  title: org.name,
                  summary: `${org.industry ?? 'Industry not supplied'} · ${org.dataRegion ?? 'Data region not supplied'}`,
                  status: org.status,
                  updatedAt: org.updatedAt,
                },
              ]
            : [],
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });
  router.get('/audit', async (req, res, next) => {
    try {
      const organisationId = requireOrganisation(req);
      const events = await AuditLog.find({ organisationId })
        .select('action targetType outcome createdAt')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      res.json({
        ok: true,
        data: {
          sampleData: false,
          items: events.map((event) => ({
            id: String(event._id),
            title: event.action,
            summary: `${event.targetType} · ${event.outcome}`,
            updatedAt: event.createdAt,
          })),
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/reports/:id', async (req, res, next) => {
    try {
      const organisationId = requireOrganisation(req);
      const report = await Report.findOne({
        _id: req.params.id,
        organisationId,
        status: 'published',
        deletedAt: null,
      })
        .select('title version sha256 mimeType size publishedAt')
        .lean();
      if (!report) throw new HttpError(404, 'REPORT_NOT_FOUND', 'The report was not found.');
      res.json({
        ok: true,
        data: {
          id: String(report._id),
          title: report.title,
          version: report.version,
          sha256: report.sha256,
          mimeType: report.mimeType,
          size: report.size,
          publishedAt: report.publishedAt,
          download: null,
          message: 'Secure object-storage delivery is not configured.',
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });
  return router;
}

function listScoped<T>(
  Model: import('mongoose').Model<T>,
  selection: string,
  extra: Record<string, unknown> = {},
) {
  return async (
    req: import('express').Request,
    res: import('express').Response,
    next: import('express').NextFunction,
  ) => {
    try {
      const organisationId = requireOrganisation(req);
      const records = await Model.find({ organisationId, deletedAt: null, ...extra })
        .select(selection)
        .sort({ updatedAt: -1 })
        .limit(100)
        .lean();
      const items = records.map(itemToResponse);
      res.json({
        ok: true,
        data: {
          sampleData: records.some((record) =>
            Boolean((record as Record<string, unknown>).sampleData),
          ),
          items,
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  };
}
function itemToResponse(item: unknown) {
  const row = item as Record<string, unknown>;
  return {
    id: String(row._id),
    title: row.title ?? 'Record',
    summary: row.summary ?? row.body ?? row.status ?? '',
    status: row.status,
    updatedAt: row.updatedAt ?? row.publishedAt,
    version: row.version,
    priority: row.priority,
  };
}
