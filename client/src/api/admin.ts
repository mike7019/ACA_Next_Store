import { api } from './client.ts';
import type { Categoria, Producto, Pedido, PedidoEstado, EnvioEstado, PagoEstado } from './types.ts';

export interface DashboardData {
  totalProductos: number;
  stockBajo: number;
  pedidosPendientes: number;
  totalClientes: number;
  ventasTotales: number | string;
  ultimosPedidos: (Pedido & { cliente: Pedido['cliente'] })[];
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>('/admin/dashboard');
  return data;
}

// --- Categorias ---

export async function getCategoriasAdmin(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/admin/categorias');
  return data;
}

export async function createCategoria(input: { nombre: string; descripcion: string }): Promise<Categoria> {
  const { data } = await api.post<Categoria>('/admin/categorias', input);
  return data;
}

export async function updateCategoria(id: number, input: { nombre: string; descripcion: string }): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/admin/categorias/${id}`, input);
  return data;
}

export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`/admin/categorias/${id}`);
}

// --- Productos ---

export interface ProductoFormInput {
  nombre: string;
  categoriaId: number;
  descripcion: string;
  marca: string;
  sabor: string;
  presentacion: string;
  precio: number;
  stock: number;
  imagenUrl: string;
  destacado: boolean;
  activo: boolean;
}

export async function getProductosAdmin(buscar?: string): Promise<Producto[]> {
  const { data } = await api.get<Producto[]>('/admin/productos', { params: { buscar } });
  return data;
}

export async function getProductoAdmin(id: number): Promise<Producto> {
  const { data } = await api.get<Producto>(`/admin/productos/${id}`);
  return data;
}

export async function createProducto(input: ProductoFormInput): Promise<Producto> {
  const { data } = await api.post<Producto>('/admin/productos', input);
  return data;
}

export async function updateProducto(id: number, input: ProductoFormInput): Promise<Producto> {
  const { data } = await api.put<Producto>(`/admin/productos/${id}`, input);
  return data;
}

export async function deleteProducto(id: number): Promise<void> {
  await api.delete(`/admin/productos/${id}`);
}

// --- Pedidos ---

export async function getPedidosAdmin(estado?: string): Promise<Pedido[]> {
  const { data } = await api.get<Pedido[]>('/admin/pedidos', { params: { estado } });
  return data;
}

export async function getPedidoAdmin(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/admin/pedidos/${id}`);
  return data;
}

export async function actualizarEstadoPedido(id: number, estado: PedidoEstado): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/admin/pedidos/${id}/estado`, { estado });
  return data;
}

export async function actualizarEnvioPedido(id: number, estadoEnvio: EnvioEstado, numeroGuia: string): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/admin/pedidos/${id}/envio`, { estadoEnvio, numeroGuia });
  return data;
}

export async function actualizarPagoPedido(id: number, estadoPago: PagoEstado): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/admin/pedidos/${id}/pago`, { estadoPago });
  return data;
}
