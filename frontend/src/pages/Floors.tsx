import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Building2,
  DoorOpen,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────── */
interface Building {
  id: string; code: string; name: string; fullName: string; totalFloors: number;
}

interface Floor {
  id: string; buildingId: string; level: number; name: string; description: string;
  pathGeoJson: object | null; poiGeoJson: object | null; unitsGeoJson: object | null;
  pathToggles: Record<string, boolean>; roomCount?: number;
}

/* ─── API helper ─────────────────────────────────────────────── */
const API   = 'http://localhost:8080/api';
const token = () => localStorage.getItem('atlas_token') ?? '';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `Error ${res.status}`);
  return data as T;
}

/* ─── Floor Form ─────────────────────────────────────────────── */
function FloorForm({
  initial,
  buildingId: defaultBuildingId,
  buildings,
  onSave,
  onClose,
}: {
  initial?: Floor;
  buildingId?: string;
  buildings: Building[];
  onSave: () => void;
  onClose: () => void;
}) {
  const [buildingId,  setBuildingId]  = useState(initial?.buildingId ?? defaultBuildingId ?? buildings[0]?.id ?? '');
  const [level,       setLevel]       = useState(initial?.level ?? 1);
  const [name,        setName]        = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [pathJson,    setPathJson]    = useState(initial?.pathGeoJson  ? JSON.stringify(initial.pathGeoJson,  null, 2) : '');
  const [poiJson,     setPoiJson]     = useState(initial?.poiGeoJson   ? JSON.stringify(initial.poiGeoJson,   null, 2) : '');
  const [unitsJson,   setUnitsJson]   = useState(initial?.unitsGeoJson ? JSON.stringify(initial.unitsGeoJson, null, 2) : '');
  const [err,         setErr]         = useState('');
  const [saving,      setSaving]      = useState(false);

  const handleSave = async () => {
    setErr('');
    if (!name.trim()) { setErr('Floor name is required'); return; }

    let pathGeoJson = null, poiGeoJson = null, unitsGeoJson = null;
    try { if (pathJson.trim())  pathGeoJson  = JSON.parse(pathJson);  } catch { setErr('Invalid Path JSON');  return; }
    try { if (poiJson.trim())   poiGeoJson   = JSON.parse(poiJson);   } catch { setErr('Invalid POI JSON');   return; }
    try { if (unitsJson.trim()) unitsGeoJson = JSON.parse(unitsJson); } catch { setErr('Invalid Units JSON'); return; }

    const payload = {
      id:           initial?.id || `${buildingId}-f${level}-${Date.now()}`,
      buildingId,   level,  name,  description,
      pathGeoJson,  poiGeoJson,  unitsGeoJson,
      pathToggles:  initial?.pathToggles ?? {},
    };

    setSaving(true);
    try {
      if (initial?.id) {
        await apiFetch(`/floors/${initial.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/floors', { method: 'POST', body: JSON.stringify(payload) });
      }
      onSave();
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
            Building *
          </label>
          <select
            className="input-field"
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
            Level *
          </label>
          <input
            type="number"
            className="input-field"
            value={level}
            min={1}
            onChange={(e) => setLevel(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
          Floor Name *
        </label>
        <input
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ground Floor"
        />
      </div>

      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
          Description
        </label>
        <textarea
          className="input-field"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="border-t border-cream pt-4">
        <p className="text-xs font-body text-steel uppercase tracking-wide mb-3 font-medium">
          GeoJSON Data
        </p>

        <div className="space-y-3">
          {[
            ["Path GeoJSON",  pathJson,  setPathJson],
            ["POI GeoJSON",   poiJson,   setPoiJson],
            ["Units GeoJSON", unitsJson, setUnitsJson],
          ].map(([label, val, setter]) => (
            <div key={label as string}>
              <label className="text-xs font-body text-steel mb-1 block">
                {label as string}
              </label>
              <textarea
                className="input-field font-mono text-xs"
                rows={4}
                value={val as string}
                onChange={(e) =>
                  (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)
                }
                placeholder='{"type":"FeatureCollection","features":[...]}'
              />
            </div>
          ))}
        </div>
      </div>

      {err && <p className="text-red-500 text-xs">{err}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : initial?.id ? 'Save Changes' : 'Add Floor'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function Floors() {
  const [buildings,     setBuildings]     = useState<Building[]>([]);
  const [floors,        setFloors]        = useState<Floor[]>([]);
  const [modal,         setModal]         = useState<'add' | 'edit' | null>(null);
  const [selected,      setSelected]      = useState<Floor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Floor | null>(null);
  const [filterBuilding,setFilterBuilding]= useState('all');
  const [deleting,      setDeleting]      = useState(false);
  const [defaultBid,    setDefaultBid]    = useState<string | undefined>();

  /* Load buildings then load all their floors */
  const loadAll = async () => {
    const bs = await apiFetch<Building[]>('/buildings');
    setBuildings(bs);
    const arrays = await Promise.all(bs.map(b => apiFetch<Floor[]>(`/buildings/${b.id}/floors`)));
    setFloors(arrays.flat());
  };

  useEffect(() => { loadAll().catch(console.error); }, []);

  /* Filter / group */
  const filtered = filterBuilding === 'all'
    ? floors
    : floors.filter(f => f.buildingId === filterBuilding);

  const grouped = buildings.reduce((acc, b) => {
    acc[b.id] = filtered.filter(f => f.buildingId === b.id);
    return acc;
  }, {} as Record<string, Floor[]>);

  /* Delete */
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await apiFetch(`/floors/${deleteConfirm.id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      loadAll();
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  /* Count rooms per floor from floors endpoint (roomCount field) */
  const roomCount = (floorId: string) =>
    floors.find(f => f.id === floorId)?.roomCount ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Floors</h1>
          <p className="text-steel text-sm font-body mt-1">
            {floors.length} floors across {buildings.length} buildings
          </p>
        </div>

        <div className="flex gap-3">
          <select
            className="input-field text-sm py-2 w-48"
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
          >
            <option value="all">All Buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.code}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSelected(null);
              setDefaultBid(filterBuilding !== 'all' ? filterBuilding : undefined);
              setModal('add');
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Add Floor
          </button>
        </div>
      </div>

      {buildings
        .filter((b) => filterBuilding === 'all' || b.id === filterBuilding)
        .map((b) => {
          const bFloors = (grouped[b.id] || []).sort((a, c) => a.level - c.level);

          return (
            <div key={b.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-navy/5 border-b border-cream">
                <Building2 size={16} className="text-steel" />
                <h2 className="font-display font-semibold text-navy">{b.code}</h2>
                <span className="text-xs text-steel font-body">— {b.fullName}</span>
                <span className="ml-auto text-xs text-steel font-body">
                  {bFloors.length} / {b.totalFloors} floors
                </span>
              </div>

              {bFloors.length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center">
                    <Layers size={20} className="text-steel" />
                  </div>
                  <div>
                    <p className="text-sm font-body font-medium text-navy">No floors added yet</p>
                    <p className="text-xs text-steel font-body">Start by creating the first floor for this building</p>
                  </div>
                  <button
                    onClick={() => { setSelected(null); setDefaultBid(b.id); setModal('add'); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cream bg-white hover:bg-cream/40 text-sm font-body font-medium text-navy transition-all"
                  >
                    <Plus size={14} /> Add First Floor
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-cream">
                  {bFloors.map((floor) => (
                    <div
                      key={floor.id}
                      className="flex items-center justify-between px-5 py-4 hover:bg-cream/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-steel/20 flex items-center justify-center">
                          <span className="text-xs font-body font-bold text-navy">{floor.level}</span>
                        </div>
                        <div>
                          <p className="text-sm font-body font-medium text-navy">{floor.name}</p>
                          <p className="text-xs font-body text-steel">{floor.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-body text-steel">
                        <span className={`px-2 py-0.5 rounded-full ${floor.pathGeoJson  ? 'bg-green-100 text-green-700' : 'bg-cream text-steel/50'}`}>
                          {floor.pathGeoJson  ? '✓' : '✗'} Path
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${floor.poiGeoJson   ? 'bg-green-100 text-green-700' : 'bg-cream text-steel/50'}`}>
                          {floor.poiGeoJson   ? '✓' : '✗'} POI
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${floor.unitsGeoJson ? 'bg-green-100 text-green-700' : 'bg-cream text-steel/50'}`}>
                          {floor.unitsGeoJson ? '✓' : '✗'} Units
                        </span>
                        <span className="flex items-center gap-1">
                          <DoorOpen size={12} /> {floor.roomCount ?? 0} rooms
                        </span>

                        <button
                          onClick={() => { setSelected(floor); setModal('edit'); }}
                          className="p-1.5 text-steel hover:text-navy hover:bg-cream rounded transition-colors"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(floor)}
                          className="p-1.5 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {/* Add modal */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Add New Floor" wide>
        <FloorForm
          buildingId={defaultBid}
          buildings={buildings}
          onSave={() => { loadAll(); setModal(null); }}
          onClose={() => setModal(null)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={modal === 'edit' && !!selected} onClose={() => setModal(null)} title="Edit Floor" wide>
        {selected && (
          <FloorForm
            key={selected.id}
            initial={selected}
            buildings={buildings}
            onSave={() => { loadAll(); setModal(null); }}
            onClose={() => setModal(null)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
        <p className="font-body text-sm text-navy mb-4">
          Delete floor <strong>{deleteConfirm?.name}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger">
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}