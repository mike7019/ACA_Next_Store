import type { APIRoute } from 'astro';
import { Prisma } from '../../../../generated/prisma/client.ts';
import { prisma } from '../../../../lib/prisma';

export const POST: APIRoute = async ({ params, redirect }) => {
  const id = Number(params.id);

  try {
    await prisma.producto.delete({ where: { id } });
  } catch (err) {
    // El producto ya tiene pedidos asociados (ON DELETE RESTRICT): lo desactivamos en vez de borrarlo.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      await prisma.producto.update({ where: { id }, data: { activo: false } });
    } else {
      throw err;
    }
  }

  return redirect('/admin/productos');
};
