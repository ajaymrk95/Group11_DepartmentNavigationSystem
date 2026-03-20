import { useState } from "react"
import AddLocationForm from "../components/admincomponents/AddLocationForm"
import AddLocationMap from "../components/admincomponents/AddLocationMap"
import type { Location } from "../type/locations"

export default function AddLocation() {
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [coords, setCoords] = useState<[number, number] | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "building",
    category: "outdoor",
    description: ""
  })

  const handleSaveLocation = () => {
    if (!coords) return alert("Please click on the map to set the coordinates!")
    
    const newLocation: Location = {
      id: Date.now(),
      name: formData.name,
      coords: coords,
      type: formData.type as any,
      category: formData.category as any,
      description: formData.description
    }

    console.log("NEW LOCATION SAVED:", newLocation)
    alert(`Successfully saved ${formData.name}! Check console for data.`)
    
    // Reset state after saving
    setCoords(null)
    setFormData({ name: "", type: "building", category: "outdoor", description: "" })
  }

  return (
    <div className="h-screen w-screen flex bg-slate-100 overflow-hidden font-sans relative">
      
  
      <div className={`
        absolute md:relative top-0 left-0 h-full w-full md:w-[30%] md:min-w-[350px]
        z-[3000] md:z-10 bg-[#e9e4d9] border-r border-[#547792]/20 shadow-2xl md:shadow-none
        transition-transform duration-300 ease-in-out
        ${isPanelOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <AddLocationForm 
          formData={formData}
          setFormData={setFormData}
          coords={coords}
          onClosePanel={() => setIsPanelOpen(false)}
          onSubmit={handleSaveLocation}
        />
      </div>


      <AddLocationMap 
        coords={coords}
        onMapClick={setCoords}
        isPanelOpen={isPanelOpen}
        onOpenPanel={() => setIsPanelOpen(true)}
      />
      
    </div>
  )
}