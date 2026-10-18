import * as productoModel from './producto.model.ts';
import type { CartMap } from '../utils/cart.ts';

// Cruza el carrito de la cookie con los productos reales de la BD (precio, stock, activo).
export async function detalle(cart: CartMap) {
  const ids = Object.keys(cart).map(Number);
  if (ids.length === 0) return { items: [], total: 0 };

  const productos = await productoModel.findManyByIds(ids);
  const items = productos.map((producto) => {
    const cantidad = cart[producto.id];
    return { producto, cantidad, subtotal: Number(producto.precio) * cantidad };
  });

  return { items, total: items.reduce((sum, i) => sum + i.subtotal, 0) };
}
