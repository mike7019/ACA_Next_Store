import { api } from './client.ts';
import type { Producto } from './types.ts';

export async function getProductos(params: { categoria?: string; buscar?: string } = {}): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>('/productos', { params });
  return data;
}

export async function getDestacados(): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>('/productos/destacados');
  return data;
}

export async function getProductoPorSlug(slug: string): Promise<{ producto: Producto; relacionados: Producto[] }> {
  const { data } = await api.get(`/productos/${slug}`);
  return data;
}
