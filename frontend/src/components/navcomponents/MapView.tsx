import "leaflet/dist/leaflet.css"

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import { type Location } from "../../types/types"
import L from "leaflet"
import MapRecenter from "./MapRecenter"

type TileType = "light" | "standard" | "satelite"

import { useState, useEffect } from "react"

type Props = {
  center: [number, number]
  start: Location | null
  destination: Location | null
  routeCoords: [number, number][]
  currentLocation?: [number, number] | null
  onSetMapDestination: (loc: Location) => void

  tileType: TileType
}

/** Red filled circle icon for current location */
const locationCircleIcon = L.divIcon({
  html: `
    <div style="
      position:relative;
      width:52px;
      height:52px;
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      <span style="
        position:absolute;
        inset:0;
        border-radius:50%;
        background:rgba(240,59,49,0.18);
        animation:locationPulse 1.8s ease-out infinite;
      "></span>
      <div style="
        width:18px;
        height:18px;
        border-radius:50%;
        background:#F03B31;
        border:3px solid #fff;
        box-shadow:0 2px 8px rgba(240,59,49,0.6);
      "></div>
    </div>`,
  className: "",
  iconSize: [52, 52],
  iconAnchor: [26, 26],
  popupAnchor: [0, -26],
})

// ✅ NEW: tile mapping
const tileLayers = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satelite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
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

function MapView({ center, start, destination, routeCoords, currentLocation, onSetMapDestination, tileType }: Props) {
  /* Inject the keyframe animation once into the document */
  useEffect(() => {
    const styleId = "location-pulse-style"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.textContent = `
        @keyframes locationPulse {
          0%   { transform: scale(0.6); opacity: 0.9; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  const [locations, setLocations] = useState<Location[]>([])
  
  useEffect(() => {
    fetch("http://localhost:8080/locations")
      .then(res => res.json())
      .then(data => {
        const mapped: Location[] = data
        .filter((loc: any) => loc.latitude != null && loc.longitude != null)
        .map((loc: any) => ({
            id: loc.id,
            name: loc.name,
            room: loc.room ?? null,
            category: loc.category ?? null,
            description: loc.description ?? null,
            latitude: loc.latitude,
            longitude: loc.longitude,
            tag: loc.tag || [],
            floor: loc.floor ?? null,
        }))
        setLocations(mapped)
      })
      .catch(err => console.error("Failed to load locations:", err))
  }, [])

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={center} 
        zoom={19} 
        zoomControl={false}
        className="h-full w-full z-0"
      >
        {/* ✅ FIXED */}
        <TileLayer
          url={tileLayers[tileType]}
          attribution="&copy; OpenStreetMap contributors"
        />

        {locations.map((loc: Location) => {
          // Hide default blue markers if they are currently selected as start/end
          if (start?.id === loc.id || destination?.id === loc.id) return null;

          return (
            <Marker key={loc.id} position={[loc.latitude!, loc.longitude!]} icon={blueIcon}>
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
          <Marker position={[start.latitude!, start.longitude!]} icon={greenIcon}>
            <Popup><span className="font-bold text-green-700">Start: {start.name}</span></Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={[destination.latitude!, destination.longitude!]} icon={greenIcon}>
            <Popup><span className="font-bold text-green-700">Dest: {destination.name}</span></Popup>
          </Marker>
        )}

        {currentLocation && (
          <Marker position={currentLocation} icon={locationCircleIcon}>
            <Popup><span className="font-bold text-red-600">You are here</span></Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default MapView