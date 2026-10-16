// Acepta number, string o cualquier valor "decimal-like" (ej. Prisma.Decimal serializado) con toString().
export type Money = number | string | { toString(): string };

export function formatCOP(value: Money): string {
  const n = typeof value === 'number' ? value : Number(value.toString());
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}

// Rango unicode de marcas diacriticas combinadas (acentos, tildes) para generar slugs sin ellas.
const DIACRITICS = /[̀-ͯ]/g;

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
