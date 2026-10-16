import { api } from './client.ts';
import type { Categoria } from './types.ts';

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias');
  return data;
}
