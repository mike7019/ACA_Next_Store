import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export type SetAdminTitle = (title: string) => void;

export default function AdminLayout() {
  const [title, setTitle] = useState('Panel');
  const { admin } = useAuth();

  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-100">
      <Sidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-6 py-4">
          <h1 className="text-lg font-semibold">{title}</h1>
          {admin && <p className="text-sm text-neutral-400">{admin.nombre}</p>}
        </header>
        <div className="p-6">
          <Outlet context={setTitle satisfies SetAdminTitle} />
        </div>
      </div>
    </div>
  );
}
