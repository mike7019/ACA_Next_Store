import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { requireAdmin } from '../middlewares/requireAdmin.ts';
import * as authController from '../controllers/auth.controller.ts';
import * as categoriaController from '../controllers/categoria.controller.ts';
import * as productoController from '../controllers/producto.controller.ts';
import * as pedidoController from '../controllers/pedido.controller.ts';
import * as adminController from '../controllers/admin.controller.ts';

export const adminRouter = Router();

adminRouter.post('/auth/login', asyncHandler(authController.login));
adminRouter.post('/auth/logout', authController.logout);
adminRouter.get('/auth/me', requireAdmin, authController.me);

adminRouter.use(requireAdmin);

adminRouter.get('/dashboard', asyncHandler(adminController.dashboard));

adminRouter.get('/categorias', asyncHandler(categoriaController.listAdmin));
adminRouter.post('/categorias', asyncHandler(categoriaController.create));
adminRouter.put('/categorias/:id', asyncHandler(categoriaController.update));
adminRouter.delete('/categorias/:id', asyncHandler(categoriaController.remove));

adminRouter.get('/productos', asyncHandler(productoController.listAdmin));
adminRouter.get('/productos/:id', asyncHandler(productoController.detalleAdmin));
adminRouter.post('/productos', asyncHandler(productoController.create));
adminRouter.put('/productos/:id', asyncHandler(productoController.update));
adminRouter.delete('/productos/:id', asyncHandler(productoController.remove));

adminRouter.get('/pedidos', asyncHandler(pedidoController.listAdmin));
adminRouter.get('/pedidos/:id', asyncHandler(pedidoController.detalleAdmin));
adminRouter.patch('/pedidos/:id/estado', asyncHandler(pedidoController.actualizarEstado));
adminRouter.patch('/pedidos/:id/envio', asyncHandler(pedidoController.actualizarEnvio));
adminRouter.patch('/pedidos/:id/pago', asyncHandler(pedidoController.actualizarPago));
