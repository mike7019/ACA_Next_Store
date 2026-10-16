import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.tsx';
import { formatCOP } from '../lib/format.ts';
import { getProductoPorSlug } from '../api/productos.ts';
import type { Producto } from '../api/types.ts';
import { useCart } from '../context/CartContext.tsx';

export default function ProductoDetalle() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    getProductoPorSlug(slug)
      .then((data) => {
        setProducto(data.producto);
        setRelacionados(data.relacionados);
        setCantidad(1);
      })
      .catch(() => navigate('/productos'));
  }, [slug, navigate]);

  if (!producto) return null;

  const handleAdd = () => {
    addToCart(
      {
        productoId: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        precio: Number(producto.precio),
        imagenUrl: producto.imagenUrl,
      },
      Math.max(1, cantidad),
    );
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link to="/productos" className="hover:text-brand-400">Productos</Link>
        <span className="mx-2">/</span>
        <Link to={`/productos?categoria=${producto.categoria?.slug}`} className="hover:text-brand-400">
          {producto.categoria?.nombre}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          {producto.imagenUrl ? (
            <img src={producto.imagenUrl} alt={producto.nombre} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-600">Sin imagen</div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {producto.marca && <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">{producto.marca}</p>}
          <h1 className="text-3xl font-bold">{producto.nombre}</h1>

          <div className="flex flex-wrap gap-2 text-sm text-neutral-400">
            {producto.presentacion && <span className="rounded-full border border-neutral-700 px-3 py-1">{producto.presentacion}</span>}
            {producto.sabor && <span className="rounded-full border border-neutral-700 px-3 py-1">Sabor: {producto.sabor}</span>}
          </div>

          <p className="text-3xl font-black">{formatCOP(producto.precio)}</p>

          <p className="whitespace-pre-line text-neutral-300">{producto.descripcion}</p>

          <p className="text-sm text-neutral-500">
            {producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Producto agotado'}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={producto.stock}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              disabled={producto.stock <= 0}
              className="w-20 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={producto.stock <= 0}
              className="flex-1 rounded-full bg-brand-500 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              {producto.stock <= 0 ? 'Agotado' : agregado ? 'Agregado ✓' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">Tambien te puede interesar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relacionados.map((r) => (
              <ProductCard key={r.id} producto={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
