import { prisma } from '../lib/prisma.ts';

export function findActivos() {
  return prisma.metodoEnvio.findMany({ where: { activo: true }, orderBy: { costoBase: 'asc' } });
}

export function findById(id: number) {
  return prisma.metodoEnvio.findUnique({ where: { id } });
}
