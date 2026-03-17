import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import {
  LayoutDashboard, Building2, Layers, DoorOpen,
  FileText, LogOut, MapPin, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/buildings', icon: Building2, label: 'Buildings' },
  { to: '/floors', icon: Layers, label: 'Floors' },
  { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
  { to: '/logs', icon: FileText, label: 'Activity Logs' },
]

export default function Layout({ children }) {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-navy flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center">
              <MapPin size={16} className="text-navy" />
            </div>
            <div>
              <p className="font-display text-cream font-semibold text-sm leading-tight">Atlas</p>
              <p className="text-cream/40 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Institution */}
        <div className="px-5 py-3 border-b border-white/10">
          <p className="text-cream/40 text-xs leading-relaxed">National Institute of Technology Calicut</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'nav-item-active flex items-center gap-3' : 'nav-item-inactive flex items-center gap-3'
              }
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={12} className="opacity-30" />
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 mb-2">
            <div className="w-7 h-7 rounded-full bg-amber flex items-center justify-center text-navy font-bold text-xs">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cream text-xs font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-cream/40 text-xs truncate">{user?.role || 'Administrator'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-cream/50 hover:text-cream hover:bg-white/10 transition-colors text-sm"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-cream">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
