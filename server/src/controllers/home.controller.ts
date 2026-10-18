import type { Request, Response } from 'express';
import * as categoriaModel from '../models/categoria.model.ts';
import * as productoModel from '../models/producto.model.ts';

export async function index(req: Request, res: Response) {
  const [categorias, destacados] = await Promise.all([categoriaModel.findAll(), productoModel.findDestacados()]);
  res.render('home', { title: 'IronFuel Suplementos', categorias, destacados });
}
