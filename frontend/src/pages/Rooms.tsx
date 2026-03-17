import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { DoorOpen, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Room, RoomCategory } from '../types';

const CATEGORIES: RoomCategory[] = ['classroom', 'lab', 'hall', 'office', 'toilet', 'stairs', 'corridor', 'other'];

const CAT_COLORS: Record<RoomCategory, string> = {
  classroom: 'bg-blue-100 text-blue-700',
  lab: 'bg-purple-100 text-purple-700',
  hall: 'bg-amber/40 text-navy',
  office: 'bg-green-100 text-green-700',
  toilet: 'bg-gray-100 text-gray-600',
  stairs: 'bg-orange-100 text-orange-700',
  corridor: 'bg-teal-100 text-teal-700',
  other: 'bg-cream text-steel'
};

function RoomForm({
  initial,
  onSave,
  onClose
}: {
  initial?: Room;
  onSave: (r: Room) => void;
  onClose: () => void;
}) {

  const { buildings, floors } = useApp();

  const [form, setForm] = useState<Partial<Room>>(
    initial || {
      buildingId: buildings[0]?.id || '',
      floorId: '',
      roomNo: '',
      name: '',
      category: 'classroom',
      level: 1,
      capacity: undefined,
      description: '',
      accessible: true,
      featureId: undefined
    }
  );

  const set = (k: keyof Room, v: unknown) =>
    setForm(p => ({ ...p, [k]: v }));

  const buildingFloors = floors.filter(
    f => f.buildingId === form.buildingId
  );

  const handleSave = () => {

    const r: Room = {
      id: initial?.id || `room-${Date.now()}`,
      buildingId: form.buildingId!,
      floorId: form.floorId!,
      roomNo: form.roomNo!,
      name: form.name!,
      category: form.category!,
      level: form.level!,
      capacity: form.capacity,
      description: form.description,
      accessible: form.accessible!,
      featureId: form.featureId
    };

    onSave(r);
    onClose();
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
            value={form.buildingId}
            onChange={e => {
              set('buildingId', e.target.value);
              set('floorId', '');
            }}
          >
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.code}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
            Floor *
          </label>
          <select
            className="input-field"
            value={form.floorId}
            onChange={e => {
              set('floorId', e.target.value);
              const f = floors.find(fl => fl.id === e.target.value);
              if (f) set('level', f.level);
            }}
          >
            <option value="">Select floor...</option>
            {buildingFloors.map(f => (
              <option key={f.id} value={f.id}>
                Level {f.level} — {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
            Room No *
          </label>
          <input
            className="input-field"
            value={form.roomNo}
            onChange={e => set('roomNo', e.target.value)}
            placeholder="101"
          />
        </div>

        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
            Category *
          </label>
          <select
            className="input-field"
            value={form.category}
            onChange={e => set('category', e.target.value as RoomCategory)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
          Room Name *
        </label>
        <input
          className="input-field"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="ELHC 101"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
            Capacity
          </label>
          <input
            type="number"
            className="input-field"
            value={form.capacity || ''}
            onChange={e =>
              set(
                'capacity',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            placeholder="60"
          />
        </div>

        <div>
          <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
            GeoJSON Feature ID
          </label>
          <input
            type="number"
            className="input-field"
            value={form.featureId || ''}
            onChange={e =>
              set(
                'featureId',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            placeholder="1"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
          Description
        </label>
        <textarea
          className="input-field"
          rows={2}
          value={form.description || ''}
          onChange={e => set('description', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="accessible"
          checked={form.accessible}
          onChange={e => set('accessible', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="accessible" className="text-sm font-body text-navy">
          Accessible (wheelchair / mobility)
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>

        <button onClick={handleSave} className="btn-primary">
          {initial ? 'Save Changes' : 'Add Room'}
        </button>
      </div>

    </div>
  );
}

export default function Rooms() {

  const {
    buildings,
    floors,
    rooms,
    addRoom,
    updateRoom,
    deleteRoom
  } = useApp();

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Room | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Room | null>(null);

  const [search, setSearch] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterCat, setFilterCat] = useState('all');

  const filtered = rooms.filter(r => {

    if (filterBuilding !== 'all' && r.buildingId !== filterBuilding)
      return false;

    if (filterCat !== 'all' && r.category !== filterCat)
      return false;

    if (
      search &&
      !r.name.toLowerCase().includes(search.toLowerCase()) &&
      !r.roomNo?.toLowerCase().includes(search.toLowerCase())
    )
      return false;

    return true;
  });

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="font-display text-3xl font-bold text-navy">
            Rooms
          </h1>

          <p className="text-steel text-sm font-body mt-1">
            {rooms.length} rooms assigned across all floors
          </p>
        </div>

        <button
          onClick={() => {
            setSelected(null);
            setModal('add');
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Room
        </button>

      </div>

      <div className="flex gap-3 items-center">

        <div className="relative flex-1 max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-steel/60"
          />

          <input
            className="input-field pl-9"
            placeholder="Search rooms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input-field text-sm py-2 w-44"
          value={filterBuilding}
          onChange={e => setFilterBuilding(e.target.value)}
        >
          <option value="all">All Buildings</option>

          {buildings.map(b => (
            <option key={b.id} value={b.id}>
              {b.code}
            </option>
          ))}
        </select>

        <select
          className="input-field text-sm py-2 w-40"
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="all">All Categories</option>

          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

      </div>

      <div className="card overflow-hidden">

        <table className="w-full">

          <thead>
            <tr className="bg-navy/5 border-b border-cream">
              {['Room No','Name','Building','Floor','Category','Capacity','Accessible','']
                .map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-body font-semibold text-steel uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-cream">

            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-8 text-steel font-body text-sm"
                >
                  No rooms found
                </td>
              </tr>
            ) : (

              filtered.map(room => {

                const building = buildings.find(
                  b => b.id === room.buildingId
                );

                const floor = floors.find(
                  f => f.id === room.floorId
                );

                return (
                  <tr
                    key={room.id}
                    className="hover:bg-cream/40 transition-colors"
                  >

                    <td className="px-4 py-3 font-mono text-sm text-navy font-medium">
                      {room.roomNo}
                    </td>

                    <td className="px-4 py-3 text-sm font-body text-navy">
                      {room.name}
                    </td>

                    <td className="px-4 py-3 text-xs font-body text-steel">
                      {building?.code}
                    </td>

                    <td className="px-4 py-3 text-xs font-body text-steel">
                      {floor?.name}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-body px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[room.category]}`}
                      >
                        {room.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs font-body text-steel">
                      {room.capacity || '—'}
                    </td>

                    <td className="px-4 py-3 text-xs font-body">
                      {room.accessible
                        ? <span className="text-green-600">✓ Yes</span>
                        : <span className="text-steel">No</span>}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-1">

                        <button
                          onClick={() => {
                            setSelected(room);
                            setModal('edit');
                          }}
                          className="p-1.5 text-steel hover:text-navy hover:bg-cream rounded transition-colors"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(room)}
                          className="p-1.5 text-steel hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })

            )}

          </tbody>

        </table>

      </div>

      <Modal
        open={modal === 'add'}
        onClose={() => setModal(null)}
        title="Add Room"
        wide
      >
        <RoomForm
          onSave={addRoom}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={modal === 'edit' && !!selected}
        onClose={() => setModal(null)}
        title="Edit Room"
        wide
      >
        {selected && (
          <RoomForm
            initial={selected}
            onSave={updateRoom}
            onClose={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >

        <p className="font-body text-sm text-navy mb-4">
          Delete room <strong>{deleteConfirm?.name}</strong>?
        </p>

        <div className="flex justify-end gap-2">

          <button
            onClick={() => setDeleteConfirm(null)}
            className="btn-secondary"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              deleteRoom(deleteConfirm!.id);
              setDeleteConfirm(null);
            }}
            className="btn-danger"
          >
            Delete
          </button>

        </div>

      </Modal>

    </div>
  );
}