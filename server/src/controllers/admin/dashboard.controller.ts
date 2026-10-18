import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.ts';
import * as productoModel from '../../models/producto.model.ts';
import * as pedidoModel from '../../models/pedido.model.ts';

export async function index(req: Request, res: Response) {
  const [totalProductos, stockBajo, pedidosPendientes, totalClientes, ventas, ultimosPedidos] = await Promise.all([
    productoModel.countActivos(),
    productoModel.countStockBajo(),
    pedidoModel.countPendientes(),
    prisma.cliente.count(),
    pedidoModel.sumVentas(),
    pedidoModel.findUltimos(5),
  ]);

  res.render('admin/dashboard', {
    title: 'Panel',
    totalProductos,
    stockBajo,
    pedidosPendientes,
    totalClientes,
    ventasTotales: ventas._sum.total ?? 0,
    ultimosPedidos,
  });
}
