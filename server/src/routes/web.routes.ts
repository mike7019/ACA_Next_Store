import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { storeLocals } from '../middlewares/storeLocals.ts';
import * as homeController from '../controllers/home.controller.ts';
import * as productoController from '../controllers/producto.controller.ts';
import * as carritoController from '../controllers/carrito.controller.ts';
import * as checkoutController from '../controllers/checkout.controller.ts';

export const webRouter = Router();

webRouter.use(asyncHandler(storeLocals));

webRouter.get('/', asyncHandler(homeController.index));

webRouter.get('/productos', asyncHandler(productoController.index));
webRouter.get('/productos/:slug', asyncHandler(productoController.show));

webRouter.get('/carrito', asyncHandler(carritoController.ver));
webRouter.post('/carrito/agregar', asyncHandler(carritoController.agregar));
webRouter.post('/carrito/actualizar/:id', asyncHandler(carritoController.actualizar));
webRouter.post('/carrito/quitar/:id', carritoController.quitar);

webRouter.get('/checkout', asyncHandler(checkoutController.formulario));
webRouter.post('/checkout', asyncHandler(checkoutController.procesar));
webRouter.get('/checkout/confirmacion/:id', asyncHandler(checkoutController.confirmacion));
