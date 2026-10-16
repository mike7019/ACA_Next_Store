import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

export default function RequireAdmin() {
  const { status, checkSession } = useAuth();

  useEffect(() => {
    if (status === 'idle') checkSession();
  }, [status, checkSession]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Cargando...
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
