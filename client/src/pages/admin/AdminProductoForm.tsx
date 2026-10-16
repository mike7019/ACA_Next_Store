import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCategoriasAdmin, getProductoAdmin, createProducto, updateProducto, type ProductoFormInput } from '../../api/admin.ts';
import type { Categoria } from '../../api/types.ts';
import { useAdminTitle } from '../../components/admin/useAdminTitle.ts';

const FORM_VACIO: ProductoFormInput = {
  nombre: '',
  categoriaId: 0,
  descripcion: '',
  marca: '',
  sabor: '',
  presentacion: '',
  precio: 0,
  stock: 0,
  imagenUrl: '',
  destacado: false,
  activo: true,
};

export default function AdminProductoForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();

  useAdminTitle(esEdicion ? 'Editar producto' : 'Nuevo producto');

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<ProductoFormInput>(FORM_VACIO);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    getCategoriasAdmin().then(setCategorias);
  }, []);

  useEffect(() => {
    if (!id) return;
    getProductoAdmin(Number(id)).then((p) => {
      setForm({
        nombre: p.nombre,
        categoriaId: p.categoriaId,
        descripcion: p.descripcion ?? '',
        marca: p.marca ?? '',
        sabor: p.sabor ?? '',
        presentacion: p.presentacion ?? '',
        precio: Number(p.precio),
        stock: p.stock,
        imagenUrl: p.imagenUrl ?? '',
        destacado: p.destacado,
        activo: p.activo,
      });
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre || !form.categoriaId || Number.isNaN(form.precio) || form.precio < 0) {
      setError('Revisa el nombre, la categoria y el precio.');
      return;
    }

    setGuardando(true);
    try {
      if (esEdicion) {
        await updateProducto(Number(id), form);
      } else {
        await createProducto(form);
      }
      navigate('/admin/productos');
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No pudimos guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      {error && <p className="mb-4 rounded-lg border border-red-700 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</p>}

      <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Categoria
          <select
            required
            value={form.categoriaId || ''}
            onChange={(e) => setForm({ ...form, categoriaId: Number(e.target.value) })}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2"
          >
            <option value="">Selecciona una categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Descripcion
          <textarea
            rows={4}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Marca
            <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Sabor
            <input value={form.sabor} onChange={(e) => setForm({ ...form, sabor: e.target.value })} className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Presentacion
            <input
              placeholder="ej. 1 kg, 60 caps"
              value={form.presentacion}
              onChange={(e) => setForm({ ...form, presentacion: e.target.value })}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            URL de imagen
            <input value={form.imagenUrl} onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })} className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Precio (COP)
            <input
              type="number"
              min={0}
              step={100}
              required
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Stock
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Activo
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })} /> Destacado en home
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={guardando} className="rounded-lg bg-brand-500 px-5 py-2 font-semibold text-neutral-950 hover:bg-brand-400 disabled:opacity-50">
            {esEdicion ? 'Guardar cambios' : 'Guardar producto'}
          </button>
          <Link to="/admin/productos" className="rounded-lg border border-neutral-700 px-5 py-2 hover:border-neutral-500">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
