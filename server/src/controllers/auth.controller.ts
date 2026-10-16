import type { Request, Response } from 'express';
import { isProd } from '../config/env.ts';
import * as adminModel from '../models/admin.model.ts';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '../utils/jwt.ts';
import { verifyPassword } from '../utils/password.ts';

export async function login(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  const admin = await adminModel.findByEmail(email);
  const valido = admin ? await verifyPassword(password, admin.passwordHash) : false;

  if (!admin || !valido) {
    return res.status(401).json({ error: 'Correo o contrasena incorrectos.' });
  }

  const token = createSessionToken({ adminId: admin.id, email: admin.email, nombre: admin.nombre });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS * 1000,
  });

  return res.json({ admin: { id: admin.id, email: admin.email, nombre: admin.nombre } });
}

export function logout(req: Request, res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  return res.status(204).end();
}

export function me(req: Request, res: Response) {
  if (!req.admin) {
    return res.status(401).json({ error: 'No autenticado.' });
  }
  return res.json({ admin: { id: req.admin.adminId, email: req.admin.email, nombre: req.admin.nombre } });
}
