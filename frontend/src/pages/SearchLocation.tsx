import { useState, useEffect } from "react"
import type { Location } from "../data/locations"
import RoutePanel from "../components/searchcomponents/RoutePanel"
import MobileLocationSheet from "../components/searchcomponents/MobileLocationSheet"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import MapRecenter from "../components/searchcomponents/MapRecenter"
import "leaflet/dist/leaflet.css"

export default function SearchLocation() {

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // 🔹 NEW: state for backend locations
  const [locations, setLocations] = useState<Location[]>([])

  // 🔹 NEW: fetch locations from backend on page load
  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("http://localhost:8080/locations") // backend endpoint
        const data = await res.json()

        // ⚠️ IMPORTANT: backend DTO → frontend Location mapping
        const mapped = data.map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          room: loc.room,
          type: loc.type,
          category: loc.category,
          description: loc.description,

          // ❗ YOU MUST FIX THIS BASED ON YOUR DATA
          coords: [loc.latitude, loc.longitude],

          tag: loc.tag || [],
          floor: loc.floor,
        }))

        setLocations(mapped)

      } catch (err) {
        console.error("Failed to fetch locations", err)
      }
    }

    fetchLocations()
  }, [])

  return (
    <div className="h-screen w-screen relative">

      {/* MAP */}
      <MapContainer
        center={[11.3215, 75.9339]}
        zoom={16}
        className="absolute inset-0 z-0"
      >

        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter location={selectedLocation} />

        {selectedLocation && (
          <Marker position={selectedLocation.coords}>
            <Popup>{selectedLocation.name}</Popup>
          </Marker>
        )}

      </MapContainer>

      {/* DESKTOP PANEL */}
      <div className="hidden md:block absolute left-0 top-0 h-full w-[420px] z-50">
        <RoutePanel
          locations={locations}   // 🔹 CHANGED: now from backend
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
        />
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <MobileLocationSheet
          locations={locations}   // 🔹 CHANGED: now from backend
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
        />
      </div>

    </div>
  )
}