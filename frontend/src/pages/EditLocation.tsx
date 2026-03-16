import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { locations, type Location } from "../data/locations" // Adjust import path if needed

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Helper to update coordinates by clicking on the map while editing
function EditMapClickCatcher({ onMapClick, isEditing }: { onMapClick: (coords: [number, number]) => void, isEditing: boolean }) {
  useMapEvents({
    click(e) {
      if (isEditing) {
        onMapClick([e.latlng.lat, e.latlng.lng])
      }
    },
  })
  return null
}

export default function EditLocation() {
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null)
  
  // We use a local state for the form so we can modify it before saving
  const [formData, setFormData] = useState<Partial<Location>>({})

  const handleSelectLocation = (loc: Location) => {
    setSelectedLoc(loc)
    setFormData(loc) 
    setIsPanelOpen(true)
  }

  const handleUpdate = () => {
    if (!selectedLoc) return
    
    // In a real app, send `updatedLocation` to your backend
    const updatedLocation = { ...selectedLoc, ...formData }
    console.log("LOCATION UPDATED:", updatedLocation)
    alert(`Successfully updated ${updatedLocation.name}!\n(Check console to copy JSON)`)
    
    // Simulate refresh for now
    window.location.reload()
  }

  // Handle manual coordinate input changes
  const handleCoordChange = (index: 0 | 1, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    const currentCoords = formData.coords || [0, 0]
    const newCoords: [number, number] = [...currentCoords] as [number, number]
    newCoords[index] = numValue
    
    setFormData({ ...formData, coords: newCoords })
  }

  return (
    <div className="h-screen w-screen flex bg-slate-100 overflow-hidden font-sans relative">
      
      {/* SIDEBAR FORM */}
      <div className={`
        absolute md:relative top-0 left-0 h-full w-full md:w-[30%] md:min-w-[350px]
        z-[3000] md:z-10 flex flex-col bg-[#e9e4d9] border-r border-[#547792]/20 shadow-2xl md:shadow-none
        transition-transform duration-300 ease-in-out
        ${isPanelOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="bg-[#1a305b] px-6 py-5 flex justify-between items-center shadow-md shrink-0">
          <h2 className="text-[#e9e4d9] text-xl font-bold tracking-wide">Edit Location</h2>
          <button onClick={() => setIsPanelOpen(false)} className="md:hidden text-white bg-white/20 p-2 rounded-full">✕</button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!selectedLoc ? (
            <div className="h-full flex flex-col items-center justify-center text-[#547792] text-center">
              <span className="text-4xl mb-4">🗺️</span>
              <p className="font-semibold text-lg">Select a location on the map to edit its details.</p>
              <a href="/" className="mt-8 text-[#fab75a] text-sm font-bold hover:underline">← Back to Main Map</a>
            </div>
          ) : (
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdate()
              }} 
              className="space-y-4"
            >
              <div className="bg-[#547792]/10 text-[#1a305b] p-3 rounded-lg text-sm border border-[#547792]/20 font-medium mb-4">
                Editing: <strong>{selectedLoc.name}</strong>
                <br/>
                <span className="text-xs text-[#547792]">Click the map to update coordinates.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Name</label>
                <input required type="text" value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Type</label>
                  <select value={formData.type || "building"} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none bg-white">
                    <option value="building">Building</option>
                    <option value="lab">Lab</option>
                    <option value="connection">Connection</option>
                    <option value="room">Room</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Category</label>
                  <select value={formData.category || "outdoor"} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none bg-white">
                    <option value="outdoor">Outdoor</option>
                    <option value="indoor">Indoor</option>
                  </select>
                </div>
              </div>

              {/* Editable Coordinates Section */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.coords ? formData.coords[0] : ""} 
                    onChange={e => handleCoordChange(0, e.target.value)} 
                    className="w-full px-3 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none text-sm" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.coords ? formData.coords[1] : ""} 
                    onChange={e => handleCoordChange(1, e.target.value)} 
                    className="w-full px-3 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a305b] uppercase tracking-wider mb-1">Description</label>
                <textarea rows={4} value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-[#547792]/30 focus:ring-2 focus:ring-[#547792] outline-none" />
              </div>

              <button type="submit" className="w-full mt-4 py-3 rounded-xl bg-[#fab75a] text-[#1a305b] font-bold shadow-md hover:bg-[#f9aa3d] active:scale-[0.98] transition-all">
                Update Location
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  setSelectedLoc(null)
                  setFormData({})
                }} 
                className="w-full mt-2 py-3 rounded-xl border-2 border-[#1a305b] text-[#1a305b] font-bold hover:bg-[#1a305b] hover:text-white transition-all"
              >
                Cancel Edit
              </button>
            </form>
          )}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative h-full w-full">
        {!isPanelOpen && (
          <button onClick={() => setIsPanelOpen(true)} className="md:hidden absolute top-6 left-6 z-[2000] bg-white text-[#1a305b] px-5 py-3 rounded-full shadow-lg font-semibold border border-[#547792]/20">
            Edit Info
          </button>
        )}
        
        {/* Dynamic cursor based on edit mode */}
        <MapContainer 
          center={[11.3210, 75.9346]} 
          zoom={18} 
          zoomControl={false} 
          className={`h-full w-full z-0 ${selectedLoc ? 'cursor-crosshair' : ''}`}
        >
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          
          {/* Catch clicks to update coordinates if a location is selected */}
          <EditMapClickCatcher 
            isEditing={!!selectedLoc} 
            onMapClick={(newCoords) => setFormData({ ...formData, coords: newCoords })} 
          />

          {locations.filter(loc => loc.category !== 'indoor').map((loc: Location) => {
            // If this is the location currently being edited, draw it with the red icon at its potentially NEW coordinates
            if (selectedLoc && loc.id === selectedLoc.id) {
               return (
                 <Marker key={`edit-${loc.id}`} position={formData.coords || loc.coords} icon={redIcon}>
                   <Popup>New Position for {formData.name}</Popup>
                 </Marker>
               )
            }

            // Otherwise draw the normal blue icon
            return (
              <Marker key={loc.id} position={loc.coords} icon={blueIcon}>
                <Popup>
                  <div className="font-bold text-[#1a305b] text-base mb-2">{loc.name}</div>
                  <button 
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full bg-[#1a305b] text-white font-semibold text-xs px-2 py-1.5 rounded shadow-sm hover:bg-[#11203d] transition-colors"
                  >
                    Edit This Location
                  </button>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}