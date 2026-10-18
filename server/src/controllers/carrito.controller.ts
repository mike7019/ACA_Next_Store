import type { Request, Response } from 'express';
import * as productoModel from '../models/producto.model.ts';
import * as carritoModel from '../models/carrito.model.ts';
import { readCart, writeCart } from '../utils/cart.ts';
import { setFlash } from '../utils/flash.ts';
import { idParam, rutaInterna } from '../utils/params.ts';

export async function ver(req: Request, res: Response) {
  const { items, total } = await carritoModel.detalle(readCart(req));
  res.render('carrito', { title: 'Tu carrito', items, total });
}

export async function agregar(req: Request, res: Response) {
  const volver = rutaInterna(req.body?.volver, '/carrito');
  const productoId = Number(req.body?.productoId);
  const cantidad = Math.max(1, Math.floor(Number(req.body?.cantidad) || 1));

  const producto = Number.isInteger(productoId) ? await productoModel.findById(productoId) : null;
  if (!producto || !producto.activo || producto.stock <= 0) {
    setFlash(res, 'error', 'Ese producto no esta disponible.');
    return res.redirect(volver);
  }

  const cart = readCart(req);
  cart[producto.id] = Math.min((cart[producto.id] ?? 0) + cantidad, producto.stock);
  writeCart(res, cart);

  setFlash(res, 'success', `"${producto.nombre}" se agrego al carrito.`);
  res.redirect(volver);
}

export async function actualizar(req: Request, res: Response) {
  const productoId = idParam(req);
  const cantidad = Math.floor(Number(req.body?.cantidad));
  const cart = readCart(req);

  if (productoId in cart) {
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      delete cart[productoId];
    } else {
      const producto = await productoModel.findById(productoId);
      cart[productoId] = producto ? Math.min(cantidad, producto.stock) : cantidad;
    }
    writeCart(res, cart);
  }

  res.redirect('/carrito');
}

export function quitar(req: Request, res: Response) {
  const productoId = idParam(req);
  const cart = readCart(req);
  delete cart[productoId];
  writeCart(res, cart);
  res.redirect('/carrito');
}
