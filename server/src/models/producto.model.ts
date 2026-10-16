import { Prisma } from '../generated/prisma/client.ts';
import { prisma } from '../lib/prisma.ts';

export interface ProductoInput {
  nombre: string;
  slug: string;
  categoriaId: number;
  descripcion: string | null;
  marca: string | null;
  sabor: string | null;
  presentacion: string | null;
  precio: number;
  stock: number;
  imagenUrl: string | null;
  destacado: boolean;
  activo: boolean;
}

export function findAll(filtro: { categoriaId?: number; buscar?: string; soloActivos?: boolean }) {
  const where: Prisma.ProductoWhereInput = {
    ...(filtro.soloActivos ? { activo: true } : {}),
    ...(filtro.categoriaId ? { categoriaId: filtro.categoriaId } : {}),
    ...(filtro.buscar
      ? {
          OR: [
            { nombre: { contains: filtro.buscar, mode: 'insensitive' } },
            { marca: { contains: filtro.buscar, mode: 'insensitive' } },
            { descripcion: { contains: filtro.buscar, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  return prisma.producto.findMany({ where, orderBy: { nombre: 'asc' } });
}

export function findAllAdmin(buscar?: string) {
  return prisma.producto.findMany({
    where: buscar
      ? {
          OR: [
            { nombre: { contains: buscar, mode: 'insensitive' } },
            { marca: { contains: buscar, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { categoria: true },
    orderBy: { creadoEn: 'desc' },
  });
}

export function findDestacados(take = 8) {
  return prisma.producto.findMany({
    where: { activo: true, destacado: true },
    orderBy: { creadoEn: 'desc' },
    take,
  });
}

export function findBySlug(slug: string) {
  return prisma.producto.findUnique({ where: { slug }, include: { categoria: true } });
}

export function findById(id: number) {
  return prisma.producto.findUnique({ where: { id } });
}

export function findRelacionados(categoriaId: number, excludeId: number, take = 4) {
  return prisma.producto.findMany({
    where: { activo: true, categoriaId, id: { not: excludeId } },
    take,
  });
}

export function findManyByIds(ids: number[]) {
  return prisma.producto.findMany({ where: { id: { in: ids }, activo: true } });
}

export function create(data: ProductoInput) {
  return prisma.producto.create({ data });
}

export function update(id: number, data: ProductoInput) {
  return prisma.producto.update({ where: { id }, data });
}

export function remove(id: number) {
  return prisma.producto.delete({ where: { id } });
}

export function deactivate(id: number) {
  return prisma.producto.update({ where: { id }, data: { activo: false } });
}

export function countActivos() {
  return prisma.producto.count({ where: { activo: true } });
}

export function countStockBajo(umbral = 5) {
  return prisma.producto.count({ where: { activo: true, stock: { lte: umbral } } });
}
