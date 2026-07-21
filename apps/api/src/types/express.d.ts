import type { SessionUser } from '../middleware/auth.js';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: SessionUser;
      sessionId?: string;
    }
  }
}

export {};
