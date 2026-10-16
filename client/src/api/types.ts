import type { Money } from '../lib/format.ts';

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  _count?: { productos: number };
}

export interface Producto {
  id: number;
  categoriaId: number;
  categoria?: Categoria;
  nombre: string;
  slug: string;
  descripcion: string | null;
  marca: string | null;
  sabor: string | null;
  presentacion: string | null;
  precio: Money;
  stock: number;
  imagenUrl: string | null;
  destacado: boolean;
  activo: boolean;
}

export interface MetodoEnvio {
  id: number;
  nombre: string;
  descripcion: string | null;
  costoBase: Money;
  diasEstimados: number | null;
  activo: boolean;
}

export type PedidoEstado = 'pendiente' | 'confirmado' | 'en_preparacion' | 'enviado' | 'entregado' | 'cancelado';
export type EnvioEstado = 'preparando' | 'despachado' | 'en_transito' | 'entregado' | 'devuelto';
export type PagoMetodo = 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'efectivo' | 'billetera_digital';
export type PagoEstado = 'pendiente' | 'aprobado' | 'rechazado' | 'reembolsado';

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
}

export interface DireccionEnvio {
  id: number;
  calle: string;
  ciudad: string;
  departamento: string | null;
  codigoPostal: string | null;
  pais: string;
}

export interface DetallePedido {
  id: number;
  cantidad: number;
  precioUnit: Money;
  subtotal: Money;
  producto: Producto;
}

export interface Envio {
  estado: EnvioEstado;
  numeroGuia: string | null;
  metodoEnvio: MetodoEnvio;
}

export interface Pago {
  metodo: PagoMetodo;
  estado: PagoEstado;
  monto: Money;
}

export interface Pedido {
  id: number;
  estado: PedidoEstado;
  subtotal: Money;
  costoEnvio: Money;
  total: Money;
  creadoEn: string;
  cliente: Cliente;
  direccionEnvio?: DireccionEnvio | null;
  detalles: DetallePedido[];
  envio: Envio | null;
  pago: Pago | null;
}

export interface Admin {
  id: number;
  email: string;
  nombre: string;
}
