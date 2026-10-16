import { Router } from 'express';
import { publicRouter } from './public.routes.ts';
import { adminRouter } from './admin.routes.ts';

export const apiRouter = Router();

apiRouter.use('/admin', adminRouter);
apiRouter.use('/', publicRouter);
