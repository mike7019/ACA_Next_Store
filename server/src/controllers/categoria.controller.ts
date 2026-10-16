import type { Request, Response } from 'express';
import * as categoriaModel from '../models/categoria.model.ts';
import { slugify } from '../utils/format.ts';
import { AppError } from '../utils/AppError.ts';
import { Prisma } from '../generated/prisma/client.ts';

export async function list(req: Request, res: Response) {
  res.json(await categoriaModel.findAll());
}

export async function listAdmin(req: Request, res: Response) {
  res.json(await categoriaModel.findAllWithProductCount());
}

export async function create(req: Request, res: Response) {
  const nombre = String(req.body?.nombre ?? '').trim();
  const descripcion = String(req.body?.descripcion ?? '').trim();

  if (!nombre) {
    throw new AppError(400, 'El nombre es obligatorio.');
  }

  let slug = slugify(nombre);
  const existente = await categoriaModel.findBySlug(slug);
  if (existente) slug = `${slug}-${Date.now().toString(36)}`;

  try {
    const categoria = await categoriaModel.create({ nombre, slug, descripcion: descripcion || null });
    res.status(201).json(categoria);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe una categoria con ese nombre.');
    }
    throw err;
  }
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const nombre = String(req.body?.nombre ?? '').trim();
  const descripcion = String(req.body?.descripcion ?? '').trim();

  if (!nombre) {
    throw new AppError(400, 'El nombre es obligatorio.');
  }

  try {
    const categoria = await categoriaModel.update(id, { nombre, descripcion: descripcion || null });
    res.json(categoria);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe una categoria con ese nombre.');
    }
    throw err;
  }
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await categoriaModel.remove(id);
    res.status(204).end();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new AppError(409, 'No se puede eliminar: esta categoria todavia tiene productos asociados.');
    }
    throw err;
  }
}
