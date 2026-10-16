import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCOP, type Money } from '../lib/format.ts';
import { useCart } from '../context/CartContext.tsx';

interface Props {
  producto: {
    id: number;
    nombre: string;
    slug: string;
    marca: string | null;
    precio: Money;
    imagenUrl: string | null;
    stock: number;
  };
}

export default function ProductCard({ producto }: Props) {
  const { addToCart } = useCart();
  const [agregado, setAgregado] = useState(false);

  const handleAdd = () => {
    addToCart({
      productoId: producto.id,
      nombre: producto.nombre,
      slug: producto.slug,
      precio: Number(producto.precio),
      imagenUrl: producto.imagenUrl,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-brand-600">
      <Link to={`/productos/${producto.slug}`} className="block aspect-square overflow-hidden bg-neutral-800">
        {producto.imagenUrl ? (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="h-full w-full object-cover transition group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-600">Sin imagen</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {producto.marca && <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{producto.marca}</p>}
        <Link to={`/productos/${producto.slug}`} className="font-semibold leading-snug hover:text-brand-400">
          {producto.nombre}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold">{formatCOP(producto.precio)}</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={producto.stock <= 0}
            className="rounded-full bg-brand-500 px-3 py-1.5 text-sm font-semibold text-neutral-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            {producto.stock <= 0 ? 'Agotado' : agregado ? 'Agregado ✓' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}
