import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCOP } from '../../lib/format.ts';
import { getDashboard, type DashboardData } from '../../api/admin.ts';
import { useAdminTitle } from '../../components/admin/useAdminTitle.ts';

export default function AdminDashboard() {
  useAdminTitle('Panel');
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) return null;

  const stats = [
    { label: 'Productos activos', value: String(data.totalProductos) },
    { label: 'Con poco stock (≤5)', value: String(data.stockBajo) },
    { label: 'Pedidos pendientes', value: String(data.pedidosPendientes) },
    { label: 'Clientes registrados', value: String(data.totalClientes) },
    { label: 'Ventas totales', value: formatCOP(data.ventasTotales) },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <h2 className="font-semibold">Ultimos pedidos</h2>
          <Link to="/admin/pedidos" className="text-sm text-brand-500 hover:text-brand-400">Ver todos →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.ultimosPedidos.map((p) => (
              <tr key={p.id} className="border-t border-neutral-800">
                <td className="px-5 py-3">
                  <Link to={`/admin/pedidos/${p.id}`} className="text-brand-500 hover:text-brand-400">#{p.id}</Link>
                </td>
                <td className="px-5 py-3">{p.cliente.nombre} {p.cliente.apellido}</td>
                <td className="px-5 py-3 capitalize">{p.estado.replace('_', ' ')}</td>
                <td className="px-5 py-3 text-right font-semibold">{formatCOP(p.total)}</td>
              </tr>
            ))}
            {data.ultimosPedidos.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-neutral-500">Aun no hay pedidos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
