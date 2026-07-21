import { Router } from 'express';
import argon2 from 'argon2';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from '@platform/shared';
import type { Logger } from 'pino';
import type { Env } from '../config/env.js';
import { HttpError } from '../lib/errors.js';
import { randomToken, safeIpHash, sha256 } from '../lib/security.js';
import {
  authenticate,
  csrfCookieOptions,
  csrfProtection,
  refreshCookieOptions,
  sessionCookieOptions,
} from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { RefreshSession, User } from '../models/index.js';
import { writeAudit } from '../services/audit.js';
import type { EmailProvider } from '../services/email.js';

const genericLoginError = new HttpError(
  401,
  'INVALID_CREDENTIALS',
  'The email or password is incorrect.',
);

export function authRoutes(env: Env, email: EmailProvider, logger: Logger) {
  const router = Router();

  router.get('/session', authenticate(env, true), (req, res) =>
    res.json({ ok: true, data: { user: req.auth ?? null }, requestId: req.requestId }),
  );

  router.post('/login', validateBody(loginSchema), async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email, deletedAt: null })
        .select('+passwordHash +failedLoginCount +lockedUntil')
        .lean();
      const valid = user?.passwordHash
        ? await argon2.verify(user.passwordHash, req.body.password).catch(() => false)
        : await dummyVerify(req.body.password);
      if (
        !user ||
        !valid ||
        user.status !== 'active' ||
        (user.lockedUntil && user.lockedUntil > new Date())
      ) {
        if (user && user.status === 'active') {
          const failures = Number(user.failedLoginCount ?? 0) + 1;
          const delayMinutes = failures >= 8 ? 60 : failures >= 5 ? 15 : 0;
          await User.updateOne(
            { _id: user._id },
            {
              $set: {
                failedLoginCount: failures,
                ...(delayMinutes
                  ? { lockedUntil: new Date(Date.now() + delayMinutes * 60_000) }
                  : {}),
              },
            },
          );
        }
        await writeAudit({
          actorId: user ? String(user._id) : undefined,
          action: 'auth.login',
          targetType: 'User',
          targetId: user ? String(user._id) : undefined,
          outcome: 'failure',
          requestId: req.requestId,
          ipHash: safeIpHash(req.ip, env.IP_HASH_SECRET),
        });
        throw genericLoginError;
      }
      await User.updateOne(
        { _id: user._id },
        { $set: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } },
      );
      const issued = await issueSession(env, req, String(user._id));
      setSessionCookies(env, res, issued);
      await writeAudit({
        actorId: String(user._id),
        organisationId: user.organisationId ? String(user.organisationId) : undefined,
        action: 'auth.login',
        targetType: 'User',
        targetId: String(user._id),
        outcome: 'success',
        requestId: req.requestId,
        ipHash: safeIpHash(req.ip, env.IP_HASH_SECRET),
      });
      res.json({
        ok: true,
        data: {
          user: {
            id: String(user._id),
            name: user.name,
            email: user.email,
            roles: user.roleKeys,
            ...(user.organisationId ? { organisationId: String(user.organisationId) } : {}),
          },
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/refresh', async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.[`${env.SESSION_COOKIE_NAME}_refresh`] as
        string | undefined;
      if (!refreshToken)
        throw new HttpError(401, 'SESSION_INVALID', 'The session has expired or was revoked.');
      const previous = await RefreshSession.findOne({
        tokenHash: sha256(refreshToken),
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      })
        .select('+tokenHash')
        .lean();
      if (!previous)
        throw new HttpError(401, 'SESSION_INVALID', 'The session has expired or was revoked.');
      await RefreshSession.updateOne(
        { _id: previous._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      const issued = await issueSession(env, req, String(previous.userId), String(previous._id));
      setSessionCookies(env, res, issued);
      res.json({ ok: true, data: { refreshed: true }, requestId: req.requestId });
    } catch (error) {
      clearSessionCookies(env, res);
      next(error);
    }
  });

  router.post('/logout', authenticate(env), csrfProtection(), async (req, res, next) => {
    try {
      await RefreshSession.updateOne({ _id: req.sessionId }, { $set: { revokedAt: new Date() } });
      clearSessionCookies(env, res);
      await writeAudit({
        actorId: req.auth!.id,
        organisationId: req.auth!.organisationId,
        action: 'auth.logout',
        targetType: 'RefreshSession',
        targetId: req.sessionId,
        outcome: 'success',
        requestId: req.requestId,
      });
      res.json({ ok: true, data: { loggedOut: true }, requestId: req.requestId });
    } catch (error) {
      next(error);
    }
  });

  router.post('/logout-all', authenticate(env), csrfProtection(), async (req, res, next) => {
    try {
      await RefreshSession.updateMany(
        { userId: req.auth!.id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      clearSessionCookies(env, res);
      await writeAudit({
        actorId: req.auth!.id,
        organisationId: req.auth!.organisationId,
        action: 'auth.logout_all',
        targetType: 'User',
        targetId: req.auth!.id,
        outcome: 'success',
        requestId: req.requestId,
      });
      res.json({ ok: true, data: { loggedOut: true }, requestId: req.requestId });
    } catch (error) {
      next(error);
    }
  });

  router.get('/sessions', authenticate(env), async (req, res, next) => {
    try {
      const sessions = await RefreshSession.find({
        userId: req.auth!.id,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
      })
        .select('userAgent createdAt lastSeenAt')
        .sort({ lastSeenAt: -1 })
        .lean();
      res.json({
        ok: true,
        data: {
          sessions: sessions.map((session) => ({
            id: String(session._id),
            current: String(session._id) === req.sessionId,
            userAgent: session.userAgent ?? 'Unknown device',
            createdAt: session.createdAt,
            lastSeenAt: session.lastSeenAt,
          })),
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/sessions/:id', authenticate(env), csrfProtection(), async (req, res, next) => {
    try {
      if (req.get('X-Confirm-Action') !== 'revoke-session')
        throw new HttpError(400, 'CONFIRMATION_REQUIRED', 'Explicit confirmation is required.');
      if (req.params.id === req.sessionId)
        throw new HttpError(409, 'CURRENT_SESSION', 'Use sign out to revoke the current session.');
      const result = await RefreshSession.updateOne(
        { _id: req.params.id, userId: req.auth!.id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      if (!result.modifiedCount)
        throw new HttpError(404, 'NOT_FOUND', 'That session was not found.');
      await writeAudit({
        actorId: req.auth!.id,
        organisationId: req.auth!.organisationId,
        action: 'auth.session_revoke',
        targetType: 'RefreshSession',
        targetId: String(req.params.id),
        outcome: 'success',
        requestId: req.requestId,
      });
      res.json({ ok: true, data: { revoked: true }, requestId: req.requestId });
    } catch (error) {
      next(error);
    }
  });

  router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email, status: 'active', deletedAt: null });
      if (user) {
        const token = randomToken(40);
        user.resetTokenHash = sha256(token);
        user.resetExpiresAt = new Date(Date.now() + 30 * 60_000);
        await user.save();
        void email
          .send({
            to: user.email,
            subject: 'Portal password reset',
            text: `A password reset was requested. The link expires in 30 minutes: ${env.PUBLIC_URL}/portal/reset-password?token=${encodeURIComponent(token)}. If this was not you, no action is needed.`,
          })
          .catch((error) => logger.error({ err: error, userId: user.id }, 'Reset email failed'));
      }
      res.status(202).json({
        ok: true,
        data: {
          message: 'If an eligible account exists, a time-limited reset link will be sent.',
        },
        requestId: req.requestId,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next) => {
    try {
      const user = await User.findOne({
        resetTokenHash: sha256(req.body.token),
        resetExpiresAt: { $gt: new Date() },
        status: 'active',
        deletedAt: null,
      }).select('+resetTokenHash +resetExpiresAt');
      if (!user)
        throw new HttpError(400, 'RESET_INVALID', 'The reset link is invalid or has expired.');
      user.passwordHash = await argon2.hash(req.body.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 1,
      });
      user.passwordChangedAt = new Date();
      user.resetTokenHash = undefined;
      user.resetExpiresAt = undefined;
      await user.save();
      await RefreshSession.updateMany(
        { userId: user._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      await writeAudit({
        actorId: user.id,
        organisationId: user.organisationId ? String(user.organisationId) : undefined,
        action: 'auth.password_reset',
        targetType: 'User',
        targetId: user.id,
        outcome: 'success',
        requestId: req.requestId,
      });
      res.json({ ok: true, data: { reset: true }, requestId: req.requestId });
    } catch (error) {
      next(error);
    }
  });
  return router;
}

async function issueSession(
  env: Env,
  req: import('express').Request,
  userId: string,
  rotatedFrom?: string,
) {
  const access = randomToken();
  const refresh = randomToken(40);
  const csrf = randomToken(24);
  const userAgent = (req.get('user-agent') ?? 'Unknown device').slice(0, 500);
  await RefreshSession.create({
    userId,
    tokenHash: sha256(refresh),
    accessTokenHash: sha256(access),
    csrfHash: sha256(csrf),
    userAgent,
    userAgentHash: sha256(userAgent),
    ipHash: safeIpHash(req.ip, env.IP_HASH_SECRET),
    accessExpiresAt: new Date(Date.now() + env.SESSION_TTL_MINUTES * 60_000),
    expiresAt: new Date(Date.now() + env.SESSION_REFRESH_TTL_DAYS * 24 * 60 * 60_000),
    rotatedFrom,
  });
  return { access, refresh, csrf };
}
function setSessionCookies(
  env: Env,
  res: import('express').Response,
  issued: { access: string; refresh: string; csrf: string },
) {
  res.cookie(env.SESSION_COOKIE_NAME, issued.access, sessionCookieOptions(env));
  res.cookie(`${env.SESSION_COOKIE_NAME}_refresh`, issued.refresh, refreshCookieOptions(env));
  res.cookie('csrf_token', issued.csrf, csrfCookieOptions(env));
}
function clearSessionCookies(env: Env, res: import('express').Response) {
  res.clearCookie(env.SESSION_COOKIE_NAME, sessionCookieOptions(env));
  res.clearCookie(`${env.SESSION_COOKIE_NAME}_refresh`, refreshCookieOptions(env));
  res.clearCookie('csrf_token', csrfCookieOptions(env));
}
async function dummyVerify(password: string) {
  const hash =
    '$argon2id$v=19$m=65536,t=3,p=1$MDEyMzQ1Njc4OWFiY2RlZg$Z5qJFiMS1uQjdmw8h+zmZWMbQw3F3PueaOoJgFexSkE';
  await argon2.verify(hash, password).catch(() => false);
  return false;
}
