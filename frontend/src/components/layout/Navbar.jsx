import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/vehiculos': 'Vehículos',
  '/parqueos': 'Parqueos',
  '/movimientos': 'Movimientos',
  '/usuarios': 'Usuarios',
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const title = pageTitles[pathname] || 'ParkU';

  return (
    <nav className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Link to="/" className="hover:text-primary transition-colors">Páginas</Link>
          <span>/</span>
          <span className="text-navy-light">{title}</span>
        </div>
        <h2 className="text-sm font-bold text-navy mt-0.5">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-9 pr-4 py-2 w-48 rounded-xl border border-gray-200 text-xs bg-white
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-1">
          <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-navy-light hover:bg-white transition-colors">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{user?.nombre || 'Usuario'}</span>
          </Link>

          <button className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-navy transition-all cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>

          <button className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-navy transition-all cursor-pointer relative">
            <Bell className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-danger transition-all cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
