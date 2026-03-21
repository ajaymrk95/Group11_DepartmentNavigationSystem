import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import OutdoorNav from "./pages/OutdoorNav"
import AddLocation from "./pages/AddLocation"
// import EditLocation from "./pages/EditLocation"
import SearchLocation from "./pages/SearchLocation"
import IndoorNavigation from "./pages/navigation/IndoorNav"
import Scanner from "./components/searchcomponents/Scanner";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/outdoor-navigation" element={<OutdoorNav/>} />
        <Route path="/add-location" element={<AddLocation />} />
        {/* <Route path="/edit-location" element={<EditLocation />} /> */}
        <Route path="/search-location" element={<SearchLocation />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/indoor-navigation" element={<IndoorNavigation />} />
        <Route path="/qr-scanner" element={<Scanner />} />
      
      </Routes>
    </BrowserRouter>
  )
}