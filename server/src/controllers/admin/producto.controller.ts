import type { Request, Response } from 'express';
import * as productoModel from '../../models/producto.model.ts';
import * as categoriaModel from '../../models/categoria.model.ts';
import { slugify } from '../../utils/format.ts';
import { AppError } from '../../utils/AppError.ts';
import { setFlash } from '../../utils/flash.ts';
import { idParam } from '../../utils/params.ts';
import { Prisma } from '../../generated/prisma/client.ts';

// Valores del formulario tal como se muestran en los inputs (todo texto).
interface ProductoForm {
  nombre: string;
  categoriaId: string;
  descripcion: string;
  marca: string;
  sabor: string;
  presentacion: string;
  precio: string;
  stock: string;
  imagenUrl: string;
  destacado: boolean;
  activo: boolean;
}

const FORM_VACIO: ProductoForm = {
  nombre: '',
  categoriaId: '',
  descripcion: '',
  marca: '',
  sabor: '',
  presentacion: '',
  precio: '0',
  stock: '0',
  imagenUrl: '',
  destacado: false,
  activo: true,
};

function leerForm(body: Record<string, unknown>): ProductoForm {
  const texto = (name: keyof ProductoForm) => String(body[name] ?? '').trim();
  return {
    nombre: texto('nombre'),
    categoriaId: texto('categoriaId'),
    descripcion: texto('descripcion'),
    marca: texto('marca'),
    sabor: texto('sabor'),
    presentacion: texto('presentacion'),
    precio: texto('precio'),
    stock: texto('stock'),
    imagenUrl: texto('imagenUrl'),
    // Un checkbox sin marcar no se envia en el formulario.
    destacado: body.destacado === 'on',
    activo: body.activo === 'on',
  };
}

function parseProductoInput(form: ProductoForm) {
  const categoriaId = Number(form.categoriaId);
  const precio = Number(form.precio);
  const stock = Number(form.stock);

  if (!form.nombre || !categoriaId || Number.isNaN(precio) || precio < 0) {
    throw new AppError(400, 'Revisa el nombre, la categoria y el precio.');
  }

  return {
    nombre: form.nombre,
    categoriaId,
    descripcion: form.descripcion || null,
    marca: form.marca || null,
    sabor: form.sabor || null,
    presentacion: form.presentacion || null,
    precio,
    stock: Number.isNaN(stock) ? 0 : stock,
    imagenUrl: form.imagenUrl || null,
    destacado: form.destacado,
    activo: form.activo,
  };
}

async function renderForm(res: Response, id: number | null, valores: ProductoForm, error: string | null, status = 200) {
  const categorias = await categoriaModel.findAll();
  res.status(status).render('admin/productos/form', {
    title: id ? 'Editar producto' : 'Nuevo producto',
    id,
    valores,
    categorias,
    error,
  });
}

export async function index(req: Request, res: Response) {
  const buscar = String(req.query.buscar ?? '').trim();
  const productos = await productoModel.findAllAdmin(buscar || undefined);
  res.render('admin/productos/index', { title: 'Productos', productos, buscar });
}

export async function nuevo(req: Request, res: Response) {
  await renderForm(res, null, FORM_VACIO, null);
}

export async function crear(req: Request, res: Response) {
  const form = leerForm(req.body ?? {});

  let data;
  try {
    data = parseProductoInput(form);
  } catch (err) {
    if (err instanceof AppError) return renderForm(res, null, form, err.message, 400);
    throw err;
  }

  let slug = slugify(data.nombre);
  const existente = await productoModel.findBySlug(slug);
  if (existente) slug = `${slug}-${Date.now().toString(36)}`;

  await productoModel.create({ ...data, slug });
  setFlash(res, 'success', 'Producto creado.');
  res.redirect('/admin/productos');
}

export async function editar(req: Request, res: Response) {
  const id = idParam(req);
  const p = await productoModel.findById(id);
  if (!p) throw new AppError(404, 'Producto no encontrado.');

  await renderForm(
    res,
    id,
    {
      nombre: p.nombre,
      categoriaId: String(p.categoriaId),
      descripcion: p.descripcion ?? '',
      marca: p.marca ?? '',
      sabor: p.sabor ?? '',
      presentacion: p.presentacion ?? '',
      precio: String(Number(p.precio)),
      stock: String(p.stock),
      imagenUrl: p.imagenUrl ?? '',
      destacado: p.destacado,
      activo: p.activo,
    },
    null,
  );
}

export async function actualizar(req: Request, res: Response) {
  const id = idParam(req);
  const existente = await productoModel.findById(id);
  if (!existente) throw new AppError(404, 'Producto no encontrado.');

  const form = leerForm(req.body ?? {});

  let data;
  try {
    data = parseProductoInput(form);
  } catch (err) {
    if (err instanceof AppError) return renderForm(res, id, form, err.message, 400);
    throw err;
  }

  await productoModel.update(id, { ...data, slug: existente.slug });
  setFlash(res, 'success', 'Producto actualizado.');
  res.redirect('/admin/productos');
}

export async function eliminar(req: Request, res: Response) {
  const id = idParam(req);

  try {
    await productoModel.remove(id);
    setFlash(res, 'success', 'Producto eliminado.');
  } catch (err) {
    // El producto ya tiene pedidos asociados (ON DELETE RESTRICT): lo desactivamos en vez de borrarlo.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      await productoModel.deactivate(id);
      setFlash(res, 'success', 'El producto tiene pedidos asociados, asi que se desactivo en lugar de eliminarse.');
    } else {
      throw err;
    }
  }

  res.redirect('/admin/productos');
}
