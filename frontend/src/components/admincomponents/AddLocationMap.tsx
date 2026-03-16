import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
// Custom Red Icon
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Helper component to catch clicks
function MapClickCatcher({ onMapClick }: { onMapClick: (coords: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

type Props = {
  coords: [number, number] | null;
  onMapClick: (coords: [number, number]) => void;
  isPanelOpen: boolean;
  onOpenPanel: () => void;
}

export default function AddLocationMap({ coords, onMapClick, isPanelOpen, onOpenPanel }: Props) {
  return (
    <div className="flex-1 relative h-full w-full">
      {/* Mobile Open Button */}
      {!isPanelOpen && (
        <button 
          onClick={onOpenPanel} 
          className="md:hidden absolute top-6 left-6 z-[2000] bg-white text-[#1a305b] px-5 py-3 rounded-full shadow-lg font-semibold border border-[#547792]/20"
        >
          ➕ Add Info
        </button>
      )}
      
      <MapContainer 
        center={[11.3210, 75.9346]} 
        zoom={17} 
        zoomControl={false} 
        className="h-full w-full z-0 cursor-crosshair"
      >
        <TileLayer 
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution="&copy; OpenStreetMap" 
        />
        
        <MapClickCatcher onMapClick={onMapClick} />
        
        {coords && (
          <Marker position={coords} icon={redIcon}>
            <Popup>New Location Pin</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}