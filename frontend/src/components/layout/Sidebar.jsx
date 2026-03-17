import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, Layers, DoorOpen, Map, ClipboardList, LogOut } from "lucide-react";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/buildings", icon: Building2, label: "Buildings" },
  { to: "/floors", icon: Layers, label: "Floors" },
  { to: "/rooms", icon: DoorOpen, label: "Rooms" },
  { to: "/floor-layout", icon: Map, label: "Floor Layout" },
  { to: "/logs", icon: ClipboardList, label: "Activity Logs" },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="w-64 min-h-screen flex flex-col bg-[#1A3263] text-white">
      <div className="px-6 py-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FAB95B] flex items-center justify-center">
            <Map size={18} className="text-[#1A3263]" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wider">ATLAS</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#FAB95B] text-[#1A3263]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#547792] flex items-center justify-center text-xs font-bold">A</div>
          <div>
            <div className="text-xs font-semibold">Admin</div>
            <div className="text-[10px] text-white/40">NIT Calicut</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
