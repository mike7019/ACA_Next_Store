import { prisma } from '../lib/prisma.ts';

export function findAll() {
  return prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
}

export function findAllWithProductCount() {
  return prisma.categoria.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { productos: true } } },
  });
}

export function findById(id: number) {
  return prisma.categoria.findUnique({ where: { id } });
}

export function findBySlug(slug: string) {
  return prisma.categoria.findUnique({ where: { slug } });
}

export function create(data: { nombre: string; slug: string; descripcion: string | null }) {
  return prisma.categoria.create({ data });
}

export function update(id: number, data: { nombre: string; descripcion: string | null }) {
  return prisma.categoria.update({ where: { id }, data });
}

export function remove(id: number) {
  return prisma.categoria.delete({ where: { id } });
}
