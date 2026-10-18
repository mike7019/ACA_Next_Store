import type { Request, Response } from 'express';
import * as productoModel from '../models/producto.model.ts';
import * as categoriaModel from '../models/categoria.model.ts';
import { AppError } from '../utils/AppError.ts';

export async function index(req: Request, res: Response) {
  const categoriaSlug = String(req.query.categoria ?? '');
  const buscar = String(req.query.buscar ?? '').trim();

  const categorias = await categoriaModel.findAll();
  const categoriaActiva = categorias.find((c) => c.slug === categoriaSlug) ?? null;

  const productos = await productoModel.findAll({
    soloActivos: true,
    // Si el slug no existe no filtramos por categoria, igual que antes.
    categoriaId: categoriaActiva?.id,
    buscar: buscar || undefined,
  });

  res.render('productos/index', {
    title: categoriaActiva ? categoriaActiva.nombre : 'Todos los productos',
    categorias,
    categoriaActiva,
    productos,
    buscar,
  });
}

export async function show(req: Request, res: Response) {
  const producto = await productoModel.findBySlug(req.params.slug);
  if (!producto || !producto.activo) {
    throw new AppError(404, 'Producto no encontrado.');
  }

  const relacionados = await productoModel.findRelacionados(producto.categoriaId, producto.id);
  res.render('productos/show', { title: producto.nombre, producto, relacionados });
}
