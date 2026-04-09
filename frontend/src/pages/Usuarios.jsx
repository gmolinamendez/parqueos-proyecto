import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Search, Shield } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { userService } from '../services/userService';

const rolColors = {
  administrador: 'red',
  vigilante: 'blue',
  estudiante: 'green',
};

const rolOptions = [
  { value: '1', label: 'Administrador' },
  { value: '2', label: 'Vigilante' },
  { value: '3', label: 'Estudiante' },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', contrasena: '', rol_id: '3' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', email: '', contrasena: '', rol_id: '3' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ nombre: u.nombre, email: u.email, contrasena: '', rol_id: String(u.rol_id) });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { nombre: form.nombre, email: form.email, rol_id: parseInt(form.rol_id) };
      if (form.contrasena) payload.contrasena = form.contrasena;
      if (!editing && !form.contrasena) {
        setError('La contraseña es obligatoria');
        setSaving(false);
        return;
      }
      if (editing) {
        await userService.update(editing.id, payload);
      } else {
        await userService.create(payload);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(', '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await userService.delete(id);
      fetchUsers();
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === 'string' ? detail : 'Error al eliminar');
    }
  };

  const filtered = users.filter((u) => {
    const rolName = u.rol?.nombre || '';
    return (
      u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      rolName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Usuarios</h2>
          <p className="text-sm text-gray-400">{users.length} usuarios registrados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Usuario', 'Email', 'Rol', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Sin usuarios</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {u.nombre?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-navy">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                    <td className="py-3 pr-4">
                      <Badge color={rolColors[u.rol?.nombre] || 'gray'}>
                        <Shield className="w-3 h-3 mr-1" />
                        {u.rol?.nombre || '—'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge color={u.estado ? 'green' : 'red'}>
                        {u.estado ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy transition-colors cursor-pointer">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-danger transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger">{error}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="usuario@parku.edu.sv" required />
          <Input
            label={editing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            type="password"
            value={form.contrasena}
            onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
            placeholder="••••••••"
            required={!editing}
          />
          <Select label="Rol" value={form.rol_id} onChange={(e) => setForm({ ...form, rol_id: e.target.value })} options={rolOptions} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
