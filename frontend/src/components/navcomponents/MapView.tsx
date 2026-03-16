import "leaflet/dist/leaflet.css"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import { type Graph } from "../../utils/buildGraph"
import { type Location } from "../../data/locations"
import L from "leaflet"
import MapRecenter from "./MapRecenter"

type Props = {
  center: [number, number]
  locations: Location[]
  start: Location | null
  destination: Location | null
  graph: Graph | null
  routeCoords: [number, number][]
  currentLocation?: [number, number] | null
  onSetMapDestination: (loc: Location) => void  
}

// Default blue for regular buildings
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Green for Start and Destination
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Red for Current Location
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function MapView({ center, locations, start, destination, routeCoords, currentLocation, onSetMapDestination}: Props) {
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

        {locations.map((loc: Location) => {
          // Hide default blue markers if they are currently selected as start/end
          if (start?.id === loc.id || destination?.id === loc.id) return null;

          return (
            <Marker key={loc.id} position={loc.coords} icon={blueIcon}>
              <Popup>
                <div className="flex flex-col gap-3 min-w-[140px] p-1">
                  <div className="font-bold text-[#1a305b] text-base border-b border-gray-200 pb-2">
                    {loc.name}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onSetMapDestination(loc)}
                      className="flex-1 bg-[#fab75a] text-[#1a305b] font-semibold text-xs px-2 py-1.5 rounded shadow-sm hover:bg-[#f9aa3d] transition-colors"
                    >
                      Navigate
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <MapRecenter center={center} />

        {routeCoords.length > 0 && (
          <Polyline 
            positions={routeCoords} 
            pathOptions={{ color: '#1a305b', weight: 5, opacity: 0.8 }} 
          />
        )}

        {start && (
          <Marker position={start.coords} icon={greenIcon}>
            <Popup><span className="font-bold text-green-700">Start: {start.name}</span></Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={destination.coords} icon={greenIcon}>
            <Popup><span className="font-bold text-green-700">Dest: {destination.name}</span></Popup>
          </Marker>
        )}

        {currentLocation && (
          <Marker position={currentLocation} icon={redIcon}>
            <Popup><span className="font-bold text-red-600">You are here</span></Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default MapView