import type { APIRoute } from 'astro';
import { Prisma } from '../../../../generated/prisma/client.ts';
import { prisma } from '../../../../lib/prisma';

export const POST: APIRoute = async ({ params, redirect }) => {
  const id = Number(params.id);

  try {
    await prisma.categoria.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      return redirect('/admin/categorias?error=tiene-productos');
    }
    throw err;
  }

  return redirect('/admin/categorias');
};
