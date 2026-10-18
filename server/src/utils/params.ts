import type { Request } from 'express';
import { AppError } from './AppError.ts';

export function idParam(req: Request, name = 'id'): number {
  const id = Number(req.params[name]);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(404, 'Pagina no encontrada.');
  }
  return id;
}

// Solo permitimos volver a rutas internas (evita open redirects).
export function rutaInterna(valor: unknown, porDefecto: string): string {
  const ruta = String(valor ?? '');
  return ruta.startsWith('/') && !ruta.startsWith('//') ? ruta : porDefecto;
}
