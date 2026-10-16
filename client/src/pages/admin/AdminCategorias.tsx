import { useEffect, useState } from 'react';
import { getCategoriasAdmin, createCategoria, updateCategoria, deleteCategoria } from '../../api/admin.ts';
import type { Categoria } from '../../api/types.ts';
import { useAdminTitle } from '../../components/admin/useAdminTitle.ts';

export default function AdminCategorias() {
  useAdminTitle('Categorias');

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [editando, setEditando] = useState<Categoria | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');

  const cargar = () => getCategoriasAdmin().then(setCategorias);

  useEffect(() => {
    cargar();
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    try {
      await createCategoria({ nombre, descripcion });
      setNombre('');
      setDescripcion('');
      cargar();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No pudimos crear la categoria.');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta categoria?')) return;
    try {
      await deleteCategoria(id);
      cargar();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No se pudo eliminar la categoria.');
    }
  };

  const abrirEdicion = (c: Categoria) => {
    setEditando(c);
    setEditNombre(c.nombre);
    setEditDescripcion(c.descripcion ?? '');
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    try {
      await updateCategoria(editando.id, { nombre: editNombre, descripcion: editDescripcion });
      setEditando(null);
      cargar();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'No se pudo guardar la categoria.');
    }
  };

  return (
    <>
      {error && <p className="mb-4 rounded-lg border border-red-700 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</p>}

      {editando ? (
        <form onSubmit={handleGuardarEdicion} className="mb-8 grid max-w-lg gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <p className="text-sm font-semibold text-neutral-300">Editando: {editando.nombre}</p>
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input required value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Descripcion
            <textarea rows={3} value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
          </label>
          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-brand-500 px-5 py-2 font-semibold text-neutral-950 hover:bg-brand-400">Guardar cambios</button>
            <button type="button" onClick={() => setEditando(null)} className="rounded-lg border border-neutral-700 px-5 py-2 hover:border-neutral-500">Cancelar</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCrear} className="mb-8 flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-5 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="ej. Pre-entrenos" className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            Descripcion
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Opcional" className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2" />
          </label>
          <button type="submit" className="whitespace-nowrap rounded-lg bg-brand-500 px-5 py-2 font-semibold text-neutral-950 hover:bg-brand-400">
            + Agregar
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500">
            <tr>
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Descripcion</th>
              <th className="px-5 py-3 font-medium text-right">Productos</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id} className="border-t border-neutral-800">
                <td className="px-5 py-3 font-medium">{c.nombre}</td>
                <td className="px-5 py-3 text-neutral-400">{c.descripcion}</td>
                <td className="px-5 py-3 text-right">{c._count?.productos ?? 0}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => abrirEdicion(c)} className="text-brand-500 hover:text-brand-400">Editar</button>
                    <button type="button" onClick={() => handleEliminar(c.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-neutral-500">No hay categorias.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
