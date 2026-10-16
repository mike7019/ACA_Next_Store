import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.tsx';
import { getCategorias } from '../api/categorias.ts';
import { getProductos } from '../api/productos.ts';
import type { Categoria, Producto } from '../api/types.ts';

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaSlug = searchParams.get('categoria') ?? '';
  const buscar = searchParams.get('buscar') ?? '';

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [buscarInput, setBuscarInput] = useState(buscar);

  useEffect(() => {
    getCategorias().then(setCategorias);
  }, []);

  useEffect(() => {
    getProductos({ categoria: categoriaSlug || undefined, buscar: buscar || undefined }).then(setProductos);
  }, [categoriaSlug, buscar]);

  useEffect(() => {
    setBuscarInput(buscar);
  }, [buscar]);

  const categoriaActiva = categorias.find((c) => c.slug === categoriaSlug);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (categoriaSlug) next.set('categoria', categoriaSlug);
    if (buscarInput.trim()) next.set('buscar', buscarInput.trim());
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{categoriaActiva ? categoriaActiva.nombre : 'Todos los productos'}</h1>
        <form className="flex gap-2" onSubmit={handleBuscar}>
          <input
            type="search"
            value={buscarInput}
            onChange={(e) => setBuscarInput(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none sm:w-64"
          />
        </form>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          to="/productos"
          className={[
            'rounded-full border px-4 py-1.5 text-sm font-medium',
            !categoriaActiva ? 'border-brand-500 bg-brand-500 text-neutral-950' : 'border-neutral-700 text-neutral-300 hover:border-neutral-500',
          ].join(' ')}
        >
          Todas
        </Link>
        {categorias.map((c) => (
          <Link
            key={c.id}
            to={`/productos?categoria=${c.slug}`}
            className={[
              'rounded-full border px-4 py-1.5 text-sm font-medium',
              categoriaActiva?.id === c.id ? 'border-brand-500 bg-brand-500 text-neutral-950' : 'border-neutral-700 text-neutral-300 hover:border-neutral-500',
            ].join(' ')}
          >
            {c.nombre}
          </Link>
        ))}
      </div>

      {productos.length === 0 ? (
        <p className="text-neutral-400">No encontramos productos con esos filtros.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
