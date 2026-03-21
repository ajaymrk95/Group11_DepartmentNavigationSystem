import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Building2, Layers, DoorOpen, ScrollText, LayoutDashboard, Map, Users, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Buildings',   icon: Building2,        to: '/admin/buildings' },
  { label: 'Floors',      icon: Layers,           to: '/admin/floors' },
  { label: 'Rooms',       icon: DoorOpen,         to: '/admin/rooms' },
  { label: 'Faculty',     icon: Users,            to: '/admin/faculty' },
  { label: 'Floor Layout',icon: Map,              to: '/admin/floor-layout' },
  { label: 'Logs',        icon: ScrollText,       to: '/admin/logs' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token'); // or sessionStorage
  if (!token) return <Navigate to="/login" replace />;

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-cream overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 bg-navy flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-amber font-display text-2xl font-bold">Atlas</h1>
          <p className="text-white/50 text-xs font-body mt-0.5">ADMIN CONSOLE</p>
          <p className="text-white/40 text-xs font-body">NIT Calicut</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, icon: Icon, to }) => {
            const active = location.pathname === to;
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors
                  ${active
                    ? 'bg-amber text-navy font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>

    </div>
  );
}