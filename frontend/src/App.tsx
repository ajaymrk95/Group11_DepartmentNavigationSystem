import { BrowserRouter, Routes, Route } from "react-router-dom"

import OutdoorNav from "./pages/OutdoorNav"
import AddLocation from "./pages/AddLocation"
import EditLocation from "./pages/EditLocation"



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      
        <Route path="/" element={<OutdoorNav/>} />
        <Route path="/add-location" element={<AddLocation />} />
        <Route path="/edit-location" element={<EditLocation />} />
      
      </Routes>
    </BrowserRouter>
  )
}