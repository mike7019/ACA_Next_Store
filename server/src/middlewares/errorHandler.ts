import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client.ts';
import { AppError } from '../utils/AppError.ts';

function renderError(res: Response, status: number, message: string) {
  res.status(status).render('error', { title: `Error ${status}`, status, message });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return renderError(res, err.status, err.message);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return renderError(res, 409, 'Ya existe un registro con ese valor unico.');
    if (err.code === 'P2025') return renderError(res, 404, 'Registro no encontrado.');
  }

  console.error(err);
  return renderError(res, 500, 'Ocurrio un error inesperado.');
}

export function notFoundHandler(req: Request, res: Response) {
  renderError(res, 404, 'Pagina no encontrada.');
}
