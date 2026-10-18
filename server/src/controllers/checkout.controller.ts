import type { Request, Response } from 'express';
import * as pedidoModel from '../models/pedido.model.ts';
import * as metodoEnvioModel from '../models/metodoEnvio.model.ts';
import * as carritoModel from '../models/carrito.model.ts';
import { readCart, writeCart } from '../utils/cart.ts';
import { METODOS_PAGO, esUno } from '../utils/constants.ts';
import { AppError } from '../utils/AppError.ts';
import { idParam } from '../utils/params.ts';

const ULTIMO_PEDIDO_COOKIE = 'ultimo_pedido';

const VALORES_VACIOS = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  calle: '',
  ciudad: '',
  departamento: '',
  codigoPostal: '',
  pais: 'Colombia',
  metodoEnvioId: '',
  metodoPago: '',
};

type Valores = typeof VALORES_VACIOS;

async function renderFormulario(req: Request, res: Response, valores: Valores, error: string | null, status = 200) {
  const [{ items, total: subtotal }, metodosEnvio] = await Promise.all([
    carritoModel.detalle(readCart(req)),
    metodoEnvioModel.findActivos(),
  ]);

  const valoresFinales = { ...valores };
  if (!valoresFinales.metodoEnvioId && metodosEnvio.length > 0) {
    valoresFinales.metodoEnvioId = String(metodosEnvio[0].id);
  }

  res.status(status).render('checkout/index', {
    title: 'Finalizar compra',
    items,
    subtotal,
    metodosEnvio,
    metodosPago: METODOS_PAGO,
    valores: valoresFinales,
    error,
  });
}

export async function formulario(req: Request, res: Response) {
  await renderFormulario(req, res, VALORES_VACIOS, null);
}

export async function procesar(req: Request, res: Response) {
  const body = req.body ?? {};
  const campo = (name: keyof Valores) => String(body[name] ?? '').trim();

  const valores: Valores = {
    nombre: campo('nombre'),
    apellido: campo('apellido'),
    email: campo('email').toLowerCase(),
    telefono: campo('telefono'),
    calle: campo('calle'),
    ciudad: campo('ciudad'),
    departamento: campo('departamento'),
    codigoPostal: campo('codigoPostal'),
    pais: campo('pais') || 'Colombia',
    metodoEnvioId: campo('metodoEnvioId'),
    metodoPago: campo('metodoPago'),
  };

  const cart = readCart(req);
  const items = Object.entries(cart).map(([productoId, cantidad]) => ({ productoId: Number(productoId), cantidad }));
  const metodoEnvioId = Number(valores.metodoEnvioId);

  let error: string | null = null;
  if (items.length === 0) {
    error = 'Tu carrito esta vacio.';
  } else if (!valores.nombre || !valores.apellido || !valores.email || !valores.calle || !valores.ciudad) {
    error = 'Completa todos los campos obligatorios.';
  } else if (!metodoEnvioId || !esUno(METODOS_PAGO.map((m) => m.value), valores.metodoPago)) {
    error = 'Selecciona un metodo de envio y de pago.';
  }

  if (error) {
    return renderFormulario(req, res, valores, error, 400);
  }

  try {
    const pedido = await pedidoModel.crearPedido({
      nombre: valores.nombre,
      apellido: valores.apellido,
      email: valores.email,
      telefono: valores.telefono || null,
      calle: valores.calle,
      ciudad: valores.ciudad,
      departamento: valores.departamento || null,
      codigoPostal: valores.codigoPostal || null,
      pais: valores.pais,
      metodoEnvioId,
      metodoPago: valores.metodoPago as Parameters<typeof pedidoModel.crearPedido>[0]['metodoPago'],
      items,
    });

    writeCart(res, {});
    // Solo quien hizo el pedido puede ver su confirmacion (los ids son consecutivos).
    res.cookie(ULTIMO_PEDIDO_COOKIE, String(pedido.id), {
      signed: true,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60,
    });
    res.redirect(`/checkout/confirmacion/${pedido.id}`);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'No pudimos procesar tu pedido.';
    await renderFormulario(req, res, valores, mensaje, 400);
  }
}

export async function confirmacion(req: Request, res: Response) {
  const id = idParam(req);
  if (req.signedCookies?.[ULTIMO_PEDIDO_COOKIE] !== String(id)) {
    return res.redirect('/');
  }

  const pedido = await pedidoModel.findByIdDetallado(id);
  if (!pedido) {
    throw new AppError(404, 'Pedido no encontrado.');
  }

  res.render('checkout/confirmacion', { title: `Pedido #${pedido.id}`, pedido });
}
