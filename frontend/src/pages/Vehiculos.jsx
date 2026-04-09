import { useState, useEffect } from 'react';
import { Car, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { vehicleService } from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';

function formatError(err) {
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ');
  if (typeof detail === 'string') return detail;
  return 'Error inesperado';
}

export default function Vehiculos() {
  const { isAdmin, isVigilante } = useAuth();
  const canCreateVehicle = isAdmin || isVigilante;
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ placa: '', marca: '', modelo: '', color: '', usuario_id: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ placa: '', marca: '', modelo: '', color: '', usuario_id: '' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({ placa: v.placa, marca: v.marca, modelo: v.modelo, color: v.color, usuario_id: String(v.usuario_id) });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, usuario_id: parseInt(form.usuario_id) };
      if (editing) {
        await vehicleService.update(editing.id, payload);
      } else {
        await vehicleService.create(payload);
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este vehículo?')) return;
    try {
      await vehicleService.delete(id);
      fetchVehicles();
    } catch (err) {
      alert(formatError(err));
    }
  };

  const filtered = vehicles.filter((v) =>
    v.placa?.toLowerCase().includes(search.toLowerCase()) ||
    v.marca?.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Vehículos</h2>
          <p className="text-sm text-gray-400">{vehicles.length} vehículos registrados</p>
        </div>
        {canCreateVehicle && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Nuevo Vehículo
          </Button>
        )}
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por placa, marca, modelo..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Placa', 'Marca', 'Modelo', 'Color', ...(isAdmin ? ['Acciones'] : [])].map((h) => (
                  <th key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Sin vehículos</td></tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-navy">{v.placa}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{v.marca}</td>
                    <td className="py-3 pr-4 text-gray-500">{v.modelo}</td>
                    <td className="py-3 pr-4">
                      <Badge color="teal">{v.color}</Badge>
                    </td>
                    {isAdmin && (
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors cursor-pointer">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-danger transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Vehículo' : 'Nuevo Vehículo'}>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger">{error}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Placa" value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} placeholder="P-123-456" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Toyota" required />
            <Input label="Modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Corolla" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Blanco" required />
            <Input label="ID Usuario" type="number" min="1" value={form.usuario_id} onChange={(e) => setForm({ ...form, usuario_id: e.target.value })} placeholder="1" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Guardar Cambios' : 'Crear Vehículo'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
