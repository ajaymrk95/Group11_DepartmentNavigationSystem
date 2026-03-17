import { useApp } from '../context/AppContext';
import { Building2, Layers, DoorOpen, ScrollText, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { buildings, floors, rooms, logs } = useApp();
  const navigate = useNavigate();

  const stats = [
    { label: 'Buildings', value: buildings.length, icon: Building2, color: 'bg-navy', sub: 'registered', to: '/buildings' },
    { label: 'Floors', value: floors.length, icon: Layers, color: 'bg-steel', sub: 'mapped', to: '/floors' },
    { label: 'Rooms', value: rooms.length, icon: DoorOpen, color: 'bg-amber', sub: 'assigned', to: '/rooms', textColor: 'text-navy' },
    { label: 'Log Entries', value: logs.length, icon: ScrollText, color: 'bg-navy/80', sub: 'actions', to: '/logs' },
  ];

  const categoryCount = rooms.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recent = logs.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Dashboard</h1>
        <p className="text-steel text-sm font-body mt-1">Atlas Indoor Navigation — NIT Calicut</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <button key={s.label} onClick={() => navigate(s.to)} className="card p-5 text-left hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <s.icon size={20} className={s.textColor || 'text-cream'} />
            </div>
            <p className="text-3xl font-display font-bold text-navy">{s.value}</p>
            <p className="text-xs font-body text-steel mt-0.5 uppercase tracking-wider">{s.label}</p>
            <p className="text-xs font-body text-steel/60 mt-0.5">{s.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buildings overview */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-navy mb-4 flex items-center gap-2"><Building2 size={18} className="text-steel" /> Buildings</h2>
          <div className="space-y-3">
            {buildings.map(b => {
              const bFloors = floors.filter(f => f.buildingId === b.id);
              const bRooms = rooms.filter(r => r.buildingId === b.id);
              return (
                <div key={b.id} className="flex items-center justify-between p-3 bg-cream/60 rounded-lg hover:bg-cream transition-colors">
                  <div>
                    <p className="text-sm font-body font-medium text-navy">{b.code}</p>
                    <p className="text-xs font-body text-steel">{b.fullName}</p>
                  </div>
                  <div className="flex gap-3 text-xs text-steel font-body">
                    <span className="bg-navy/10 px-2 py-0.5 rounded">{bFloors.length} floors</span>
                    <span className="bg-amber/30 px-2 py-0.5 rounded">{bRooms.length} rooms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room categories */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-navy mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-steel" /> Room Categories</h2>
          <div className="space-y-2">
            {Object.entries(categoryCount).map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs font-body font-medium text-navy capitalize w-24">{cat}</span>
                <div className="flex-1 bg-cream rounded-full h-2">
                  <div className="bg-steel rounded-full h-2 transition-all" style={{ width: `${(count / rooms.length) * 100}%` }} />
                </div>
                <span className="text-xs font-body text-steel w-4 text-right">{count}</span>
              </div>
            ))}
          </div>

          {/* Recent logs */}
          <h2 className="font-display font-semibold text-navy mt-6 mb-3 flex items-center gap-2"><Clock size={18} className="text-steel" /> Recent Activity</h2>
          <div className="space-y-2">
            {recent.map(log => (
              <div key={log.id} className="flex items-start gap-2 text-xs font-body">
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                  log.action === 'UPDATE' ? 'bg-amber/40 text-navy' :
                  log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                  'bg-steel/20 text-steel'
                }`}>{log.action}</span>
                <span className="text-navy/80 flex-1">{log.details}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
