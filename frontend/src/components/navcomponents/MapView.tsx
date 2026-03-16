import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import { type Location } from "../../data/locations"
import L from "leaflet"
import MapRecenter from "./MapRecenter"

type Props = {
  center: [number, number]
  locations: Location[]
  start: Location | null
  destination: Location | null
  routeCoords: [number, number][] // Ensure these are [lat, lng]
  currentLocation?: [number, number] | null
  onSetMapDestination: (loc: Location) => void  
}

// Icon Definitions (Keeping your existing colored markers)
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

function MapView({ center, locations, start, destination, routeCoords, currentLocation, onSetMapDestination }: Props) {
  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={center} 
        zoom={19} 
        zoomControl={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Render building markers */}
        {locations.map((loc: Location) => {
          // Hide blue markers for the specific points that are currently active
          const isStart = start?.id === loc.id;
          const isDest = destination?.id === loc.id;
          if (isStart || isDest) return null;

          return (
            <Marker key={loc.id} position={loc.coords} icon={blueIcon}>
              <Popup>
                <div className="flex flex-col gap-3 min-w-[140px] p-1">
                  <div className="font-bold text-[#1a305b] text-base border-b border-gray-200 pb-2">
                    {loc.name}
                  </div>
                  <button 
                    onClick={() => onSetMapDestination(loc)}
                    className="bg-[#fab75a] text-[#1a305b] font-semibold text-xs px-2 py-1.5 rounded shadow-sm hover:bg-[#f9aa3d] transition-colors"
                  >
                    Set as Destination
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Navigation Polyline */}
        {routeCoords.length > 1 && (
          <Polyline 
            positions={routeCoords} 
            pathOptions={{ 
              color: '#1a305b', 
              weight: 6, 
              opacity: 0.9,
              lineJoin: 'round' // Makes the corners smooth
            }} 
          />
        )}

        {/* Start Marker */}
        {start && (
          <Marker position={start.coords} icon={greenIcon}>
            <Popup><span className="font-bold text-green-700">Start: {start.name}</span></Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker position={destination.coords} icon={greenIcon}>
            <Popup><span className="font-bold text-green-700">Destination: {destination.name}</span></Popup>
          </Marker>
        )}

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker position={currentLocation} icon={redIcon}>
            <Popup><span className="font-bold text-red-600">You are here</span></Popup>
          </Marker>
        )}

        <MapRecenter center={center} />
      </MapContainer>
    </div>
  )
}

export default MapView