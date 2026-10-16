import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCOP } from '../../lib/format.ts';
import { getPedidoAdmin, actualizarEstadoPedido, actualizarEnvioPedido, actualizarPagoPedido } from '../../api/admin.ts';
import type { Pedido, PedidoEstado, EnvioEstado, PagoEstado } from '../../api/types.ts';
import { useAdminTitle } from '../../components/admin/useAdminTitle.ts';

const ESTADOS_PEDIDO: PedidoEstado[] = ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
const ESTADOS_ENVIO: EnvioEstado[] = ['preparando', 'despachado', 'en_transito', 'entregado', 'devuelto'];
const ESTADOS_PAGO: PagoEstado[] = ['pendiente', 'aprobado', 'rechazado', 'reembolsado'];

export default function AdminPedidoDetalle() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  useAdminTitle(`Pedido #${id}`);

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [estadoPedido, setEstadoPedido] = useState<PedidoEstado>('pendiente');
  const [estadoEnvio, setEstadoEnvio] = useState<EnvioEstado>('preparando');
  const [numeroGuia, setNumeroGuia] = useState('');
  const [estadoPago, setEstadoPago] = useState<PagoEstado>('pendiente');

  const cargar = () =>
    getPedidoAdmin(Number(id))
      .then((p) => {
        setPedido(p);
        setEstadoPedido(p.estado);
        if (p.envio) {
          setEstadoEnvio(p.envio.estado);
          setNumeroGuia(p.envio.numeroGuia ?? '');
        }
        if (p.pago) setEstadoPago(p.pago.estado);
      })
      .catch(() => navigate('/admin/pedidos'));

  useEffect(() => {
    cargar();
  }, [id]);

  if (!pedido) return null;

  const handleEstadoPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await actualizarEstadoPedido(pedido.id, estadoPedido);
      cargar();
    } catch {
      setError('No pudimos guardar el cambio.');
    }
  };

  const handleEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await actualizarEnvioPedido(pedido.id, estadoEnvio, numeroGuia);
      cargar();
    } catch {
      setError('No pudimos guardar el cambio.');
    }
  };

  const handlePago = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await actualizarPagoPedido(pedido.id, estadoPago);
      cargar();
    } catch {
      setError('No pudimos guardar el cambio.');
    }
  };

  return (
    <>
      {error && <p className="mb-4 rounded-lg border border-red-700 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="mb-4 font-semibold">Productos</h2>
            <div className="flex flex-col divide-y divide-neutral-800">
              {pedido.detalles.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{d.producto.nombre}</p>
                    <p className="text-neutral-500">{d.cantidad} x {formatCOP(d.precioUnit)}</p>
                  </div>
                  <p className="font-semibold">{formatCOP(d.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-1 border-t border-neutral-800 pt-4 text-sm text-neutral-400">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCOP(pedido.subtotal)}</span></div>
              <div className="flex justify-between"><span>Envio</span><span>{formatCOP(pedido.costoEnvio)}</span></div>
              <div className="flex justify-between text-base font-bold text-neutral-100"><span>Total</span><span>{formatCOP(pedido.total)}</span></div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="mb-4 font-semibold">Cliente y direccion</h2>
            <p className="text-sm">{pedido.cliente.nombre} {pedido.cliente.apellido}</p>
            <p className="text-sm text-neutral-400">{pedido.cliente.email} {pedido.cliente.telefono ? `· ${pedido.cliente.telefono}` : ''}</p>
            {pedido.direccionEnvio && (
              <p className="mt-2 text-sm text-neutral-400">
                {pedido.direccionEnvio.calle}, {pedido.direccionEnvio.ciudad}
                {pedido.direccionEnvio.departamento ? `, ${pedido.direccionEnvio.departamento}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <form onSubmit={handleEstadoPedido} className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="mb-3 font-semibold">Estado del pedido</h2>
            <select
              value={estadoPedido}
              onChange={(e) => setEstadoPedido(e.target.value as PedidoEstado)}
              className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm capitalize"
            >
              {ESTADOS_PEDIDO.map((e) => (
                <option key={e} value={e}>{e.replace('_', ' ')}</option>
              ))}
            </select>
            <button type="submit" className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-brand-400">
              Actualizar
            </button>
          </form>

          {pedido.envio && (
            <form onSubmit={handleEnvio} className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
              <h2 className="mb-3 font-semibold">Envio ({pedido.envio.metodoEnvio.nombre})</h2>
              <select
                value={estadoEnvio}
                onChange={(e) => setEstadoEnvio(e.target.value as EnvioEstado)}
                className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm capitalize"
              >
                {ESTADOS_ENVIO.map((e) => (
                  <option key={e} value={e}>{e.replace('_', ' ')}</option>
                ))}
              </select>
              <input
                placeholder="Numero de guia"
                value={numeroGuia}
                onChange={(e) => setNumeroGuia(e.target.value)}
                className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
              />
              <button type="submit" className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-brand-400">
                Actualizar
              </button>
            </form>
          )}

          {pedido.pago && (
            <form onSubmit={handlePago} className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
              <h2 className="mb-3 font-semibold">Pago ({pedido.pago.metodo.replace('_', ' ')})</h2>
              <select
                value={estadoPago}
                onChange={(e) => setEstadoPago(e.target.value as PagoEstado)}
                className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm capitalize"
              >
                {ESTADOS_PAGO.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <button type="submit" className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-neutral-950 hover:bg-brand-400">
                Actualizar
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
