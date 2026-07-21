import { Router } from 'express';
import { careerApplicationSchema, newsletterSchema } from '@platform/shared';
import type { Logger } from 'pino';
import type { Env } from '../config/env.js';
import { reference, safeIpHash } from '../lib/security.js';
import { validateBody } from '../middleware/validation.js';
import {
  Application,
  CareerOpening,
  CaseStudy,
  NewsletterSubscriber,
  Resource,
} from '../models/index.js';
import type { EmailProvider } from '../services/email.js';

export function publicRoutes(env: Env, email: EmailProvider, logger: Logger) {
  const router = Router();
  router.get('/resources', async (_req, res, next) => {
    try {
      const items = await Resource.find({
        status: 'published',
        deletedAt: null,
        publishedAt: { $lte: new Date() },
      })
        .select('slug title summary publishedAt')
        .sort({ publishedAt: -1 })
        .limit(100)
        .lean();
      res.json({
        ok: true,
        data: {
          items: items.map((item) => ({
            id: String(item._id),
            title: item.title,
            slug: item.slug,
            summary: item.summary,
            publishedAt: item.publishedAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  });
  router.get('/careers', async (_req, res, next) => {
    try {
      const items = await CareerOpening.find({
        status: 'open',
        deletedAt: null,
        $or: [{ closesAt: null }, { closesAt: { $gt: new Date() } }],
      })
        .select('slug title location workMode description closesAt publishedAt')
        .sort({ publishedAt: -1 })
        .lean();
      res.json({
        ok: true,
        data: {
          items: items.map((item) => ({
            id: String(item._id),
            title: item.title,
            slug: item.slug,
            location: item.location,
            workMode: item.workMode,
            description: item.description,
            closesAt: item.closesAt,
            publishedAt: item.publishedAt,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  });
  router.get('/case-studies', async (_req, res, next) => {
    try {
      const items = await CaseStudy.find({
        status: 'published',
        permissionVerifiedAt: { $ne: null },
        deletedAt: null,
      })
        .select('slug title clientDisplayName problem engagement outcome metrics publishedAt')
        .sort({ publishedAt: -1 })
        .lean();
      res.json({ ok: true, data: { items } });
    } catch (error) {
      next(error);
    }
  });

  router.post('/newsletter', validateBody(newsletterSchema), async (req, res, next) => {
    try {
      if (req.body.website)
        return res
          .status(202)
          .json({ ok: true, data: { status: 'pending' }, requestId: req.requestId });
      const existing = await NewsletterSubscriber.findOne({
        $or: [{ email: req.body.email }, { idempotencyKey: req.body.idempotencyKey }],
        deletedAt: null,
      }).lean();
      if (!existing) {
        await NewsletterSubscriber.create({
          email: req.body.email,
          idempotencyKey: req.body.idempotencyKey,
          status: 'pending',
          consentAt: new Date(),
        });
        void Promise.all([
          email.send({
            to: req.body.email,
            subject: 'Confirm your security insights subscription',
            text: 'Your subscription request was received. Double opt-in confirmation must be connected to the production email provider before launch.',
          }),
          email.send({
            to: env.ADMIN_NOTIFICATION_EMAIL,
            subject: 'New newsletter subscription request',
            text: 'A pending newsletter subscription is ready for authorised review. The address is available only in the protected administration workflow.',
          }),
        ]).catch((error) => logger.error({ err: error }, 'Newsletter notification failed'));
      }
      res
        .status(existing ? 200 : 201)
        .json({ ok: true, data: { status: 'pending' }, requestId: req.requestId });
    } catch (error) {
      next(error);
    }
  });

  router.post('/career', validateBody(careerApplicationSchema), async (req, res, next) => {
    try {
      if (req.body.website)
        return res.status(202).json({
          ok: true,
          data: { reference: reference('APP'), status: 'received' },
          requestId: req.requestId,
        });
      const opening = await CareerOpening.findOne({
        _id: req.body.roleId,
        status: 'open',
        deletedAt: null,
        $or: [{ closesAt: null }, { closesAt: { $gt: new Date() } }],
      }).lean();
      if (!opening)
        return res.status(404).json({
          ok: false,
          error: { code: 'ROLE_NOT_OPEN', message: 'That role is not open for applications.' },
          requestId: req.requestId,
        });
      const existing = await Application.findOne({ idempotencyKey: req.body.idempotencyKey })
        .select('reference status')
        .lean();
      if (existing)
        return res.json({
          ok: true,
          data: { reference: existing.reference, status: existing.status, duplicate: true },
          requestId: req.requestId,
        });
      const applicationReference = reference('APP');
      await Application.create({
        reference: applicationReference,
        careerOpeningId: opening._id,
        name: req.body.name,
        email: req.body.email,
        portfolioUrl: req.body.portfolioUrl,
        coverNote: req.body.coverNote,
        idempotencyKey: req.body.idempotencyKey,
        status: 'received',
        retentionExpiresAt: new Date(Date.now() + 180 * 24 * 60 * 60_000),
        ipHash: safeIpHash(req.ip, env.IP_HASH_SECRET),
      });
      void Promise.all([
        email.send({
          to: req.body.email,
          subject: `Application received: ${applicationReference}`,
          text: `Your application was accepted by the server. Reference: ${applicationReference}.`,
        }),
        email.send({
          to: env.ADMIN_NOTIFICATION_EMAIL,
          subject: `New career application: ${applicationReference}`,
          text: `A new application is ready for authorised review. Reference: ${applicationReference}. Personal data and the cover note are not included in this email.`,
        }),
      ]).catch((error) => logger.error({ err: error }, 'Application confirmation failed'));
      res.status(201).json({
        ok: true,
        data: { reference: applicationReference, status: 'received' },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
