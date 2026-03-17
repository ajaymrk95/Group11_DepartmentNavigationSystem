import { useApp } from '../context/AppContext';
import { ScrollText, Building2, Layers, DoorOpen, MapPin, User } from 'lucide-react';
import { useState } from 'react';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-amber/40 text-navy',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-blue-100 text-blue-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
};

const ENTITY_ICONS: Record<string, React.FC<{ size: number; className?: string }>> = {
  Building: Building2,
  Floor: Layers,
  Room: DoorOpen,
  Path: MapPin,
  POI: MapPin,
  Auth: User,
};

export default function Logs() {
  const { logs } = useApp();
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');

  const filtered = logs.filter(l => {
    if (filterAction !== 'all' && l.action !== filterAction) return false;
    if (filterEntity !== 'all' && l.entity !== filterEntity) return false;
    return true;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Activity Logs</h1>
        <p className="text-steel text-sm font-body mt-1">{logs.length} recorded admin actions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select className="input-field text-sm py-2 w-40" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value="all">All Actions</option>
          {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="input-field text-sm py-2 w-40" value={filterEntity} onChange={e => setFilterEntity(e.target.value)}>
          <option value="all">All Entities</option>
          {['Building', 'Floor', 'Room', 'Path', 'POI', 'Auth'].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <span className="text-xs font-body text-steel self-center ml-2">{filtered.length} entries</span>
      </div>

      <div className="card overflow-hidden">
        <div className="divide-y divide-cream">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-steel font-body text-sm">
              <ScrollText size={28} className="mx-auto mb-2 opacity-30" />
              No log entries found
            </div>
          ) : filtered.map(log => {
            const Icon = ENTITY_ICONS[log.entity] || User;
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-cream/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={15} className="text-steel" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || 'bg-cream text-steel'}`}>{log.action}</span>
                    <span className="text-xs font-body font-medium text-navy">{log.entity}</span>
                    {log.entityName && <span className="text-xs font-body text-steel">— {log.entityName}</span>}
                  </div>
                  <p className="text-xs font-body text-navy/80 mt-1">{log.details}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-body text-steel/60">
                    <span>{log.admin}</span>
                    <span>•</span>
                    <span>{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
