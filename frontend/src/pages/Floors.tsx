import { useState } from "react";
import { useApp } from "../context/AppContext";
import Modal from "../components/Modal";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Building2,
  DoorOpen,
} from "lucide-react";
import { Floor } from "../types";

function FloorForm({
  initial,
  buildingId,
  level,
  onSave,
  onClose,
}: {
  initial?: Floor;
  buildingId?: string;
  level?: number;
  onSave: (f: Floor) => void;
  onClose: () => void;
}) {
  const { buildings } = useApp();

  const [form, setForm] = useState<Partial<Floor>>(
    initial || {
      buildingId: buildingId || buildings[0]?.id || "",
      level: level || 1,
      name: "",
      description: "",
      pathGeoJSON: null,
      poiGeoJSON: null,
      unitsGeoJSON: null,
      pathToggles: {},
    },
  );

  const [pathJson, setPathJson] = useState(
    initial?.pathGeoJSON ? JSON.stringify(initial.pathGeoJSON, null, 2) : "",
  );
  const [poiJson, setPoiJson] = useState(
    initial?.poiGeoJSON ? JSON.stringify(initial.poiGeoJSON, null, 2) : "",
  );
  const [unitsJson, setUnitsJson] = useState(
    initial?.unitsGeoJSON ? JSON.stringify(initial.unitsGeoJSON, null, 2) : "",
  );
  const [err, setErr] = useState("");

  const set = (k: keyof Floor, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    setErr("");

    let pathGeoJSON = null;
    let poiGeoJSON = null;
    let unitsGeoJSON = null;

    try {
      if (pathJson.trim()) pathGeoJSON = JSON.parse(pathJson);
    } catch {
      setErr("Invalid Path JSON");
      return;
    }

    try {
      if (poiJson.trim()) poiGeoJSON = JSON.parse(poiJson);
    } catch {
      setErr("Invalid POI JSON");
      return;
    }

    try {
      if (unitsJson.trim()) unitsGeoJSON = JSON.parse(unitsJson);
    } catch {
      setErr("Invalid Units JSON");
      return;
    }

    const f: Floor = {
      id: initial?.id || `${form.buildingId}-f${form.level}-${Date.now()}`,
      buildingId: form.buildingId!,
      level: form.level!,
      name: form.name!,
      description: form.description!,
      pathGeoJSON,
      poiGeoJSON,
      unitsGeoJSON,
      pathToggles: initial?.pathToggles || {},
    };

    onSave(f);
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
            onChange={(e) => set("buildingId", e.target.value)}
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
            value={form.level}
            min={1}
            onChange={(e) => set("level", parseInt(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-body text-steel uppercase tracking-wide mb-1 block">
          Floor Name *
        </label>
        <input
          className="input-field"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
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
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="border-t border-cream pt-4">
        <p className="text-xs font-body text-steel uppercase tracking-wide mb-3 font-medium">
          GeoJSON Data
        </p>

        <div className="space-y-3">
          {[
            ["Path GeoJSON", pathJson, setPathJson],
            ["POI GeoJSON", poiJson, setPoiJson],
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
                  (setter as React.Dispatch<React.SetStateAction<string>>)(
                    e.target.value,
                  )
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
        <button onClick={handleSave} className="btn-primary">
          {initial ? "Save Changes" : "Add Floor"}
        </button>
      </div>
    </div>
  );
}

export default function Floors() {
  const { buildings, floors, rooms, addFloor, updateFloor, deleteFloor } =
    useApp();

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Floor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Floor | null>(null);
  const [filterBuilding, setFilterBuilding] = useState("all");

  const filtered =
    filterBuilding === "all"
      ? floors
      : floors.filter((f) => f.buildingId === filterBuilding);

  const grouped = buildings.reduce(
    (acc, b) => {
      acc[b.id] = filtered.filter((f) => f.buildingId === b.id);
      return acc;
    },
    {} as Record<string, Floor[]>,
  );

  const handleAdd = () => {
    setSelected({
      id: "",
      buildingId: filterBuilding !== "all" ? filterBuilding : buildings[0]?.id,
      level: 1,
      name: "",
      description: "",
      pathGeoJSON: null,
      poiGeoJSON: null,
      unitsGeoJSON: null,
      pathToggles: {},
    } as Floor);

    setModal("add");
  };

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
              <option key={b.id} value={b.id}>
                {b.code}
              </option>
            ))}
          </select>

          <button
            onClick={handleAdd}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Add Floor
          </button>
        </div>
      </div>

      {buildings
        .filter((b) => filterBuilding === "all" || b.id === filterBuilding)
        .map((b) => {
          const bFloors = grouped[b.id] || [];

          return (
            <div key={b.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 bg-navy/5 border-b border-cream">
                <Building2 size={16} className="text-steel" />
                <h2 className="font-display font-semibold text-navy">
                  {b.code}
                </h2>
                <span className="text-xs text-steel font-body">
                  — {b.fullName}
                </span>
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
      <p className="text-sm font-body font-medium text-navy">
        No floors added yet
      </p>
      <p className="text-xs text-steel font-body">
        Start by creating the first floor for this building
      </p>
    </div>

    <button
      onClick={() => {
        setSelected({
          id: '',
          buildingId: b.id,
          level: 1,
          name: '',
          description: '',
          pathGeoJSON: null,
          poiGeoJSON: null,
          unitsGeoJSON: null,
          pathToggles: {}
        } as Floor);
        setModal('add');
      }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cream bg-white hover:bg-cream/40 text-sm font-body font-medium text-navy transition-all"
    >
      <Plus size={14} />
      Add First Floor
    </button>

  </div>
) : (
                <div className="divide-y divide-cream">
                  {bFloors
                    .sort((a, b) => a.level - b.level)
                    .map((floor) => {
                      const floorRooms = rooms.filter(
                        (r) => r.floorId === floor.id,
                      );

                      return (
                        <div
                          key={floor.id}
                          className="flex items-center justify-between px-5 py-4 hover:bg-cream/40 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-steel/20 flex items-center justify-center">
                              <span className="text-xs font-body font-bold text-navy">
                                {floor.level}
                              </span>
                            </div>

                            <div>
                              <p className="text-sm font-body font-medium text-navy">
                                {floor.name}
                              </p>
                              <p className="text-xs font-body text-steel">
                                {floor.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-body text-steel">
                            <span className="flex items-center gap-1">
                              <DoorOpen size={12} /> {floorRooms.length} rooms
                            </span>

                            <button
                              onClick={() => {
                                setSelected(floor);
                                setModal("edit");
                              }}
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
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}

      <Modal
        open={modal === "add"}
        onClose={() => setModal(null)}
        title="Add New Floor"
        wide
      >
        {selected && (
          <FloorForm
            initial={selected}
            buildingId={selected.buildingId}
            onSave={addFloor}
            onClose={() => setModal(null)}
          />
        )}
      </Modal>

      <Modal
        open={modal === "edit" && !!selected}
        onClose={() => setModal(null)}
        title="Edit Floor"
        wide
      >
        {selected && (
          <FloorForm
            initial={selected}
            onSave={updateFloor}
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
          Delete floor <strong>{deleteConfirm?.name}</strong>?
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
              deleteFloor(deleteConfirm!.id);
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
