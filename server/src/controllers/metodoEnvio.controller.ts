import type { Request, Response } from 'express';
import * as metodoEnvioModel from '../models/metodoEnvio.model.ts';

export async function list(req: Request, res: Response) {
  res.json(await metodoEnvioModel.findActivos());
}
