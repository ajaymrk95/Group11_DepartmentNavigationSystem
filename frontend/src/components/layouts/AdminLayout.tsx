import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Map,
  ScrollText,
  LogOut,
  Bell,
  User,
  Users,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Buildings',    icon: Building2,        to: '/admin/buildings' },
  { label: 'Rooms',        icon: DoorOpen,         to: '/admin/rooms' },
  { label: 'Faculty',      icon: Users,            to: '/admin/faculty' },
  { label: 'Path',         icon: Map,              to: '/admin/Path' },
  { label: 'Logs',         icon: ScrollText,       to: '/admin/logs' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {/* ── Root ── */}
      <div className="flex h-screen w-screen overflow-hidden bg-[#EDE8DC] font-['Outfit',sans-serif]">
        
        {/* ── Sidebar ── */}
        <aside className="flex h-screen w-[200px] min-w-[200px] shrink-0 flex-col bg-[#1A3263]">
          <div className="border-b border-white/[.08] px-[18px] pb-[18px] pt-[22px]">
            <div className="text-[22px] font-[800] leading-none tracking-[-0.02em] text-[#FAB95B]">
              Atlas
            </div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white/40">
              Admin Console
            </div>
            <div className="mt-[2px] text-[11px] text-white/30">
              NIT Calicut
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-[8px] py-[10px] [&::-webkit-scrollbar]:hidden">
            {navItems.map(({ label, icon: Icon, to }) => {
              const active = location.pathname === to;
              return (
                <button
                  key={to}
                  className={`flex w-full items-center gap-[9px] whitespace-nowrap rounded-[9px] px-[11px] py-[9px] text-left text-[13px] transition-colors duration-150 ${
                    active
                      ? 'bg-[#FAB95B] font-semibold text-[#1A3263]'
                      : 'font-normal text-white/50 hover:bg-white/[.08] hover:text-white/[.85]'
                  }`}
                  onClick={() => navigate(to)}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* ── Sidebar Bottom Area ── */}
          <div className="flex flex-col gap-2 border-t border-white/[.07] px-[8px] pb-[18px] pt-[12px]">
            
            {/* Action Buttons */}
            <div className="flex items-center justify-around px-2 mb-1">
              <button className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full bg-white/[.05] text-white/50 transition-colors duration-150 hover:bg-white/[.12] hover:text-white/[.85]">
                <Bell size={16} strokeWidth={1.8} />
              </button>
              <button className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full bg-white/[.05] text-white/50 transition-colors duration-150 hover:bg-white/[.12] hover:text-white/[.85]">
                <User size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* Sign Out */}
            <button
              className="flex w-full cursor-pointer items-center gap-[9px] rounded-[9px] bg-transparent px-[11px] py-[9px] text-[13px] text-white/40 transition-colors duration-150 hover:bg-white/[.08] hover:text-white/[.75]"
              onClick={handleSignOut}
            >
              <LogOut size={16} strokeWidth={1.8} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1A3263]/15 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[5px]">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}