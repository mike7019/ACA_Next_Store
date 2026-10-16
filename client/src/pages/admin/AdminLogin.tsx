import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

export default function AdminLogin() {
  const { status, checkSession, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (status === 'idle') checkSession();
  }, [status, checkSession]);

  if (status === 'authenticated') {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('Correo o contrasena incorrectos.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
        <h1 className="mb-1 text-xl font-black">
          IRON<span className="text-brand-500">FUEL</span>
        </h1>
        <p className="mb-6 text-sm text-neutral-400">Panel de administracion</p>

        {error && <p className="mb-4 rounded-lg border border-red-700 bg-red-950/40 px-4 py-2 text-sm text-red-300">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Correo electronico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2 focus:border-brand-500 focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder="Contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2 focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={enviando}
            className="mt-2 rounded-lg bg-brand-500 px-4 py-2 font-semibold text-neutral-950 transition hover:bg-brand-400 disabled:opacity-50"
          >
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
