import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { containsUnsafeMongoKey, normalizeObject } from '../lib/security.js';
import { HttpError } from '../lib/errors.js';

export function rejectUnsafeKeys(req: Request, _res: Response, next: NextFunction) {
  if (
    containsUnsafeMongoKey(req.body) ||
    containsUnsafeMongoKey(req.query) ||
    containsUnsafeMongoKey(req.params)
  )
    return next(
      new HttpError(400, 'UNSAFE_INPUT', 'The request contains unsupported field names.'),
    );
  req.body = normalizeObject(req.body);
  next();
}

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(result.error);
    req.body = result.data;
    next();
  };
}
