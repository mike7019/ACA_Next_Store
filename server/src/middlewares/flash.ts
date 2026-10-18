import type { Request, Response, NextFunction } from 'express';
import { FLASH_COOKIE, type Flash } from '../utils/flash.ts';

export function flashMiddleware(req: Request, res: Response, next: NextFunction) {
  res.locals.flash = null;

  const raw = req.signedCookies?.[FLASH_COOKIE];
  if (req.method === 'GET' && typeof raw === 'string') {
    try {
      res.locals.flash = JSON.parse(raw) as Flash;
    } catch {
      // cookie corrupta: se ignora
    }
    res.clearCookie(FLASH_COOKIE, { path: '/' });
  }

  next();
}
