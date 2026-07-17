// Carrito de compras del lado del cliente, persistido en localStorage.
// Solo debe importarse desde <script> de componentes Astro (nunca desde el frontmatter/SSR).

export interface CartItem {
  productoId: number;
  nombre: string;
  slug: string;
  precio: number;
  imagenUrl: string | null;
  cantidad: number;
}

const STORAGE_KEY = 'ironfuel_cart';
const CART_EVENT = 'cart:updated';

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: items }));
}

export function addToCart(item: Omit<CartItem, 'cantidad'>, cantidad = 1): void {
  const items = getCart();
  const existing = items.find((i) => i.productoId === item.productoId);
  if (existing) {
    existing.cantidad += cantidad;
  } else {
    items.push({ ...item, cantidad });
  }
  saveCart(items);
}

export function updateQty(productoId: number, cantidad: number): void {
  let items = getCart();
  if (cantidad <= 0) {
    items = items.filter((i) => i.productoId !== productoId);
  } else {
    const item = items.find((i) => i.productoId === productoId);
    if (item) item.cantidad = cantidad;
  }
  saveCart(items);
}

export function removeFromCart(productoId: number): void {
  saveCart(getCart().filter((i) => i.productoId !== productoId));
}

export function clearCart(): void {
  saveCart([]);
}

export function cartCount(): number {
  return getCart().reduce((sum, i) => sum + i.cantidad, 0);
}

export function cartTotal(): number {
  return getCart().reduce((sum, i) => sum + i.cantidad * i.precio, 0);
}

export function onCartUpdated(callback: (items: CartItem[]) => void): void {
  window.addEventListener(CART_EVENT, (e) => callback((e as CustomEvent<CartItem[]>).detail));
}
