import { Prisma } from '../generated/prisma/client.ts';
import { prisma } from '../lib/prisma.ts';

const DETALLE_INCLUDE = {
  cliente: true,
  direccionEnvio: true,
  detalles: { include: { producto: true } },
  envio: { include: { metodoEnvio: true } },
  pago: true,
} satisfies Prisma.PedidoInclude;

export function findAll(estado?: string) {
  const ESTADOS = ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
  return prisma.pedido.findMany({
    where: estado && ESTADOS.includes(estado) ? { estado: estado as Prisma.PedidoWhereInput['estado'] } : undefined,
    include: { cliente: true },
    orderBy: { creadoEn: 'desc' },
  });
}

export function findUltimos(take = 5) {
  return prisma.pedido.findMany({ take, orderBy: { creadoEn: 'desc' }, include: { cliente: true } });
}

export function findByIdDetallado(id: number) {
  return prisma.pedido.findUnique({ where: { id }, include: DETALLE_INCLUDE });
}

export function countPendientes() {
  return prisma.pedido.count({ where: { estado: 'pendiente' } });
}

export function sumVentas() {
  return prisma.pedido.aggregate({ _sum: { total: true }, where: { estado: { not: 'cancelado' } } });
}

export function actualizarEstado(id: number, estado: string) {
  return prisma.pedido.update({ where: { id }, data: { estado: estado as Prisma.PedidoUpdateInput['estado'] } });
}

export function actualizarEnvio(pedidoId: number, estado: string, numeroGuia: string | null) {
  return prisma.envio.update({
    where: { pedidoId },
    data: { estado: estado as Prisma.EnvioUpdateInput['estado'], numeroGuia },
  });
}

export function actualizarPago(pedidoId: number, estado: string) {
  return prisma.pago.update({
    where: { pedidoId },
    data: { estado: estado as Prisma.PagoUpdateInput['estado'] },
  });
}

export interface CrearPedidoInput {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  calle: string;
  ciudad: string;
  departamento: string | null;
  codigoPostal: string | null;
  pais: string;
  metodoEnvioId: number;
  metodoPago: Prisma.PagoCreateInput['metodo'];
  items: { productoId: number; cantidad: number }[];
}

// Valida stock/precios reales en BD y crea cliente+direccion+pedido+detalles+envio+pago
// en una sola transaccion, descontando el stock de cada producto.
export async function crearPedido(input: CrearPedidoInput) {
  const productos = await prisma.producto.findMany({
    where: { id: { in: input.items.map((i) => i.productoId) }, activo: true },
  });

  if (productos.length !== input.items.length) {
    throw new Error('Alguno de los productos de tu carrito ya no esta disponible.');
  }

  for (const item of input.items) {
    const producto = productos.find((p) => p.id === item.productoId)!;
    if (item.cantidad < 1 || item.cantidad > producto.stock) {
      throw new Error(`No hay stock suficiente de "${producto.nombre}".`);
    }
  }

  const metodoEnvio = await prisma.metodoEnvio.findUnique({ where: { id: input.metodoEnvioId } });
  if (!metodoEnvio || !metodoEnvio.activo) {
    throw new Error('Selecciona un metodo de envio valido.');
  }

  const detalles = input.items.map((item) => {
    const producto = productos.find((p) => p.id === item.productoId)!;
    const precioUnit = producto.precio;
    const subtotalLinea = precioUnit.times(item.cantidad);
    return { productoId: producto.id, cantidad: item.cantidad, precioUnit, subtotal: subtotalLinea };
  });

  const subtotal = detalles.reduce((sum, d) => sum.plus(d.subtotal), new Prisma.Decimal(0));
  const total = subtotal.plus(metodoEnvio.costoBase);

  return prisma.$transaction(async (tx) => {
    const cliente = await tx.cliente.upsert({
      where: { email: input.email },
      update: { nombre: input.nombre, apellido: input.apellido, telefono: input.telefono ?? undefined },
      create: {
        nombre: input.nombre,
        apellido: input.apellido,
        email: input.email,
        telefono: input.telefono,
      },
    });

    const direccion = await tx.direccionEnvio.create({
      data: {
        clienteId: cliente.id,
        alias: 'Envio',
        calle: input.calle,
        ciudad: input.ciudad,
        departamento: input.departamento,
        codigoPostal: input.codigoPostal,
        pais: input.pais,
        esPrincipal: false,
      },
    });

    const nuevoPedido = await tx.pedido.create({
      data: {
        clienteId: cliente.id,
        direccionEnvioId: direccion.id,
        estado: 'pendiente',
        subtotal,
        costoEnvio: metodoEnvio.costoBase,
        total,
        detalles: { create: detalles },
        envio: {
          create: {
            metodoEnvioId: metodoEnvio.id,
            estado: 'preparando',
            fechaEntregaEst: metodoEnvio.diasEstimados
              ? new Date(Date.now() + metodoEnvio.diasEstimados * 24 * 60 * 60 * 1000)
              : null,
          },
        },
        pago: {
          create: {
            metodo: input.metodoPago,
            estado: 'pendiente',
            monto: total,
          },
        },
      },
    });

    for (const item of input.items) {
      await tx.producto.update({
        where: { id: item.productoId },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    return nuevoPedido;
  });
}
