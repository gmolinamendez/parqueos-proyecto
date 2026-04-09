import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  ParkingSquare,
  ArrowLeftRight,
  Users,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehiculos', label: 'Vehículos', icon: Car },
  { to: '/parqueos', label: 'Parqueos', icon: ParkingSquare },
  { to: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
];

const adminItems = [
  { to: '/usuarios', label: 'Usuarios', icon: Users },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white text-navy shadow-sm font-semibold'
        : 'text-navy-light hover:bg-white/60'
    }`;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] p-4 overflow-y-auto z-40">
      <div className="bg-white rounded-2xl h-full shadow-sm p-4 flex flex-col">
        <div className="px-3 py-4 mb-2">
          <h1 className="text-sm font-black tracking-wider text-navy uppercase flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <ParkingSquare className="w-4 h-4 text-white" />
            </div>
            ParkU Dashboard
          </h1>
        </div>

        <hr className="border-gray-100 mb-4" />

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClasses} end={to === '/'}>
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Icon className="w-4 h-4 text-white" />
              </div>
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2 px-4">
                Administración
              </p>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClasses}>
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="mt-4 bg-gradient-to-br from-primary to-teal-600 rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -right-2 -bottom-6 w-16 h-16 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-bold">¿Necesitas ayuda?</p>
            <p className="text-xs text-white/80 mt-0.5">Consulta la documentación</p>
            <button className="mt-3 w-full py-2 bg-white text-primary text-xs font-bold rounded-xl hover:bg-white/90 transition-colors cursor-pointer">
              DOCUMENTACIÓN
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
