import type { Request, Response } from 'express';
import { isProd } from '../../config/env.ts';
import * as adminModel from '../../models/admin.model.ts';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, verifySessionToken } from '../../utils/jwt.ts';
import { verifyPassword } from '../../utils/password.ts';

export function loginForm(req: Request, res: Response) {
  if (verifySessionToken(req.cookies?.[SESSION_COOKIE])) {
    return res.redirect('/admin');
  }
  res.render('admin/login', { title: 'Ingresar', error: null, email: '' });
}

export async function login(req: Request, res: Response) {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  const admin = await adminModel.findByEmail(email);
  const valido = admin ? await verifyPassword(password, admin.passwordHash) : false;

  if (!admin || !valido) {
    return res.status(401).render('admin/login', {
      title: 'Ingresar',
      error: 'Correo o contrasena incorrectos.',
      email,
    });
  }

  const token = createSessionToken({ adminId: admin.id, email: admin.email, nombre: admin.nombre });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS * 1000,
  });

  res.redirect('/admin');
}

export function logout(req: Request, res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.redirect('/admin/login');
}
