import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { Building2, Plus, Pencil, Trash2, MapPin, Calendar, Layers } from 'lucide-react';
import { Building } from '../types';

function BuildingForm({ initial, onSave, onClose }: { initial?: Building | any; onSave: (b: any) => void; onClose: () => void }) {
  // Try to use backend fields if they exist, otherwise fallback to frontend array
  const initialCoordinates =
    initial?.longitude && initial?.latitude 
      ? [initial.longitude, initial.latitude] as [number, number]
      : initial?.coordinates || [75.9340, 11.3225];

  const initialOutline = initial?.outlineGeoJson || initial?.outline;

  const [form, setForm] = useState<Partial<Building>>(initial || {
    code: '', name: '', fullName: '', institute: 'National Institute of Technology Calicut',
    location: 'NIT Campus, Calicut, Kerala - 673601', yearBuilt: 2000, totalFloors: 1,
    coordinates: initialCoordinates, description: '', outline: null
  });
  const [outlineJson, setOutlineJson] = useState(initialOutline ? JSON.stringify(initialOutline, null, 2) : '');
  const [jsonError, setJsonError] = useState('');

  const set = (k: keyof Building, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.code?.trim() || !form.name?.trim() || !form.fullName?.trim()) {
      return;
    }
    let outline = null;
    if (outlineJson.trim()) {
      try { outline = JSON.parse(outlineJson); setJsonError(''); }
      catch { setJsonError('Invalid JSON for outline'); return; }
    }
    const b: any = {
      id: initial?.id || form.code!.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      code: form.code!, name: form.name!, fullName: form.fullName!,
      institute: form.institute || 'National Institute of Technology Calicut',
      location: form.location || 'NIT Campus, Calicut, Kerala - 673601',
      yearBuilt: form.yearBuilt ?? 2000,
      totalFloors: form.totalFloors ?? 1,
      longitude: form.coordinates?.[0] ?? 75.9340,
      latitude: form.coordinates?.[1] ?? 11.3225,
      description: form.description || '',
      outlineGeoJson: outline
    };
    onSave(b);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Code *</label>
          <input className="input-field" value={form.code ?? ''} onChange={e => set('code', e.target.value)} placeholder="e.g. ELHC" />
        </div>
        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Short Name *</label>
          <input className="input-field" value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="e.g. ELHC" />
        </div>
      </div>
      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Full Name *</label>
        <input className="input-field" value={form.fullName ?? ''} onChange={e => set('fullName', e.target.value)} placeholder="Electronics & Hardware Complex" />
      </div>
      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Institute</label>
        <input className="input-field" value={form.institute ?? ''} onChange={e => set('institute', e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Location</label>
        <input className="input-field" value={form.location ?? ''} onChange={e => set('location', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Year Built</label>
          <input type="number" className="input-field" value={form.yearBuilt ?? ''} onChange={e => set('yearBuilt', parseInt(e.target.value))} />
        </div>
        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Total Floors</label>
          <input type="number" className="input-field" value={form.totalFloors ?? ''} onChange={e => set('totalFloors', parseInt(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Longitude</label>
          <input
            type="number" step="0.000001" className="input-field"
            value={form.coordinates?.[0] ?? ''}
            onChange={e => set('coordinates', [parseFloat(e.target.value), form.coordinates?.[1] ?? 11.3225])}
          />
        </div>
        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Latitude</label>
          <input
            type="number" step="0.000001" className="input-field"
            value={form.coordinates?.[1] ?? ''}
            onChange={e => set('coordinates', [form.coordinates?.[0] ?? 75.9340, parseFloat(e.target.value)])}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Description</label>
        <textarea className="input-field" rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">Building Outline GeoJSON</label>
        <textarea
          className="input-field font-mono text-xs" rows={6}
          value={outlineJson}
          onChange={e => setOutlineJson(e.target.value)}
          placeholder='{"type":"FeatureCollection","features":[...]}'
        />
        {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn-primary">{initial ? 'Save Changes' : 'Add Building'}</button>
      </div>
    </div>
  );
}

const API = 'http://localhost:8080/api';
const token = () => localStorage.getItem('atlas_token') ?? '';

export default function Buildings() {
  const { floors, rooms } = useApp();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Building | any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Building | any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuildings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API}/buildings`, {
        headers: {
          'Authorization': `Bearer ${token()}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch buildings');
      const data = await res.json();
      setBuildings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const addBuilding = async (b: any) => {
    try {
      const res = await fetch(`${API}/buildings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}` 
        },
        body: JSON.stringify(b)
      });
      if (!res.ok) throw new Error('Failed to add building');
      fetchBuildings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateBuilding = async (b: any) => {
    try {
      const res = await fetch(`${API}/buildings/${b.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`
        },
        body: JSON.stringify(b)
      });
      if (!res.ok) throw new Error('Failed to update building');
      fetchBuildings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteBuilding = async (id: string) => {
    try {
      const res = await fetch(`${API}/buildings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token()}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete building');
      fetchBuildings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (b: Building) => {
    setSelected(b);
    setModal('edit');
  };

  const handleAdd = () => {
    setSelected(null);
    setModal('add');
  };

  const handleCloseModal = () => {
    setModal(null);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Buildings</h1>
          <p className="text-steel text-sm font-body mt-1">{buildings.length} buildings registered at NIT Calicut</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Building
        </button>
      </div>

      <div className="grid gap-4">
        {buildings.map(b => {
          // Safe fallbacks to prevent .split() crash on undefined fields
          const institute = b.institute ?? '';
          const location = b.location ?? '';
          const bFloors = floors.filter(f => f.buildingId === b.id);
          const bRooms = rooms.filter(r => r.buildingId === b.id);

          return (
            <div key={b.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={22} className="text-amber" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-navy text-lg">{b.code}</h3>
                      {institute && (
                        <span className="text-xs text-steel font-body bg-cream px-2 py-0.5 rounded-full">
                          {institute.split(' ').slice(0, 3).join(' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-body text-steel">{b.fullName}</p>
                    <p className="text-xs font-body text-steel/70 mt-1">{b.description}</p>
                    <div className="flex gap-4 mt-3 text-xs font-body text-steel">
                      {location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {location.split(',')[0]}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Calendar size={12} /> Est. {b.yearBuilt}</span>
                      <span className="flex items-center gap-1"><Layers size={12} /> {b.totalFloors} floors defined</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs font-body text-steel mr-2">
                    <p><span className="font-medium text-navy">{bFloors.length}</span> floors mapped</p>
                    <p><span className="font-medium text-navy">{bRooms.length}</span> rooms assigned</p>
                    <p className="text-xs mt-0.5">{((b as any).outlineGeoJson || b.outline) ? '✓ Outline set' : '⚠ No outline'}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-2 text-steel hover:text-navy hover:bg-cream rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(b)}
                    className="p-2 text-steel hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {buildings.length === 0 && (
          <div className="card p-10 text-center text-steel font-body">
            <Building2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No buildings registered yet. Click <strong>Add Building</strong> to get started.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={modal === 'add'} onClose={handleCloseModal} title="Add New Building" wide>
        <BuildingForm onSave={addBuilding} onClose={handleCloseModal} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={modal === 'edit' && !!selected} onClose={handleCloseModal} title="Edit Building" wide>
        {selected && (
          <BuildingForm
            key={selected.id}
            initial={selected}
            onSave={(updated) => {
              updateBuilding(updated);
              handleCloseModal();
            }}
            onClose={handleCloseModal}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <p className="font-body text-sm text-navy mb-4">
          Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button
            onClick={() => { deleteBuilding(deleteConfirm!.id); setDeleteConfirm(null); }}
            className="btn-danger"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}