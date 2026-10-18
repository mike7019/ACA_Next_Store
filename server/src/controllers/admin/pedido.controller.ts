import type { Request, Response } from 'express';
import * as pedidoModel from '../../models/pedido.model.ts';
import { AppError } from '../../utils/AppError.ts';
import { setFlash } from '../../utils/flash.ts';
import { idParam } from '../../utils/params.ts';
import { ESTADOS_ENVIO, ESTADOS_PAGO, ESTADOS_PEDIDO, esUno } from '../../utils/constants.ts';

export async function index(req: Request, res: Response) {
  const estado = String(req.query.estado ?? '');
  const pedidos = await pedidoModel.findAll(estado || undefined);
  res.render('admin/pedidos/index', { title: 'Pedidos', pedidos, estadoFiltro: estado, estados: ESTADOS_PEDIDO });
}

export async function show(req: Request, res: Response) {
  const id = idParam(req);
  const pedido = await pedidoModel.findByIdDetallado(id);
  if (!pedido) throw new AppError(404, 'Pedido no encontrado.');

  res.render('admin/pedidos/show', {
    title: `Pedido #${pedido.id}`,
    pedido,
    estadosPedido: ESTADOS_PEDIDO,
    estadosEnvio: ESTADOS_ENVIO,
    estadosPago: ESTADOS_PAGO,
  });
}

export async function actualizarEstado(req: Request, res: Response) {
  const id = idParam(req);
  const estado = String(req.body?.estado ?? '');

  if (esUno(ESTADOS_PEDIDO, estado)) {
    await pedidoModel.actualizarEstado(id, estado);
    setFlash(res, 'success', 'Estado del pedido actualizado.');
  } else {
    setFlash(res, 'error', 'Estado de pedido invalido.');
  }
  res.redirect(`/admin/pedidos/${id}`);
}

export async function actualizarEnvio(req: Request, res: Response) {
  const id = idParam(req);
  const estadoEnvio = String(req.body?.estadoEnvio ?? '');
  const numeroGuia = String(req.body?.numeroGuia ?? '').trim();

  if (esUno(ESTADOS_ENVIO, estadoEnvio)) {
    await pedidoModel.actualizarEnvio(id, estadoEnvio, numeroGuia || null);
    setFlash(res, 'success', 'Envio actualizado.');
  } else {
    setFlash(res, 'error', 'Estado de envio invalido.');
  }
  res.redirect(`/admin/pedidos/${id}`);
}

export async function actualizarPago(req: Request, res: Response) {
  const id = idParam(req);
  const estadoPago = String(req.body?.estadoPago ?? '');

  if (esUno(ESTADOS_PAGO, estadoPago)) {
    await pedidoModel.actualizarPago(id, estadoPago);
    setFlash(res, 'success', 'Pago actualizado.');
  } else {
    setFlash(res, 'error', 'Estado de pago invalido.');
  }
  res.redirect(`/admin/pedidos/${id}`);
}
