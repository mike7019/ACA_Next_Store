import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategorias } from '../api/categorias.ts';
import type { Categoria } from '../api/types.ts';
import { useCart } from '../context/CartContext.tsx';

export default function Header() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const { cartCount } = useCart();

  useEffect(() => {
    getCategorias().then((cats) => setCategorias(cats.slice(0, 5)));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-xl font-black tracking-tight">
          IRON<span className="text-brand-500">FUEL</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-300 md:flex">
          <Link to="/productos" className="hover:text-brand-400">Todos los productos</Link>
          {categorias.map((c) => (
            <Link key={c.id} to={`/productos?categoria=${c.slug}`} className="hover:text-brand-400">
              {c.nombre}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/carrito"
            className="relative flex items-center gap-2 rounded-full border border-neutral-700 px-3 py-2 text-sm font-semibold text-neutral-200 transition hover:border-brand-500 hover:text-brand-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.847-4.783 2.234-7.213a.75.75 0 00-.674-.837H5.106M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-neutral-950">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
