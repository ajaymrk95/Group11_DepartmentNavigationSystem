import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Layers, DoorOpen, Map, ScrollText, LogOut, Compass } from 'lucide-react';
import { useStore } from '../../store/useStore';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/buildings', icon: Building2, label: 'Buildings' },
  { to: '/floors', icon: Layers, label: 'Floors' },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
  { to: '/floor-layout', icon: Map, label: 'Floor Layout' },
  { to: '/logs', icon: ScrollText, label: 'Activity Logs' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, adminEmail } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-20" style={{ background: '#1A3263' }}>
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#FAB95B' }}>
            <Compass size={20} color="#1A3263" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-tight">Atlas</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-xs font-semibold mb-3 px-3" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
          NAVIGATION
        </div>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'nav-active'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="px-3 py-2 mb-2">
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Signed in as</div>
          <div className="text-sm text-white font-medium truncate">{adminEmail || 'admin@nitc.ac.in'}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/20 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
