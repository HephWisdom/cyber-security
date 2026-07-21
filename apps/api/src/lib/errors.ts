import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import type { Logger } from 'pino';

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, 'NOT_FOUND', `No API route exists for ${req.method} ${req.path}.`));
}

export function errorHandler(logger: Logger, production: boolean) {
  return (error: unknown, req: Request, res: Response, next: NextFunction) => {
    void next;
    if (error instanceof ZodError) {
      const fieldErrors = error.flatten().fieldErrors as Record<string, string[]>;
      return res.status(422).json({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Check the highlighted fields.',
          fieldErrors,
        },
        requestId: req.requestId,
      });
    }
    if (error instanceof HttpError)
      return res.status(error.status).json({
        ok: false,
        error: { code: error.code, message: error.message, fieldErrors: error.details },
        requestId: req.requestId,
      });
    const databaseError = error as { code?: number };
    if (databaseError?.code === 11000)
      return res.status(409).json({
        ok: false,
        error: { code: 'DUPLICATE', message: 'This request was already recorded.' },
        requestId: req.requestId,
      });
    logger.error({ err: error, requestId: req.requestId }, 'Unhandled request error');
    return res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: production
          ? 'The request could not be completed.'
          : error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      requestId: req.requestId,
    });
  };
}
