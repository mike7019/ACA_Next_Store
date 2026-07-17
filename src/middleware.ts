import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/admin')) {
    context.locals.admin = null;
    return next();
  }

  const isLoginRoute = pathname === '/admin/login';
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);

  context.locals.admin = session
    ? { id: session.adminId, email: session.email, nombre: session.nombre }
    : null;

  if (!session && !isLoginRoute) {
    return context.redirect('/admin/login');
  }

  if (session && isLoginRoute) {
    return context.redirect('/admin');
  }

  return next();
});
