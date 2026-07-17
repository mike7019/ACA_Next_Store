import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  const adapter = new PrismaPg({ connectionString: import.meta.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Evita crear un nuevo pool de conexiones en cada recarga de HMR durante `astro dev`.
export const prisma = globalThis.__prisma ?? createClient();

if (import.meta.env.DEV) {
  globalThis.__prisma = prisma;
}
