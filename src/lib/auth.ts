import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

export const SESSION_COOKIE = 'admin_session';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

interface SessionPayload {
  adminId: number;
  email: string;
  nombre: string;
  exp: number;
}

function getSecret(): string {
  const secret = import.meta.env.SESSION_SECRET;
  if (!secret) throw new Error('Falta la variable de entorno SESSION_SECRET');
  return secret;
}

function sign(data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const full: SessionPayload = { ...payload, exp: Date.now() + SESSION_DURATION_MS };
  const data = Buffer.from(JSON.stringify(full)).toString('base64url');
  return `${data}.${sign(data)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;
  if (!timingSafeEqual(signature, sign(data))) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8')) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
