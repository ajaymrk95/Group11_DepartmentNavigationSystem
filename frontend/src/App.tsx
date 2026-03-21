import { BrowserRouter, Routes, Route , Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import OutdoorNav from "./pages/OutdoorNav"
import AddLocation from "./pages/AddLocation"
import EditLocation from "./pages/EditLocation"
import SearchLocation from "./pages/SearchLocation"
import IndoorNavigation from "./pages/navigation/IndoorNav"
import Scanner from "./components/searchcomponents/Scanner";
import AdminDashboard from "./pages/admin/dashbored";
import AdminLayout from "./components/layouts/AdminLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
         {/* Public */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/outdoor-navigation" element={<OutdoorNav/>} />
        <Route path="/add-location" element={<AddLocation />} />
        <Route path="/edit-location" element={<EditLocation />} />
        <Route path="/search-location" element={<SearchLocation />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/indoor-navigation" element={<IndoorNavigation />} />
        <Route path="/qr-scanner" element={<Scanner />} />
        {/* Protected admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<AdminDashboard />} />
          {/* <Route path="buildings"    element={<Buildings />} /> */}
          {/* <Route path="floors"       element={<Floors />} />
          <Route path="rooms"        element={<Rooms />} />
          <Route path="faculty"      element={<Faculty />} />
          <Route path="floor-layout" element={<FloorLayout />} />
          <Route path="logs"         element={<Logs />} /> */}
        </Route>
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}