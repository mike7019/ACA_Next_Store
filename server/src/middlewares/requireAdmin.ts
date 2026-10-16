import type { Request, Response, NextFunction } from 'express';
import { SESSION_COOKIE, verifySessionToken, type AdminTokenPayload } from '../utils/jwt.ts';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  const session = verifySessionToken(token);

  if (!session) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  req.admin = session;
  next();
}
