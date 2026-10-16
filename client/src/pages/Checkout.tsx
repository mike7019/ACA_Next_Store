import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCOP } from '../lib/format.ts';
import { getMetodosEnvio } from '../api/metodosEnvio.ts';
import { checkout } from '../api/pedidos.ts';
import type { MetodoEnvio, PagoMetodo } from '../api/types.ts';
import { useCart } from '../context/CartContext.tsx';

const METODOS_PAGO: { value: PagoMetodo; label: string }[] = [
  { value: 'tarjeta_credito', label: 'Tarjeta de credito' },
  { value: 'tarjeta_debito', label: 'Tarjeta de debito' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'efectivo', label: 'Efectivo (pago contra entrega)' },
  { value: 'billetera_digital', label: 'Billetera digital' },
];

export default function Checkout() {
  const { items, cartTotal: subtotal } = useCart();
  const navigate = useNavigate();

  const [metodosEnvio, setMetodosEnvio] = useState<MetodoEnvio[]>([]);
  const [metodoEnvioId, setMetodoEnvioId] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState<PagoMetodo | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    calle: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    pais: 'Colombia',
  });

  useEffect(() => {
    getMetodosEnvio().then((metodos) => {
      setMetodosEnvio(metodos);
      if (metodos.length > 0) setMetodoEnvioId(metodos[0].id);
    });
  }, []);

  const costoEnvio = metodosEnvio.find((m) => m.id === metodoEnvioId)?.costoBase ?? 0;
  const total = subtotal + Number(costoEnvio);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!metodoEnvioId || !metodoPago) {
      setError('Selecciona un metodo de envio y de pago.');
      return;
    }

    setEnviando(true);
    try {
      const { pedidoId } = await checkout({
        ...form,
        metodoEnvioId,
        metodoPago,
        items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
      });
      navigate(`/checkout/confirmacion/${pedidoId}`);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No pudimos procesar tu pedido.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">Finalizar compra</h1>

      {items.length === 0 && (
        <p className="mb-6 rounded-lg border border-yellow-700 bg-yellow-950/40 px-4 py-3 text-sm text-yellow-300">
          Tu carrito esta vacio.{' '}
          <Link to="/productos" className="underline">Ver productos</Link>
        </p>
      )}

      {error && <p className="mb-6 rounded-lg border border-red-700 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Datos de contacto</legend>
          <input required placeholder="Nombre" value={form.nombre} onChange={handleChange('nombre')} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
          <input required placeholder="Apellido" value={form.apellido} onChange={handleChange('apellido')} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
          <input required type="email" placeholder="Correo electronico" value={form.email} onChange={handleChange('email')} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 sm:col-span-2" />
          <input placeholder="Telefono" value={form.telefono} onChange={handleChange('telefono')} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 sm:col-span-2" />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Direccion de envio</legend>
          <input required placeholder="Calle / direccion" value={form.calle} onChange={handleChange('calle')} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 sm:col-span-2" />
          <input required placeholder="Ciudad" value={form.ciudad} onChange={handleChange('ciudad')} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
          <input placeholder="Departamento" value={form.departamento} onChange={handleChange('departamento')} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
          <input placeholder="Codigo postal" value={form.codigoPostal} onChange={handleChange('codigoPostal')} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
          <input placeholder="Pais" value={form.pais} onChange={handleChange('pais')} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Metodo de envio</legend>
          {metodosEnvio.map((m) => (
            <label key={m.id} className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm">
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="metodoEnvioId"
                  checked={metodoEnvioId === m.id}
                  onChange={() => setMetodoEnvioId(m.id)}
                  required
                />
                {m.nombre} {m.diasEstimados ? `(${m.diasEstimados} dias aprox.)` : ''}
              </span>
              <span className="font-semibold">{Number(m.costoBase) === 0 ? 'Gratis' : formatCOP(m.costoBase)}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">Metodo de pago</legend>
          {METODOS_PAGO.map((m) => (
            <label key={m.value} className="flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm">
              <input
                type="radio"
                name="metodoPago"
                checked={metodoPago === m.value}
                onChange={() => setMetodoPago(m.value)}
                required
              />
              {m.label}
            </label>
          ))}
        </fieldset>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex flex-col gap-2 text-sm text-neutral-300">
            {items.map((item) => (
              <div key={item.productoId} className="flex items-center justify-between">
                <span>{item.nombre} x{item.cantidad}</span>
                <span>{formatCOP(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCOP(total)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={items.length === 0 || enviando}
          className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {enviando ? 'Procesando...' : 'Confirmar pedido'}
        </button>
      </form>
    </div>
  );
}
