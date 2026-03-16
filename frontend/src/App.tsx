import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import OutdoorNav from "./pages/OutdoorNav"
import AddLocation from "./pages/AddLocation"
import EditLocation from "./pages/EditLocation"



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/outdoor-navigation" element={<OutdoorNav/>} />
        <Route path="/add-location" element={<AddLocation />} />
        <Route path="/edit-location" element={<EditLocation />} />
      
      </Routes>
    </BrowserRouter>
  )
}