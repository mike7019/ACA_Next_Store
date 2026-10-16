import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.ts';
import { apiRouter } from './routes/index.ts';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.ts';

export const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
