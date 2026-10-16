import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.tsx';
import { getCategorias } from '../api/categorias.ts';
import { getDestacados } from '../api/productos.ts';
import type { Categoria, Producto } from '../api/types.ts';

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [destacados, setDestacados] = useState<Producto[]>([]);

  useEffect(() => {
    getCategorias().then(setCategorias);
    getDestacados().then(setDestacados);
  }, []);

  return (
    <>
      <section className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Rendimiento sin limites</p>
          <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            Suplementos deportivos para llevar tu entrenamiento al siguiente nivel
          </h1>
          <p className="max-w-xl text-neutral-400">
            Proteinas, creatina, pre-entrenos, aminoacidos y vitaminas de las mejores marcas, con envio a todo el pais.
          </p>
          <Link
            to="/productos"
            className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-brand-400"
          >
            Ver catalogo completo
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xl font-bold">Categorias</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categorias.map((c) => (
            <Link
              key={c.id}
              to={`/productos?categoria=${c.slug}`}
              className="flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-6 text-center text-sm font-semibold text-neutral-200 transition hover:border-brand-500 hover:text-brand-400"
            >
              {c.nombre}
            </Link>
          ))}
        </div>
      </section>

      {destacados.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Destacados</h2>
            <Link to="/productos" className="text-sm font-semibold text-brand-500 hover:text-brand-400">Ver todo →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destacados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
