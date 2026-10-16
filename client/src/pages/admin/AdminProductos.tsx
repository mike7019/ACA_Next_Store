import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCOP } from '../../lib/format.ts';
import { getProductosAdmin, deleteProducto } from '../../api/admin.ts';
import type { Producto } from '../../api/types.ts';
import { useAdminTitle } from '../../components/admin/useAdminTitle.ts';

export default function AdminProductos() {
  useAdminTitle('Productos');

  const [productos, setProductos] = useState<Producto[]>([]);
  const [buscar, setBuscar] = useState('');

  const cargar = (filtro?: string) => {
    getProductosAdmin(filtro || undefined).then(setProductos);
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargar(buscar);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await deleteProducto(id);
    cargar(buscar);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <form onSubmit={handleBuscar} className="flex-1">
          <input
            type="search"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por nombre o marca..."
            className="w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </form>
        <Link to="/admin/productos/nuevo" className="whitespace-nowrap rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-brand-400">
          + Nuevo producto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-medium">Producto</th>
              <th className="px-5 py-3 font-medium">Categoria</th>
              <th className="px-5 py-3 font-medium text-right">Precio</th>
              <th className="px-5 py-3 font-medium text-right">Stock</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-t border-neutral-800">
                <td className="px-5 py-3">
                  <p className="font-medium">{p.nombre}</p>
                  {p.marca && <p className="text-xs text-neutral-500">{p.marca}</p>}
                </td>
                <td className="px-5 py-3 text-neutral-400">{p.categoria?.nombre}</td>
                <td className="px-5 py-3 text-right">{formatCOP(p.precio)}</td>
                <td className="px-5 py-3 text-right">{p.stock}</td>
                <td className="px-5 py-3">
                  <span className={['rounded-full px-2 py-0.5 text-xs font-semibold', p.activo ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-500'].join(' ')}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link to={`/admin/productos/${p.id}/editar`} className="text-brand-500 hover:text-brand-400">Editar</Link>
                    <button type="button" onClick={() => handleEliminar(p.id)} className="text-red-400 hover:text-red-300">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-neutral-500">No hay productos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
