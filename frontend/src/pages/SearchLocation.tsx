import { useState } from "react"
import type { Location } from "../data/locations"
import RoutePanel from "../components/searchcomponents/RoutePanel"
import { locations } from "../data/locations"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import MapRecenter from "../components/searchcomponents/MapRecenter"
import "leaflet/dist/leaflet.css"

export default function SearchLocation() {

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

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

        {/* move map when location changes */}
        <MapRecenter location={selectedLocation} />

        {/* marker for selected location */}
        {selectedLocation && (
          <Marker position={selectedLocation.coords}>
            <Popup>{selectedLocation.name}</Popup>
          </Marker>
        )}

      </MapContainer>


      {/* DESKTOP PANEL */}

      <div className="hidden md:block absolute left-0 top-0 h-full w-[420px] z-50">
        <RoutePanel
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
        />
      </div>

    </div>
  )
}