import type { Response } from 'express';

export interface Flash {
  type: 'success' | 'error';
  message: string;
}

export const FLASH_COOKIE = 'flash';

// Mensaje de un solo uso que sobrevive a un redirect (patron Post/Redirect/Get).
export function setFlash(res: Response, type: Flash['type'], message: string) {
  res.cookie(FLASH_COOKIE, JSON.stringify({ type, message }), {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60_000,
  });
}
