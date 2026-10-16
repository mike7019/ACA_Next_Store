import { api } from './client.ts';
import type { Admin } from './types.ts';

export async function login(email: string, password: string): Promise<Admin> {
  const { data } = await api.post<{ admin: Admin }>('/admin/auth/login', { email, password });
  return data.admin;
}

export async function logout(): Promise<void> {
  await api.post('/admin/auth/logout');
}

export async function me(): Promise<Admin> {
  const { data } = await api.get<{ admin: Admin }>('/admin/auth/me');
  return data.admin;
}
