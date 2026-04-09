import { useState, useEffect } from 'react';
import { ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Search, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { movementService } from '../services/movementService';
import { parkingService } from '../services/parkingService';
import { useAuth } from '../context/AuthContext';

function formatError(err) {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ');
  if (typeof detail === 'string') return detail;
  return 'Error inesperado';
}

export default function Movimientos() {
  const { isAdmin, isVigilante } = useAuth();
  const canRegister = isVigilante;
  const [activeMovements, setActiveMovements] = useState([]);
  const [historyMovements, setHistoryMovements] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active');
  const [entryModal, setEntryModal] = useState(false);
  const [exitModal, setExitModal] = useState(false);
  const [entryForm, setEntryForm] = useState({ placa: '', parqueo_id: '' });
  const [exitForm, setExitForm] = useState({ placa: '', parqueo_id: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [active, parks] = await Promise.all([
        movementService.getActive().catch(() => []),
        parkingService.getAll().catch(() => []),
      ]);
      setActiveMovements(active);
      setParkings(parks);

      if (isAdmin) {
        const history = await movementService.getHistory({ size: 50 }).catch(() => []);
        setHistoryMovements(history);
      }
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEntry = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await movementService.registerEntry({
        placa: entryForm.placa.toUpperCase(),
        parqueo_id: parseInt(entryForm.parqueo_id),
      });
      setEntryModal(false);
      setEntryForm({ placa: '', parqueo_id: '' });
      fetchData();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleExit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await movementService.registerExit({
        placa: exitForm.placa.toUpperCase(),
        parqueo_id: parseInt(exitForm.parqueo_id),
      });
      setExitModal(false);
      setExitForm({ placa: '', parqueo_id: '' });
      fetchData();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const movements = filter === 'active' ? activeMovements : historyMovements;

  const filtered = movements.filter((m) =>
    (m.placa || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.nombre_parqueo || '').toLowerCase().includes(search.toLowerCase())
  );

  const parkingOptions = parkings.map((p) => ({ value: String(p.id), label: p.nombre }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-navy">Movimientos</h2>
          <p className="text-sm text-gray-400">{activeMovements.length} vehículos activos</p>
        </div>
        {canRegister && (
          <div className="flex gap-2">
            <Button onClick={() => { setError(''); setEntryModal(true); }}>
              <ArrowDownToLine className="w-4 h-4" /> Registrar Entrada
            </Button>
            <Button variant="outline" onClick={() => { setError(''); setExitModal(true); }}>
              <ArrowUpFromLine className="w-4 h-4" /> Registrar Salida
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por placa..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-1">
            {[
              { key: 'active', label: 'Activos' },
              ...(isAdmin ? [{ key: 'history', label: 'Historial' }] : []),
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filter === key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Placa', 'Parqueo', 'Tipo', 'Fecha/Hora'].map((h) => (
                  <th key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">Sin movimientos</td></tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ArrowLeftRight className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-navy">{m.placa}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{m.nombre_parqueo}</td>
                    <td className="py-3 pr-4">
                      <Badge color={m.tipo === 'entrada' ? 'green' : 'blue'}>
                        {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(m.fecha_hora).toLocaleString('es-SV', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={entryModal} onClose={() => setEntryModal(false)} title="Registrar Entrada">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger">{error}</div>}
        <form onSubmit={handleEntry} className="space-y-4">
          <Input
            label="Placa del Vehículo"
            value={entryForm.placa}
            onChange={(e) => setEntryForm({ ...entryForm, placa: e.target.value.toUpperCase() })}
            placeholder="P-123-456"
            required
          />
          <Select
            label="Parqueo"
            value={entryForm.parqueo_id}
            onChange={(e) => setEntryForm({ ...entryForm, parqueo_id: e.target.value })}
            options={parkingOptions}
            placeholder="Seleccionar parqueo"
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEntryModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>
              <ArrowDownToLine className="w-4 h-4" /> Registrar Entrada
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={exitModal} onClose={() => setExitModal(false)} title="Registrar Salida">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger">{error}</div>}
        <form onSubmit={handleExit} className="space-y-4">
          <Input
            label="Placa del Vehículo"
            value={exitForm.placa}
            onChange={(e) => setExitForm({ ...exitForm, placa: e.target.value.toUpperCase() })}
            placeholder="P-123-456"
            required
          />
          <Select
            label="Parqueo"
            value={exitForm.parqueo_id}
            onChange={(e) => setExitForm({ ...exitForm, parqueo_id: e.target.value })}
            options={parkingOptions}
            placeholder="Seleccionar parqueo"
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setExitModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>
              <ArrowUpFromLine className="w-4 h-4" /> Registrar Salida
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
