import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// El .env vive en la raiz del monorepo (lo comparten server, client y docker-compose),
// pero npm workspaces ejecuta los scripts de "server" con cwd=server/, por eso la ruta
// se resuelve de forma absoluta respecto a este archivo en vez de depender del cwd.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../../../.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? 'admin@ironfuel.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'admin123',
};

export const isProd = env.NODE_ENV === 'production';
