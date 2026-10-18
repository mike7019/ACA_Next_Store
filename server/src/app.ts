import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.ts';
import { webRouter } from './routes/web.routes.ts';
import { adminRouter } from './routes/admin.routes.ts';
import { flashMiddleware } from './middlewares/flash.ts';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.ts';
import { formatCOP } from './utils/format.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helpers disponibles en todas las vistas.
app.locals.formatCOP = formatCOP;
app.locals.label = (valor: string) => String(valor).replaceAll('_', ' ');

app.use(cookieParser(env.JWT_SECRET));
app.use(express.urlencoded({ extended: true }));

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(flashMiddleware);

app.use('/admin', adminRouter);
app.use('/', webRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// Vercel toma la app Express exportada por defecto como funcion serverless.
export default app;
