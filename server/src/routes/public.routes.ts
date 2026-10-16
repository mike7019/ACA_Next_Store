import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import * as categoriaController from '../controllers/categoria.controller.ts';
import * as productoController from '../controllers/producto.controller.ts';
import * as metodoEnvioController from '../controllers/metodoEnvio.controller.ts';
import * as pedidoController from '../controllers/pedido.controller.ts';

export const publicRouter = Router();

publicRouter.get('/categorias', asyncHandler(categoriaController.list));

publicRouter.get('/productos', asyncHandler(productoController.list));
publicRouter.get('/productos/destacados', asyncHandler(productoController.destacados));
publicRouter.get('/productos/:slug', asyncHandler(productoController.detalle));

publicRouter.get('/metodos-envio', asyncHandler(metodoEnvioController.list));

publicRouter.post('/checkout', asyncHandler(pedidoController.checkout));
publicRouter.get('/pedidos/:id', asyncHandler(pedidoController.detallePublico));
