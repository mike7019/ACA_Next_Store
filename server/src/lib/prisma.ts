import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env.ts';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL, max: 3 });
  return new PrismaClient({ adapter });
}

// Evita crear un nuevo pool de conexiones en cada recarga de `tsx watch`.
export const prisma = globalThis.__prisma ?? createClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
