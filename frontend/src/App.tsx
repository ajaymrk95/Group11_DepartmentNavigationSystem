import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Buildings from "./pages/Buildings";
import Floors from "./pages/Floors";
import Rooms from "./pages/Rooms";
import FloorMap from "./pages/FloorMap";
import Logs from "./pages/Logs";
import AddLocation from "./pages/Addlocation";
import * as L from "leaflet";

export default function App() {

  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (window as any).L = L;
  }, []);

  return (
    <>
      {!authed ? (
        <Login onLogin={() => setAuthed(true)} />
      ) : (
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout onLogout={() => setAuthed(false)} />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/buildings" element={<Buildings />} />
                <Route path="/floors" element={<Floors />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/map" element={<FloorMap />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/addlocation" element={<AddLocation />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      )}
    </>
  );
}