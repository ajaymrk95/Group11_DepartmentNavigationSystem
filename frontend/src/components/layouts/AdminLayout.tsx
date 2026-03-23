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
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Buildings',     icon: Building2,        to: '/admin/buildings' },
  // { label: 'Floors',        icon: Layers,           to: '/admin/floors' },
  { label: 'Rooms',         icon: DoorOpen,         to: '/admin/rooms' },
  { label: 'Faculty',        icon: Users,           to: '/admin/faculty' },
  { label: 'Path',  icon: Map,              to: '/admin/Path' },
  // { label: 'Add Locations', icon: MapPin,           to: '/admin/add-location' },
  { label: 'Logs',          icon: ScrollText,       to: '/admin/logs' },
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

        *, *::before, *::after { box-sizing: border-box;}

        html, body, #root {
          height: 100%;
          width: 100%;
          overflow: hidden;
        }

        .al-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          font-family: 'Outfit', sans-serif;
          background: #EDE8DC;
          overflow: hidden;
        }

        /* ══ Sidebar ══ */
        .al-sidebar {
          width: 200px;
          min-width: 200px;
          background: #1A3263;
          display: flex;
          flex-direction: column;
          height: 100vh;
          flex-shrink: 0;
        }

        .al-brand {
          padding: 22px 18px 18px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .al-brand-name {
          font-size: 22px;
          font-weight: 800;
          color: #FAB95B;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .al-brand-role {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,.4);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .al-brand-org {
          font-size: 11px;
          color: rgba(255,255,255,.3);
          margin-top: 2px;
        }

        .al-nav {
          flex: 1;
          padding: 10px 8px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .al-nav::-webkit-scrollbar { display: none; }

        .al-nav-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 9px 11px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,.5);
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          text-align: left;
          transition: background .15s, color .15s;
          white-space: nowrap;
        }
        .al-nav-btn:hover {
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.85);
        }
        .al-nav-btn.active {
          background: #FAB95B;
          color: #1A3263;
          font-weight: 600;
        }

        .al-signout-wrap {
          padding: 8px 8px 18px;
          border-top: 1px solid rgba(255,255,255,.07);
        }
        .al-signout-btn {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 9px 11px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,.4);
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: background .15s, color .15s;
        }
        .al-signout-btn:hover {
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.75);
        }

        /* ══ Main area ══ */
        .al-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;       /* critical: prevents flex child overflow */
        }

        .al-topbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 12px 24px;
          background: #EDE8DC;
          flex-shrink: 0;
        }

        .al-topbar-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(26,50,99,.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1A3263;
          transition: background .15s;
        }
        .al-topbar-btn:hover { background: rgba(26,50,99,.14); }

        .al-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          width: 100%;
        }
        .al-content::-webkit-scrollbar { width: 5px; }
        .al-content::-webkit-scrollbar-track { background: transparent; }
        .al-content::-webkit-scrollbar-thumb {
          background: rgba(26,50,99,.15);
          border-radius: 99px;
        }
      `}</style>

      <div className="al-root">

        {/* ── Sidebar ── */}
        <aside className="al-sidebar">
          <div className="al-brand">
            <div className="al-brand-name">Atlas</div>
            <div className="al-brand-role">Admin Console</div>
            <div className="al-brand-org">NIT Calicut</div>
          </div>

          <nav className="al-nav">
            {navItems.map(({ label, icon: Icon, to }) => {
              const active = location.pathname === to;
              return (
                <button
                  key={to}
                  className={`al-nav-btn${active ? ' active' : ''}`}
                  onClick={() => navigate(to)}
                >
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="al-signout-wrap">
            <button className="al-signout-btn" onClick={handleSignOut}>
              <LogOut size={16} strokeWidth={1.8} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="al-main">
          <div className="al-topbar">
            <button className="al-topbar-btn">
              <Bell size={16} strokeWidth={1.8} />
            </button>
            <button className="al-topbar-btn">
              <User size={16} strokeWidth={1.8} />
            </button>
          </div>

          <main className="al-content">
            <Outlet />
          </main>
        </div>

      </div>
    </>
  );
}