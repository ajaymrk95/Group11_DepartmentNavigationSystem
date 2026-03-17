import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Layers, DoorOpen, MapPin, ScrollText, LogOut, Globe } from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/buildings', icon: Building2, label: 'Buildings' },
  { to: '/floors', icon: Layers, label: 'Floors' },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
  { to: '/map', icon: MapPin, label: 'Floor Layout' },
  { to: '/addlocation', icon: Globe, label: 'Add Locations' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
];

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="w-64 bg-navy flex flex-col min-h-screen">
      <div className="px-6 py-8 border-b border-white/10">
        <h1 className="font-display text-2xl font-bold text-amber leading-tight">Atlas</h1>
        <p className="text-steel/80 text-xs font-body mt-1 tracking-wide uppercase">Admin Console</p>
        <p className="text-cream/50 text-xs font-body mt-1">NIT Calicut</p>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${
              isActive
                ? 'bg-amber text-navy shadow-sm'
                : 'text-cream/70 hover:bg-white/10 hover:text-cream'
            }`
          }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-6">
        <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-body font-medium text-cream/60 hover:bg-red-500/20 hover:text-red-300 transition-all">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
