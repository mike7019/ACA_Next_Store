import type { Request, Response } from 'express';
import * as pedidoModel from '../models/pedido.model.ts';
import { AppError } from '../utils/AppError.ts';
import type { Prisma } from '../generated/prisma/client.ts';

export async function checkout(req: Request, res: Response) {
  const body = req.body ?? {};

  const nombre = String(body.nombre ?? '').trim();
  const apellido = String(body.apellido ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const telefono = String(body.telefono ?? '').trim();
  const calle = String(body.calle ?? '').trim();
  const ciudad = String(body.ciudad ?? '').trim();
  const departamento = String(body.departamento ?? '').trim();
  const codigoPostal = String(body.codigoPostal ?? '').trim();
  const pais = String(body.pais ?? 'Colombia').trim();
  const metodoEnvioId = Number(body.metodoEnvioId);
  const metodoPago = String(body.metodoPago ?? '') as Prisma.PagoCreateInput['metodo'];
  const items = Array.isArray(body.items) ? (body.items as { productoId: number; cantidad: number }[]) : [];

  if (!nombre || !apellido || !email || !calle || !ciudad) {
    throw new AppError(400, 'Completa todos los campos obligatorios.');
  }
  if (items.length === 0) {
    throw new AppError(400, 'Tu carrito esta vacio.');
  }
  if (!metodoEnvioId || !metodoPago) {
    throw new AppError(400, 'Selecciona un metodo de envio y de pago.');
  }

  try {
    const pedido = await pedidoModel.crearPedido({
      nombre,
      apellido,
      email,
      telefono: telefono || null,
      calle,
      ciudad,
      departamento: departamento || null,
      codigoPostal: codigoPostal || null,
      pais,
      metodoEnvioId,
      metodoPago,
      items,
    });
    res.status(201).json({ pedidoId: pedido.id });
  } catch (err) {
    throw new AppError(400, err instanceof Error ? err.message : 'No pudimos procesar tu pedido.');
  }
}

export async function detallePublico(req: Request, res: Response) {
  const pedido = await pedidoModel.findByIdDetallado(Number(req.params.id));
  if (!pedido) {
    throw new AppError(404, 'Pedido no encontrado.');
  }
  res.json(pedido);
}

export async function listAdmin(req: Request, res: Response) {
  const estado = String(req.query.estado ?? '');
  res.json(await pedidoModel.findAll(estado || undefined));
}

export async function detalleAdmin(req: Request, res: Response) {
  const pedido = await pedidoModel.findByIdDetallado(Number(req.params.id));
  if (!pedido) {
    throw new AppError(404, 'Pedido no encontrado.');
  }
  res.json(pedido);
}

export async function actualizarEstado(req: Request, res: Response) {
  const id = Number(req.params.id);
  const estado = String(req.body?.estado ?? '');
  await pedidoModel.actualizarEstado(id, estado);
  res.json(await pedidoModel.findByIdDetallado(id));
}

export async function actualizarEnvio(req: Request, res: Response) {
  const id = Number(req.params.id);
  const estadoEnvio = String(req.body?.estadoEnvio ?? '');
  const numeroGuia = String(req.body?.numeroGuia ?? '').trim();
  await pedidoModel.actualizarEnvio(id, estadoEnvio, numeroGuia || null);
  res.json(await pedidoModel.findByIdDetallado(id));
}

export async function actualizarPago(req: Request, res: Response) {
  const id = Number(req.params.id);
  const estadoPago = String(req.body?.estadoPago ?? '');
  await pedidoModel.actualizarPago(id, estadoPago);
  res.json(await pedidoModel.findByIdDetallado(id));
}
