import { api } from './client.ts';
import type { MetodoEnvio } from './types.ts';

export async function getMetodosEnvio(): Promise<MetodoEnvio[]> {
  const { data } = await api.get<MetodoEnvio[]>('/metodos-envio');
  return data;
}
