import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem {
  productoId: number;
  nombre: string;
  slug: string;
  precio: number;
  imagenUrl: string | null;
  cantidad: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void;
  updateQty: (productoId: number, cantidad: number) => void;
  removeFromCart: (productoId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const STORAGE_KEY = 'ironfuel_cart';

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'cantidad'>, cantidad = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productoId === item.productoId);
      if (existing) {
        return prev.map((i) => (i.productoId === item.productoId ? { ...i, cantidad: i.cantidad + cantidad } : i));
      }
      return [...prev, { ...item, cantidad }];
    });
  };

  const updateQty = (productoId: number, cantidad: number) => {
    setItems((prev) => {
      if (cantidad <= 0) return prev.filter((i) => i.productoId !== productoId);
      return prev.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i));
    });
  };

  const removeFromCart = (productoId: number) => {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  };

  const clearCart = () => setItems([]);

  const cartCount = useMemo(() => items.reduce((sum, i) => sum + i.cantidad, 0), [items]);
  const cartTotal = useMemo(() => items.reduce((sum, i) => sum + i.cantidad * i.precio, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
