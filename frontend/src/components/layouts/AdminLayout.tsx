import { useState } from 'react';
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
  ChevronLeft,
  Menu
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Buildings',    icon: Building2,       to: '/admin/buildings' },
  { label: 'Rooms',        icon: DoorOpen,        to: '/admin/rooms' },
  { label: 'Faculty',      icon: Users,           to: '/admin/faculty' },
  { label: 'Path',         icon: Map,             to: '/admin/Path' },
  { label: 'Logs',         icon: ScrollText,      to: '/admin/logs' },
  { label: 'Profile',      icon: User,            to: '/admin/profile' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ── State for collapsing the sidebar ──
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        <aside 
          className={`flex h-screen shrink-0 flex-col bg-[#1A3263] transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-[72px]' : 'w-[200px]'
          }`}
        >
          {/* Brand & Toggle Area */}
          <div className={`flex items-center border-b border-white/[.08] pb-[18px] pt-[22px] ${
            isCollapsed ? 'justify-center px-0' : 'justify-between px-[18px]'
          }`}>
            
            {/* Hide text when collapsed */}
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="text-[22px] font-[800] leading-none tracking-[-0.02em] text-[#FAB95B]">
                  Atlas
                </div>
                <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white/40">
                  Admin Console
                </div>
              </div>
            )}

            {/* Toggle Button */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white/[.05] text-white/50 transition-colors hover:bg-white/[.12] hover:text-white/[.85]"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-1 flex-col gap-[4px] overflow-y-auto overflow-x-hidden px-[8px] py-[10px] [&::-webkit-scrollbar]:hidden">
            {navItems.map(({ label, icon: Icon, to }) => {
              const active = location.pathname === to;
              return (
                <button
                  key={to}
                  title={isCollapsed ? label : undefined} // Tooltip for collapsed state
                  className={`flex items-center rounded-[9px] transition-colors duration-150 ${
                    isCollapsed 
                      ? 'justify-center py-[10px]' 
                      : 'w-full gap-[9px] px-[11px] py-[9px] text-left text-[13px] whitespace-nowrap'
                  } ${
                    active
                      ? 'bg-[#FAB95B] font-semibold text-[#1A3263]'
                      : 'font-normal text-white/50 hover:bg-white/[.08] hover:text-white/[.85]'
                  }`}
                  onClick={() => navigate(to)}
                >
                  <Icon size={isCollapsed ? 20 : 16} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
                  {!isCollapsed && <span>{label}</span>}
                </button>
              );
            })}
          </nav>

          {/* ── Sidebar Bottom Area ── */}
          <div className={`flex border-t border-white/[.07] pb-[18px] pt-[12px] transition-all ${
            isCollapsed ? 'flex-col items-center gap-3 px-2' : 'flex-col gap-2 px-[8px]'
          }`}>
            
            {/* Action Buttons (Bell/User) */}
            <div className={`flex ${isCollapsed ? 'flex-col gap-3' : 'items-center justify-around px-2 mb-1'}`}>
              <button title="Notifications" className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[.05] text-white/50 transition-colors duration-150 hover:bg-white/[.12] hover:text-white/[.85]">
                <Bell size={16} strokeWidth={1.8} />
              </button>
              <button title="Profile" className="flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/[.05] text-white/50 transition-colors duration-150 hover:bg-white/[.12] hover:text-white/[.85]">
                <User size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* Sign Out */}
            <button
              title={isCollapsed ? "Sign Out" : undefined}
              className={`flex cursor-pointer items-center rounded-[9px] bg-transparent text-white/40 transition-colors duration-150 hover:bg-white/[.08] hover:text-white/[.75] ${
                isCollapsed ? 'justify-center p-[10px]' : 'w-full gap-[9px] px-[11px] py-[9px] text-[13px]'
              }`}
              onClick={handleSignOut}
            >
              <LogOut size={isCollapsed ? 18 : 16} strokeWidth={1.8} className="shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <main className="flex flex-1 flex-col h-full w-full overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#1A3263]/15 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar]:h-[5px]">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}