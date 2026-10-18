import type { Request, Response } from 'express';
import * as categoriaModel from '../../models/categoria.model.ts';
import { slugify } from '../../utils/format.ts';
import { AppError } from '../../utils/AppError.ts';
import { setFlash } from '../../utils/flash.ts';
import { idParam } from '../../utils/params.ts';
import { Prisma } from '../../generated/prisma/client.ts';

interface CategoriaForm {
  nombre: string;
  descripcion: string;
}

function leerForm(body: Record<string, unknown>): CategoriaForm {
  return {
    nombre: String(body.nombre ?? '').trim(),
    descripcion: String(body.descripcion ?? '').trim(),
  };
}

function esDuplicado(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}

// La pantalla lista las categorias y muestra, segun `editando`, el formulario de alta o el de edicion.
async function renderLista(
  res: Response,
  opts: { editando?: { id: number; nombre: string } | null; valores?: CategoriaForm; error?: string | null; status?: number } = {},
) {
  const categorias = await categoriaModel.findAllWithProductCount();
  res.status(opts.status ?? 200).render('admin/categorias', {
    title: 'Categorias',
    categorias,
    editando: opts.editando ?? null,
    valores: opts.valores ?? { nombre: '', descripcion: '' },
    error: opts.error ?? null,
  });
}

export async function index(req: Request, res: Response) {
  await renderLista(res);
}

export async function crear(req: Request, res: Response) {
  const valores = leerForm(req.body ?? {});

  if (!valores.nombre) {
    return renderLista(res, { valores, error: 'El nombre es obligatorio.', status: 400 });
  }

  let slug = slugify(valores.nombre);
  const existente = await categoriaModel.findBySlug(slug);
  if (existente) slug = `${slug}-${Date.now().toString(36)}`;

  try {
    await categoriaModel.create({ nombre: valores.nombre, slug, descripcion: valores.descripcion || null });
  } catch (err) {
    if (esDuplicado(err)) {
      return renderLista(res, { valores, error: 'Ya existe una categoria con ese nombre.', status: 409 });
    }
    throw err;
  }

  setFlash(res, 'success', 'Categoria creada.');
  res.redirect('/admin/categorias');
}

export async function editar(req: Request, res: Response) {
  const id = idParam(req);
  const categoria = await categoriaModel.findById(id);
  if (!categoria) throw new AppError(404, 'Categoria no encontrada.');

  await renderLista(res, {
    editando: { id: categoria.id, nombre: categoria.nombre },
    valores: { nombre: categoria.nombre, descripcion: categoria.descripcion ?? '' },
  });
}

export async function actualizar(req: Request, res: Response) {
  const id = idParam(req);
  const categoria = await categoriaModel.findById(id);
  if (!categoria) throw new AppError(404, 'Categoria no encontrada.');

  const valores = leerForm(req.body ?? {});
  const editando = { id, nombre: categoria.nombre };

  if (!valores.nombre) {
    return renderLista(res, { editando, valores, error: 'El nombre es obligatorio.', status: 400 });
  }

  try {
    await categoriaModel.update(id, { nombre: valores.nombre, descripcion: valores.descripcion || null });
  } catch (err) {
    if (esDuplicado(err)) {
      return renderLista(res, { editando, valores, error: 'Ya existe una categoria con ese nombre.', status: 409 });
    }
    throw err;
  }

  setFlash(res, 'success', 'Categoria actualizada.');
  res.redirect('/admin/categorias');
}

export async function eliminar(req: Request, res: Response) {
  const id = idParam(req);

  try {
    await categoriaModel.remove(id);
    setFlash(res, 'success', 'Categoria eliminada.');
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      setFlash(res, 'error', 'No se puede eliminar: esta categoria todavia tiene productos asociados.');
    } else {
      throw err;
    }
  }

  res.redirect('/admin/categorias');
}
