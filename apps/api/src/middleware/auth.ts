import type { NextFunction, Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import type { Env } from '../config/env.js';
import { HttpError } from '../lib/errors.js';
import { sha256 } from '../lib/security.js';
import { RefreshSession, User } from '../models/index.js';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  organisationId?: string;
};

export function sessionCookieOptions(env: Env) {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: env.SESSION_TTL_MINUTES * 60_000,
  };
}
export function csrfCookieOptions(env: Env) {
  return {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: env.SESSION_TTL_MINUTES * 60_000,
  };
}
export function refreshCookieOptions(env: Env) {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'strict' as const,
    path: '/api/auth',
    maxAge: env.SESSION_REFRESH_TTL_DAYS * 24 * 60 * 60_000,
  };
}

export function authenticate(env: Env, optional = false) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[env.SESSION_COOKIE_NAME] as string | undefined;
      if (!token) {
        if (optional) return next();
        throw new HttpError(401, 'AUTH_REQUIRED', 'Authentication is required.');
      }
      const session = await RefreshSession.findOne({
        accessTokenHash: sha256(token),
        revokedAt: null,
        accessExpiresAt: { $gt: new Date() },
        expiresAt: { $gt: new Date() },
      })
        .select('+accessTokenHash +csrfHash')
        .lean();
      if (!session) {
        if (optional) return next();
        throw new HttpError(401, 'SESSION_INVALID', 'The session has expired or was revoked.');
      }
      const user = await User.findOne({
        _id: session.userId,
        status: 'active',
        deletedAt: null,
      }).lean();
      if (!user) {
        if (optional) return next();
        throw new HttpError(401, 'SESSION_INVALID', 'The session has expired or was revoked.');
      }
      req.auth = {
        id: String(user._id),
        name: String(user.name),
        email: String(user.email),
        roles: user.roleKeys as string[],
        ...(user.organisationId ? { organisationId: String(user.organisationId) } : {}),
      };
      req.sessionId = String(session._id);
      void RefreshSession.updateOne({ _id: session._id }, { $set: { lastSeenAt: new Date() } });
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function csrfProtection() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.sessionId) throw new HttpError(401, 'AUTH_REQUIRED', 'Authentication is required.');
      const header = req.get('X-CSRF-Token') ?? '';
      const cookie = String(req.cookies?.csrf_token ?? '');
      if (
        !header ||
        !cookie ||
        header.length !== cookie.length ||
        !timingSafeEqual(Buffer.from(header), Buffer.from(cookie))
      )
        throw new HttpError(
          403,
          'CSRF_INVALID',
          'The security token is invalid. Refresh the page and try again.',
        );
      const session = await RefreshSession.findById(req.sessionId).select('+csrfHash').lean();
      if (!session || sha256(header) !== session.csrfHash)
        throw new HttpError(
          403,
          'CSRF_INVALID',
          'The security token is invalid. Refresh the page and try again.',
        );
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new HttpError(401, 'AUTH_REQUIRED', 'Authentication is required.'));
    if (!req.auth.roles.some((role) => roles.includes(role)))
      return next(
        new HttpError(403, 'FORBIDDEN', 'You are not authorised to perform this action.'),
      );
    next();
  };
}

export function requireOrganisation(req: Request): string {
  if (!req.auth?.organisationId)
    throw new HttpError(
      403,
      'ORGANISATION_REQUIRED',
      'No authorised organisation is associated with this account.',
    );
  return req.auth.organisationId;
}
