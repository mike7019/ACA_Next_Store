import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatCOP } from '../../lib/format.ts';
import { getPedidosAdmin } from '../../api/admin.ts';
import type { Pedido, PedidoEstado } from '../../api/types.ts';
import { useAdminTitle } from '../../components/admin/useAdminTitle.ts';

const ESTADOS: PedidoEstado[] = ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];

export default function AdminPedidos() {
  useAdminTitle('Pedidos');

  const [searchParams] = useSearchParams();
  const estadoFiltro = searchParams.get('estado') ?? '';
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    getPedidosAdmin(estadoFiltro || undefined).then(setPedidos);
  }, [estadoFiltro]);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          to="/admin/pedidos"
          className={['rounded-full border px-4 py-1.5 text-sm font-medium', !estadoFiltro ? 'border-brand-500 bg-brand-500 text-neutral-950' : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'].join(' ')}
        >
          Todos
        </Link>
        {ESTADOS.map((e) => (
          <Link
            key={e}
            to={`/admin/pedidos?estado=${e}`}
            className={['rounded-full border px-4 py-1.5 text-sm font-medium capitalize', estadoFiltro === e ? 'border-brand-500 bg-brand-500 text-neutral-950' : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'].join(' ')}
          >
            {e.replace('_', ' ')}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="border-t border-neutral-800">
                <td className="px-5 py-3">
                  <Link to={`/admin/pedidos/${p.id}`} className="text-brand-500 hover:text-brand-400">#{p.id}</Link>
                </td>
                <td className="px-5 py-3">{p.cliente.nombre} {p.cliente.apellido}</td>
                <td className="px-5 py-3 text-neutral-400">{new Date(p.creadoEn).toLocaleDateString('es-CO')}</td>
                <td className="px-5 py-3 capitalize">{p.estado.replace('_', ' ')}</td>
                <td className="px-5 py-3 text-right font-semibold">{formatCOP(p.total)}</td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-neutral-500">No hay pedidos con este filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
