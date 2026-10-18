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
  const session = verifySessionToken(req.cookies?.[SESSION_COOKIE]);

  if (!session) {
    return res.redirect('/admin/login');
  }

  req.admin = session;
  res.locals.admin = session;
  res.locals.currentPath = req.baseUrl + req.path;
  next();
}
