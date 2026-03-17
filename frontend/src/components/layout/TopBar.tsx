import { Bell, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const { logs } = useStore();
  const recentCount = logs.filter(l => {
    const d = new Date(l.timestamp);
    return Date.now() - d.getTime() < 1000 * 60 * 60 * 24;
  }).length;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: '#1A3263' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: '#547792' }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="relative">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors" style={{ background: '#E8E2DB' }}>
            <Bell size={17} color="#1A3263" />
          </div>
          {recentCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: '#FAB95B', color: '#1A3263', fontSize: '10px' }}>
              {recentCount > 9 ? '9+' : recentCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
