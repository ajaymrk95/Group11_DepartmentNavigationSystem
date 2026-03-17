import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Layout({ onLogout }: { onLogout: () => void }) {
  const { currentAdmin } = useApp();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-cream/80 border-b border-cream flex items-center justify-between px-6 flex-shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <Bell size={18} className="text-steel cursor-pointer hover:text-navy transition-colors" />
            <div className="flex items-center gap-2 text-sm font-body text-navy">
              <div className="w-7 h-7 rounded-full bg-steel flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-xs text-steel">{currentAdmin}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 bg-cream/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
