export const ESTADOS_PEDIDO = ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'] as const;
export const ESTADOS_ENVIO = ['preparando', 'despachado', 'en_transito', 'entregado', 'devuelto'] as const;
export const ESTADOS_PAGO = ['pendiente', 'aprobado', 'rechazado', 'reembolsado'] as const;

export const METODOS_PAGO = [
  { value: 'tarjeta_credito', label: 'Tarjeta de credito' },
  { value: 'tarjeta_debito', label: 'Tarjeta de debito' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'efectivo', label: 'Efectivo (pago contra entrega)' },
  { value: 'billetera_digital', label: 'Billetera digital' },
] as const;

export function esUno<T extends string>(lista: readonly T[], valor: string): valor is T {
  return (lista as readonly string[]).includes(valor);
}
