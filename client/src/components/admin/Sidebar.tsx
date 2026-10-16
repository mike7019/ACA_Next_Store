import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

const links = [
  { to: '/admin', label: 'Panel', end: true },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/pedidos', label: 'Pedidos' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-800 bg-neutral-950 p-4">
      <NavLink to="/admin" className="mb-8 block text-lg font-black tracking-tight">
        IRON<span className="text-brand-500">FUEL</span> <span className="text-xs font-normal text-neutral-500">admin</span>
      </NavLink>
      <nav className="flex flex-col gap-1 text-sm">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              [
                'rounded-lg px-3 py-2 font-medium transition',
                isActive ? 'bg-brand-500 text-neutral-950' : 'text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50',
              ].join(' ')
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 w-full rounded-lg border border-neutral-800 px-3 py-2 text-left text-sm text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
      >
        Cerrar sesion
      </button>
    </aside>
  );
}
