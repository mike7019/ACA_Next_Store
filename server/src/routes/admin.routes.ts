import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { requireAdmin } from '../middlewares/requireAdmin.ts';
import * as authController from '../controllers/admin/auth.controller.ts';
import * as dashboardController from '../controllers/admin/dashboard.controller.ts';
import * as productoController from '../controllers/admin/producto.controller.ts';
import * as categoriaController from '../controllers/admin/categoria.controller.ts';
import * as pedidoController from '../controllers/admin/pedido.controller.ts';

export const adminRouter = Router();

adminRouter.get('/login', authController.loginForm);
adminRouter.post('/login', asyncHandler(authController.login));
adminRouter.post('/logout', authController.logout);

adminRouter.use(requireAdmin);

adminRouter.get('/', asyncHandler(dashboardController.index));

adminRouter.get('/productos', asyncHandler(productoController.index));
adminRouter.get('/productos/nuevo', asyncHandler(productoController.nuevo));
adminRouter.post('/productos', asyncHandler(productoController.crear));
adminRouter.get('/productos/:id/editar', asyncHandler(productoController.editar));
adminRouter.post('/productos/:id', asyncHandler(productoController.actualizar));
adminRouter.post('/productos/:id/eliminar', asyncHandler(productoController.eliminar));

adminRouter.get('/categorias', asyncHandler(categoriaController.index));
adminRouter.post('/categorias', asyncHandler(categoriaController.crear));
adminRouter.get('/categorias/:id/editar', asyncHandler(categoriaController.editar));
adminRouter.post('/categorias/:id', asyncHandler(categoriaController.actualizar));
adminRouter.post('/categorias/:id/eliminar', asyncHandler(categoriaController.eliminar));

adminRouter.get('/pedidos', asyncHandler(pedidoController.index));
adminRouter.get('/pedidos/:id', asyncHandler(pedidoController.show));
adminRouter.post('/pedidos/:id/estado', asyncHandler(pedidoController.actualizarEstado));
adminRouter.post('/pedidos/:id/envio', asyncHandler(pedidoController.actualizarEnvio));
adminRouter.post('/pedidos/:id/pago', asyncHandler(pedidoController.actualizarPago));
