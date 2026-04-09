import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OutdoorNav from "./pages/OutdoorNav"
import AddLocation from "./pages/AddLocation";
import AddLocations from "./pages/admin/AddLocations";
import Path from "./pages/admin/Path";
import Floors from "./pages/admin/Floors";
import Rooms from "./pages/admin/Rooms";
import Faculty from "./pages/admin/Faculty";
import Logs from "./pages/admin/Logs";
// import EditLocation from "./pages/EditLocation"
import Buildings from "./pages/admin/Buildings";
import SearchLocation from "./pages/SearchLocation"
import IndoorNavigation from "./pages/navigation/IndoorNav"
import Scanner from "./components/searchcomponents/Scanner";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLayout from "./components/layouts/AdminLayout";
import Profile from "./pages/admin/Profile";
import Reports from "./pages/admin/Report";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/outdoor-navigation" element={<OutdoorNav />} />
        <Route path="/add-location" element={<AddLocation />} />
        {/* <Route path="/edit-location" element={<EditLocation />} /> */}
        <Route path="/search-location" element={<SearchLocation />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/indoor-navigation/:building" element={<IndoorNavigation />} />
        <Route path="/qr-scanner" element={<Scanner />} />
        {/* Protected admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="buildings" element={<Buildings />} />
          <Route path="floors" element={<Floors />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="Path" element={<Path />} />
          <Route path="add-location" element={<AddLocations />} />
          <Route path="logs" element={<Logs />} />
          <Route path="profile" element={<Profile />} />
          <Route path="report" element={<Reports/>}/>
        </Route>
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}