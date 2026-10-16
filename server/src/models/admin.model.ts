import { prisma } from '../lib/prisma.ts';

export function findByEmail(email: string) {
  return prisma.admin.findUnique({ where: { email } });
}
