import { useState, useEffect } from 'react';
import { ParkingSquare, Plus, Pencil } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ProgressBar from '../components/ui/ProgressBar';
import { parkingService } from '../services/parkingService';
import { useAuth } from '../context/AuthContext';

function formatError(err) {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ');
  if (typeof detail === 'string') return detail;
  return 'Error inesperado';
}

export default function Parqueos() {
  const { isAdmin } = useAuth();
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', cupos_maximos: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchParkings = async () => {
    try {
      const list = await parkingService.getAll();
      const withAvailability = await Promise.all(
        list.map(async (p) => {
          try {
            const avail = await parkingService.getAvailability(p.id);
            return { ...p, cupos_ocupados: avail.cupos_ocupados, cupos_disponibles: avail.cupos_disponibles };
          } catch {
            return { ...p, cupos_ocupados: 0, cupos_disponibles: p.cupos_maximos };
          }
        })
      );
      setParkings(withAvailability);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchParkings(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', cupos_maximos: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ nombre: p.nombre, cupos_maximos: String(p.cupos_maximos) });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { nombre: form.nombre, cupos_maximos: parseInt(form.cupos_maximos) };
      if (editing) {
        await parkingService.update(editing.id, payload);
      } else {
        await parkingService.create(payload);
      }
      setModalOpen(false);
      fetchParkings();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Parqueos</h2>
          <p className="text-sm text-gray-400">{parkings.length} parqueos registrados</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Nuevo Parqueo
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Cargando...</p>
      ) : parkings.length === 0 ? (
        <Card><p className="text-gray-400 text-center py-12">No hay parqueos registrados</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {parkings.map((p) => {
            const occupied = p.cupos_ocupados ?? 0;
            const available = p.cupos_disponibles ?? p.cupos_maximos;
            const percent = p.cupos_maximos > 0 ? Math.round((occupied / p.cupos_maximos) * 100) : 0;

            return (
              <Card key={p.id} className="flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ParkingSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy">{p.nombre}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Capacidad: {p.cupos_maximos}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors cursor-pointer">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-5 space-y-3 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Disponibles</span>
                    <span className="font-bold text-navy">{available} / {p.cupos_maximos}</span>
                  </div>
                  <ProgressBar
                    value={occupied}
                    max={p.cupos_maximos}
                    color={percent > 80 ? 'bg-danger' : percent > 50 ? 'bg-warning' : 'bg-primary'}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-navy">{available}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Libres</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-navy">{occupied}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Ocupados</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Parqueo' : 'Nuevo Parqueo'}>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger">{error}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Parqueo Norte" required />
          <Input label="Cupos Máximos" type="number" min="1" value={form.cupos_maximos} onChange={(e) => setForm({ ...form, cupos_maximos: e.target.value })} placeholder="100" required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Guardar Cambios' : 'Crear Parqueo'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
