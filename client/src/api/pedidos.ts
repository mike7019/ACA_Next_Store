import { api } from './client.ts';
import type { Pedido, PagoMetodo } from './types.ts';

export interface CheckoutInput {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  calle: string;
  ciudad: string;
  departamento: string;
  codigoPostal: string;
  pais: string;
  metodoEnvioId: number;
  metodoPago: PagoMetodo;
  items: { productoId: number; cantidad: number }[];
}

export async function checkout(input: CheckoutInput): Promise<{ pedidoId: number }> {
  const { data } = await api.post('/checkout', input);
  return data;
}

export async function getPedidoPublico(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/pedidos/${id}`);
  return data;
}
