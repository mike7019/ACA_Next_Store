import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client.ts';
import { AppError } from '../utils/AppError.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un registro con ese valor unico.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro no encontrado.' });
    }
  }

  console.error(err);
  return res.status(500).json({ error: 'Ocurrio un error inesperado.' });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Ruta no encontrada.' });
}
