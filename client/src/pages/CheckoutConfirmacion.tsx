import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatCOP } from '../lib/format.ts';
import { getPedidoPublico } from '../api/pedidos.ts';
import type { Pedido } from '../api/types.ts';
import { useCart } from '../context/CartContext.tsx';

export default function CheckoutConfirmacion() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const cleared = useRef(false);

  const [pedido, setPedido] = useState<Pedido | null>(null);

  useEffect(() => {
    getPedidoPublico(Number(id))
      .then(setPedido)
      .catch(() => navigate('/'));
  }, [id, navigate]);

  useEffect(() => {
    if (!cleared.current) {
      clearCart();
      cleared.current = true;
    }
  }, [clearCart]);

  if (!pedido) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Pedido recibido</p>
      <h1 className="mb-2 text-3xl font-bold">Gracias, {pedido.cliente.nombre}!</h1>
      <p className="mb-10 text-neutral-400">Tu pedido #{pedido.id} quedo registrado y sera confirmado pronto.</p>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-left">
        <div className="flex flex-col gap-3">
          {pedido.detalles.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <span>{d.producto.nombre} x{d.cantidad}</span>
              <span className="font-semibold">{formatCOP(d.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1 border-t border-neutral-800 pt-4 text-sm text-neutral-400">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCOP(pedido.subtotal)}</span></div>
          <div className="flex justify-between"><span>Envio ({pedido.envio?.metodoEnvio.nombre})</span><span>{formatCOP(pedido.costoEnvio)}</span></div>
          <div className="flex justify-between text-base font-bold text-neutral-100"><span>Total</span><span>{formatCOP(pedido.total)}</span></div>
        </div>
        <div className="mt-4 border-t border-neutral-800 pt-4 text-sm text-neutral-400">
          <p>Metodo de pago: <span className="text-neutral-200">{pedido.pago?.metodo.replace('_', ' ')}</span></p>
          <p>Estado del pago: <span className="text-neutral-200">{pedido.pago?.estado}</span></p>
          <p>Estado del pedido: <span className="text-neutral-200">{pedido.estado}</span></p>
        </div>
      </div>

      <Link
        to="/productos"
        className="mt-10 inline-block rounded-full border border-neutral-700 px-6 py-3 font-semibold hover:border-brand-500 hover:text-brand-400"
      >
        Seguir comprando
      </Link>
    </div>
  );
}
