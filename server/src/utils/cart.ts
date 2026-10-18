import type { Request, Response } from 'express';

// El carrito vive en una cookie firmada con { [productoId]: cantidad }.
// Los precios y datos del producto siempre se leen de la base de datos.
export type CartMap = Record<number, number>;

const CART_COOKIE = 'cart';
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias

export function readCart(req: Request): CartMap {
  const raw = req.signedCookies?.[CART_COOKIE];
  if (typeof raw !== 'string') return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const cart: CartMap = {};
    for (const [id, qty] of Object.entries(parsed)) {
      const productoId = Number(id);
      if (Number.isInteger(productoId) && Number.isInteger(qty) && (qty as number) > 0) {
        cart[productoId] = qty as number;
      }
    }
    return cart;
  } catch {
    return {};
  }
}

export function writeCart(res: Response, cart: CartMap) {
  if (Object.keys(cart).length === 0) {
    res.clearCookie(CART_COOKIE, { path: '/' });
    return;
  }
  res.cookie(CART_COOKIE, JSON.stringify(cart), {
    signed: true,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_MS,
  });
}

export function cartCount(cart: CartMap): number {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}
