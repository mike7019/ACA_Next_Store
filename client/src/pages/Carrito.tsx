import { Link } from 'react-router-dom';
import { formatCOP } from '../lib/format.ts';
import { useCart } from '../context/CartContext.tsx';

export default function Carrito() {
  const { items, updateQty, removeFromCart, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold">Tu carrito</h1>
        <p className="text-neutral-400">
          Tu carrito esta vacio. <Link to="/productos" className="text-brand-500 hover:text-brand-400">Ver productos</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">Tu carrito</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.productoId} className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
              {item.imagenUrl && <img src={item.imagenUrl} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1">
              <Link to={`/productos/${item.slug}`} className="font-semibold hover:text-brand-400">
                {item.nombre}
              </Link>
              <p className="text-sm text-neutral-400">{formatCOP(item.precio)} c/u</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.cantidad}
              onChange={(e) => updateQty(item.productoId, Math.max(1, Number(e.target.value)))}
              className="w-16 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-center"
            />
            <span className="w-28 text-right font-semibold">{formatCOP(item.precio * item.cantidad)}</span>
            <button
              type="button"
              onClick={() => removeFromCart(item.productoId)}
              className="text-neutral-500 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-6">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold">{formatCOP(cartTotal)}</span>
      </div>

      <Link
        to="/checkout"
        className="mt-6 block rounded-full bg-brand-500 px-6 py-3 text-center font-semibold text-neutral-950 hover:bg-brand-400"
      >
        Proceder al pago
      </Link>
    </div>
  );
}
