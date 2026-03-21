import { Building2, Layers, DoorOpen, ScrollText, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ================= TYPES ================= */

type Building = {
  id: number;
  name: string;
  isAccessible: boolean;
  description: string;
  floors: number;
  tags: string[];
};

type Room = {
  id: number;
  roomNo: string;
  floor: number;
  category: "toilet" | "classroom" | "office" | "lab";
  name: string;
  buildingId: number;
};

type Floor = {
  id: number;
  level: number;
  buildingId: number;
};

type LogEntry = {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  details: string;
};

/* ================= HARDCODE DATA ================= */

const buildings: Building[] = [
  {
    id: 1,
    name: "CSE Block",
    isAccessible: true,
    description: "Computer Science Department",
    floors: 3,
    tags: ["academic"]
  },
  {
    id: 2,
    name: "EEE Block",
    isAccessible: true,
    description: "Electrical Department",
    floors: 2,
    tags: ["lab"]
  }
];

const floors: Floor[] = [
  { id: 1, level: 1, buildingId: 1 },
  { id: 2, level: 2, buildingId: 1 },
  { id: 3, level: 1, buildingId: 2 }
];

const rooms: Room[] = [
  { id: 1, roomNo: "101", floor: 1, category: "classroom", name: "CSE Class 1", buildingId: 1 },
  { id: 2, roomNo: "102", floor: 1, category: "lab", name: "AI Lab", buildingId: 1 },
  { id: 3, roomNo: "201", floor: 2, category: "office", name: "HOD Room", buildingId: 1 },
  { id: 4, roomNo: "001", floor: 1, category: "toilet", name: "Restroom", buildingId: 2 }
];

const logs: LogEntry[] = [
  { id: 1, action: "CREATE", details: "Added new AI Lab in CSE Block" },
  { id: 2, action: "UPDATE", details: "Updated building accessibility" },
  { id: 3, action: "DELETE", details: "Removed deprecated room entry" }
];

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Buildings', value: buildings.length, icon: Building2, color: 'bg-navy', sub: 'Campus infrastructure', to: '/buildings' },
    { label: 'Floors', value: floors.length, icon: Layers, color: 'bg-steel', sub: 'Navigable levels', to: '/floors' },
    { label: 'Rooms', value: rooms.length, icon: DoorOpen, color: 'bg-amber', sub: 'Mapped spaces', to: '/rooms', textColor: 'text-navy' },
    { label: 'Logs', value: logs.length, icon: ScrollText, color: 'bg-navy/80', sub: 'System activity', to: '/logs' },
  ];

  const categoryCount = rooms.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recent = logs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">
          Atlas Dashboard
        </h1>
        <p className="text-steel text-sm font-body mt-1">
          Smart Indoor Navigation System — NIT Calicut
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={() => navigate(s.to)}
            className="card p-5 text-left hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <s.icon size={20} className={s.textColor || 'text-cream'} />
            </div>
            <p className="text-3xl font-display font-bold text-navy">{s.value}</p>
            <p className="text-xs font-body text-steel uppercase tracking-wider">{s.label}</p>
            <p className="text-xs font-body text-steel/60">{s.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Buildings */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-navy mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-steel" />
            Campus Buildings Overview
          </h2>

          {buildings.map(b => {
            const bFloors = floors.filter(f => f.buildingId === b.id);
            const bRooms = rooms.filter(r => r.buildingId === b.id);

            return (
              <div key={b.id} className="flex justify-between p-3 bg-cream/60 rounded-lg mb-2">
                <div>
                  <p className="text-sm font-medium text-navy">{b.name}</p>
                  <p className="text-xs text-steel">{b.description}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span>{bFloors.length} floors</span>
                  <span>{bRooms.length} rooms</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Categories + Logs */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-navy mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-steel" />
            Room Distribution Insights
          </h2>

          {Object.entries(categoryCount).map(([cat, count]) => (
            <div key={cat} className="flex justify-between text-sm mb-1">
              <span className="capitalize">{cat}</span>
              <span>{count}</span>
            </div>
          ))}

          <h2 className="font-display font-semibold text-navy mt-6 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-steel" />
            Recent System Activity
          </h2>

          {recent.map(log => (
            <div key={log.id} className="text-xs mb-1">
              <strong>{log.action}</strong>: {log.details}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}