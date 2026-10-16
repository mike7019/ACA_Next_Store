import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';

export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export interface AdminTokenPayload {
  adminId: number;
  email: string;
  nombre: string;
}

export function createSessionToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: SESSION_MAX_AGE_SECONDS });
}

export function verifySessionToken(token: string | undefined | null): AdminTokenPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload & jwt.JwtPayload;
  } catch {
    return null;
  }
}
