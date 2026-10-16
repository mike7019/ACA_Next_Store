import type { Request, Response } from 'express';
import * as productoModel from '../models/producto.model.ts';
import * as categoriaModel from '../models/categoria.model.ts';
import { slugify } from '../utils/format.ts';
import { AppError } from '../utils/AppError.ts';
import { Prisma } from '../generated/prisma/client.ts';

export async function list(req: Request, res: Response) {
  const categoriaSlug = String(req.query.categoria ?? '');
  const buscar = String(req.query.buscar ?? '').trim();

  let categoriaId: number | undefined;
  if (categoriaSlug) {
    const categoria = await categoriaModel.findBySlug(categoriaSlug);
    categoriaId = categoria?.id;
  }

  const productos = await productoModel.findAll({ soloActivos: true, categoriaId, buscar: buscar || undefined });
  res.json(productos);
}

export async function listAdmin(req: Request, res: Response) {
  const buscar = String(req.query.buscar ?? '').trim();
  res.json(await productoModel.findAllAdmin(buscar || undefined));
}

export async function destacados(req: Request, res: Response) {
  res.json(await productoModel.findDestacados());
}

export async function detalle(req: Request, res: Response) {
  const producto = await productoModel.findBySlug(req.params.slug);
  if (!producto || !producto.activo) {
    throw new AppError(404, 'Producto no encontrado.');
  }

  const relacionados = await productoModel.findRelacionados(producto.categoriaId, producto.id);
  res.json({ producto, relacionados });
}

export async function detalleAdmin(req: Request, res: Response) {
  const producto = await productoModel.findById(Number(req.params.id));
  if (!producto) {
    throw new AppError(404, 'Producto no encontrado.');
  }
  res.json(producto);
}

function parseProductoInput(body: Record<string, unknown>) {
  const nombre = String(body.nombre ?? '').trim();
  const categoriaId = Number(body.categoriaId);
  const descripcion = String(body.descripcion ?? '').trim();
  const marca = String(body.marca ?? '').trim();
  const sabor = String(body.sabor ?? '').trim();
  const presentacion = String(body.presentacion ?? '').trim();
  const precio = Number(body.precio);
  const stock = Number(body.stock);
  const imagenUrl = String(body.imagenUrl ?? '').trim();
  const destacado = Boolean(body.destacado);
  const activo = body.activo === undefined ? true : Boolean(body.activo);

  if (!nombre || !categoriaId || Number.isNaN(precio) || precio < 0) {
    throw new AppError(400, 'Revisa el nombre, la categoria y el precio.');
  }

  return {
    nombre,
    categoriaId,
    descripcion: descripcion || null,
    marca: marca || null,
    sabor: sabor || null,
    presentacion: presentacion || null,
    precio,
    stock: Number.isNaN(stock) ? 0 : stock,
    imagenUrl: imagenUrl || null,
    destacado,
    activo,
  };
}

export async function create(req: Request, res: Response) {
  const data = parseProductoInput(req.body ?? {});

  let slug = slugify(data.nombre);
  const existente = await productoModel.findBySlug(slug);
  if (existente) slug = `${slug}-${Date.now().toString(36)}`;

  const producto = await productoModel.create({ ...data, slug });
  res.status(201).json(producto);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const existente = await productoModel.findById(id);
  if (!existente) {
    throw new AppError(404, 'Producto no encontrado.');
  }

  const data = parseProductoInput(req.body ?? {});
  const producto = await productoModel.update(id, { ...data, slug: existente.slug });
  res.json(producto);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await productoModel.remove(id);
    res.status(204).end();
  } catch (err) {
    // El producto ya tiene pedidos asociados (ON DELETE RESTRICT): lo desactivamos en vez de borrarlo.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      const producto = await productoModel.deactivate(id);
      return res.json(producto);
    }
    throw err;
  }
}
