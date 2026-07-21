import { Router } from 'express';
import {
  assessmentSchema,
  contactSchema,
  incidentSchema,
  vulnerabilitySchema,
} from '@platform/shared';
import type { Logger } from 'pino';
import type { Env } from '../config/env.js';
import { HttpError } from '../lib/errors.js';
import { reference, safeIpHash } from '../lib/security.js';
import { validateBody } from '../middleware/validation.js';
import {
  AssessmentRequest,
  ContactSubmission,
  IncidentRequest,
  Lead,
  VulnerabilityReport,
} from '../models/index.js';
import type { EmailProvider } from '../services/email.js';

type FormKind = 'contact' | 'assessment' | 'incident' | 'vulnerability';
const models = {
  contact: ContactSubmission,
  assessment: AssessmentRequest,
  incident: IncidentRequest,
  vulnerability: VulnerabilityReport,
};
const prefixes = { contact: 'CON', assessment: 'ASM', incident: 'INC', vulnerability: 'VUL' };

export function formRoutes(env: Env, email: EmailProvider, logger: Logger) {
  const router = Router();
  router.post('/contact', validateBody(contactSchema), submit('contact'));
  router.post('/assessment', validateBody(assessmentSchema), submit('assessment'));
  router.post('/incident', validateBody(incidentSchema), submit('incident'));
  router.post('/vulnerability', validateBody(vulnerabilitySchema), submit('vulnerability'));

  function submit(kind: FormKind) {
    return async (
      req: import('express').Request,
      res: import('express').Response,
      next: import('express').NextFunction,
    ) => {
      try {
        if (req.body.website)
          return res.status(202).json({
            ok: true,
            data: { reference: reference('REC'), status: 'received' },
            requestId: req.requestId,
          });
        const bodyKey = String(req.body.idempotencyKey);
        const headerKey = req.get('Idempotency-Key');
        if (headerKey && headerKey !== bodyKey)
          throw new HttpError(
            400,
            'IDEMPOTENCY_MISMATCH',
            'The idempotency key does not match the request.',
          );
        const Model = models[kind] as unknown as import('mongoose').Model<Record<string, unknown>>;
        const existing = await Model.findOne({ idempotencyKey: bodyKey })
          .select('reference status')
          .lean();
        if (existing)
          return res.status(200).json({
            ok: true,
            data: { reference: existing.reference, status: existing.status, duplicate: true },
            requestId: req.requestId,
          });

        const recordReference = reference(prefixes[kind]);
        const retentionExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        const common = {
          reference: recordReference,
          idempotencyKey: bodyKey,
          name: req.body.name,
          email: req.body.workEmail ?? req.body.email,
          organisation: req.body.organisation,
          status: 'received',
          ipHash: safeIpHash(req.ip, env.IP_HASH_SECRET),
          retentionExpiresAt,
        };
        const payload = { ...req.body, ...common };
        delete payload.workEmail;
        delete payload.consent;
        delete payload.disclosureAgreement;
        delete payload.website;
        const record = await Model.create(payload);
        await Lead.create({
          reference: recordReference,
          type: kind,
          name: common.name,
          email: common.email,
          organisation: common.organisation,
          sourceId: record._id,
          retentionExpiresAt,
        });
        const userSubject =
          kind === 'incident'
            ? `Incident request received: ${recordReference}`
            : `Request received: ${recordReference}`;
        void Promise.all([
          email.send({
            to: common.email,
            subject: userSubject,
            text: `We received your ${kind} request. Reference: ${recordReference}. This acknowledgement does not create an engagement or emergency response commitment.`,
          }),
          email.send({
            to: env.ADMIN_NOTIFICATION_EMAIL,
            subject: `New ${kind} request: ${recordReference}`,
            text: `A new ${kind} request is ready for authorised review. Open the admin portal; sensitive request contents are not included in this email.`,
            replyTo: common.email,
          }),
        ]).catch((error) =>
          logger.error(
            { err: error, reference: recordReference },
            'Transactional email delivery failed',
          ),
        );
        return res.status(201).json({
          ok: true,
          data: { reference: recordReference, status: 'received', confirmation: 'queued' },
          requestId: req.requestId,
        });
      } catch (error) {
        next(error);
      }
    };
  }
  return router;
}
