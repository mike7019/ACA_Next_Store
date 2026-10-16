import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

// .env vive en la raiz del monorepo, no en server/.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
