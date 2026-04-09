import { useState, useEffect } from 'react';
import {
  ParkingSquare, Car, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp, Clock, ArrowRight, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { parkingService } from '../services/parkingService';
import { movementService } from '../services/movementService';
import { useAuth } from '../context/AuthContext';

const hourLabels = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];

function generateHourlyData() {
  return hourLabels.map((hour) => ({
    hour,
    movimientos: Math.floor(Math.random() * 30) + 5,
  }));
}

function generateWeeklyData() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days.map((day) => ({
    day,
    entradas: Math.floor(Math.random() * 80) + 40,
    salidas: Math.floor(Math.random() * 70) + 30,
  }));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ available: 0, maximos: 0, active: 0, occupied: 0 });
  const [activeMovements, setActiveMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hourlyData] = useState(generateHourlyData);
  const [weeklyData] = useState(generateWeeklyData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parkings, active] = await Promise.all([
          parkingService.getAll().catch(() => []),
          movementService.getActive().catch(() => []),
        ]);

        let available = 0;
        let maximos = 0;
        let occupied = 0;

        if (parkings.length > 0) {
          const availabilities = await Promise.all(
            parkings.map((p) => parkingService.getAvailability(p.id).catch(() => ({
              cupos_maximos: p.cupos_maximos, cupos_disponibles: p.cupos_maximos, cupos_ocupados: 0,
            })))
          );
          availabilities.forEach((a) => {
            available += a.cupos_disponibles;
            maximos += a.cupos_maximos;
            occupied += a.cupos_ocupados;
          });
        }

        setStats({ available, maximos, active: active.length, occupied });
        setActiveMovements(active);
      } catch {
        /* fallback */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const occupancyPercent = stats.maximos > 0 ? Math.round((stats.occupied / stats.maximos) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Cupos Disponibles" value={stats.available} change={`/${stats.maximos}`} icon={ParkingSquare} />
        <StatCard title="Vehículos Activos" value={stats.active} change={`${occupancyPercent}% ocupado`} changeType={occupancyPercent > 80 ? 'negative' : 'positive'} icon={Car} />
        <StatCard title="Ocupados" value={stats.occupied} icon={ArrowDownToLine} />
        <StatCard title="Capacidad Total" value={stats.maximos} icon={ArrowUpFromLine} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Sistema de Gestión</p>
            <h3 className="text-xl font-bold text-navy mt-1">ParkU Dashboard</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-md">
              Gestiona el parqueo universitario de forma eficiente. Controla entradas, salidas y disponibilidad en tiempo real.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-6 text-sm">
            {[
              { label: 'Usuarios', icon: '👤', val: 'Activos' },
              { label: 'Monitoreo', icon: '📊', val: 'Tiempo real' },
              { label: 'Control', icon: '🔒', val: 'Seguro' },
              { label: 'Reportes', icon: '📋', val: 'Disponibles' },
            ].map(({ label, icon, val }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-sm">{icon}</div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">{label}</p>
                  <p className="text-xs font-bold text-navy">{val}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-navy via-gray-800 to-navy p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/5 rounded-full" />
          <div className="absolute -right-4 bottom-4 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative">
            <h3 className="text-lg font-bold">Bienvenido, {user?.nombre?.split(' ')[0] || 'Usuario'}</h3>
            <p className="text-sm text-white/70 mt-1">
              El parqueo se encuentra al {occupancyPercent}% de su capacidad. {occupancyPercent > 80 ? 'Alta demanda detectada.' : 'Operando con normalidad.'}
            </p>
          </div>
          <button className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-light hover:text-white transition-colors cursor-pointer">
            Ver más <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-bold text-navy">Movimientos por Hora</h3>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-success font-semibold">(+23)</span> respecto a ayer
            </p>
          </div>
          <div className="bg-gradient-to-br from-navy via-gray-800 to-navy rounded-xl p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
                <Bar dataKey="movimientos" fill="#4FD1C5" radius={[4, 4, 0, 0]} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#2D3748', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} itemStyle={{ color: '#4FD1C5' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <div className="mb-4">
            <h3 className="text-base font-bold text-navy">Actividad Semanal</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="text-success font-semibold">(+5%)</span> más actividad esta semana
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4FD1C5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4FD1C5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D3748" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2D3748" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Area type="monotone" dataKey="entradas" stroke="#4FD1C5" strokeWidth={3} fill="url(#colorEntradas)" dot={false} />
              <Area type="monotone" dataKey="salidas" stroke="#2D3748" strokeWidth={3} fill="url(#colorSalidas)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-navy">Vehículos en Parqueo</h3>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-success" />
                <span className="text-success font-semibold">{stats.active}</span> vehículos dentro
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Placa', 'Parqueo', 'Hora Entrada'].map((h) => (
                    <th key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeMovements.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-400 text-sm">Sin vehículos activos</td></tr>
                ) : (
                  activeMovements.slice(0, 6).map((m) => (
                    <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-navy">{m.placa}</td>
                      <td className="py-3 pr-4 text-gray-500">{m.nombre_parqueo}</td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        {new Date(m.fecha_hora).toLocaleString('es-SV', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-bold text-navy">Actividad Reciente</h3>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-success font-semibold">Tiempo real</span>
            </p>
          </div>

          <div className="space-y-1">
            {activeMovements.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin actividad reciente</p>
            ) : (
              activeMovements.slice(0, 5).map((m, i) => (
                <div key={m.id} className="flex items-start gap-3 py-2.5">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-0.5 ${m.tipo === 'salida' ? 'bg-success' : 'bg-primary'}`} />
                    {i < Math.min(activeMovements.length, 5) - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-semibold text-navy">
                      {m.tipo === 'salida' ? 'Salida' : 'Entrada'} &mdash; {m.placa}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(m.fecha_hora).toLocaleString('es-SV', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
