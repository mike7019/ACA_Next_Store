import type { Request, Response, NextFunction } from 'express';
import * as categoriaModel from '../models/categoria.model.ts';
import { cartCount, readCart } from '../utils/cart.ts';

// Datos que necesita el layout de la tienda (menu de categorias, contador del carrito).
export async function storeLocals(req: Request, res: Response, next: NextFunction) {
  try {
    const categorias = await categoriaModel.findAll();
    res.locals.navCategorias = categorias.slice(0, 5);
    res.locals.cartCount = cartCount(readCart(req));
    res.locals.currentUrl = req.originalUrl;
    next();
  } catch (err) {
    next(err);
  }
}
