import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout({ onLogout }) {
  return (
    <div className="flex min-h-screen bg-[#E8E2DB]">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
