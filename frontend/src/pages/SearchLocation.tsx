import { useState } from "react"
import type { Location } from "../types/types"
import RoutePanel from "../components/searchcomponents/RoutePanel"
import MobileLocationSheet from "../components/searchcomponents/MobileLocationSheet"
import TileSwitcher from "../components/searchcomponents/TileSwitcher"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import MapRecenter from "../components/searchcomponents/MapRecenter"
import "leaflet/dist/leaflet.css"

export default function SearchLocation() {

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // ✅ NEW: tile state
  const [tileType, setTileType] = useState<"light" | "standard" | "satelite">("light")

  // ✅ NEW: tile layers
  const tileLayers = {
    light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satelite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .sl-root {
          height: 100vh;
          width: 100vw;
          position: relative;
          font-family: 'Outfit', sans-serif;
        }

        /* ── LEAFLET OVERRIDES ── */
        .leaflet-container {
          font-family: 'Outfit', sans-serif !important;
        }

        .leaflet-popup-content-wrapper {
          font-family: 'Outfit', sans-serif !important;
          background: #0B2D72 !important;
          color: #F6E7BC !important;
          border-radius: 14px !important;
          box-shadow: 0 8px 32px rgba(11, 45, 114, 0.35) !important;
          padding: 0 !important;
          border: 1px solid rgba(246, 231, 188, 0.12) !important;
        }

        .leaflet-popup-content {
          margin: 14px 18px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #F6E7BC !important;
          line-height: 1.4 !important;
        }

        .leaflet-popup-tip {
          background: #0B2D72 !important;
        }

        .leaflet-popup-close-button {
          color: rgba(246, 231, 188, 0.5) !important;
          font-size: 16px !important;
          padding: 6px 8px !important;
        }

        .leaflet-popup-close-button:hover {
          color: #FAB95B !important;
          background: none !important;
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 16px rgba(11, 45, 114, 0.2) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }

        .leaflet-control-zoom a {
          background: #0B2D72 !important;
          color: #F6E7BC !important;
          font-family: 'Outfit', sans-serif !important;
          font-weight: 700 !important;
          border: none !important;
          border-bottom: 1px solid rgba(246, 231, 188, 0.1) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          transition: background 0.18s ease !important;
        }

        .leaflet-control-zoom a:hover {
          background: #1A3263 !important;
          color: #FAB95B !important;
        }

        .leaflet-control-attribution {
          font-family: 'Outfit', sans-serif !important;
          font-size: 10px !important;
          background: rgba(237, 232, 220, 0.85) !important;
          color: #547792 !important;
          border-radius: 8px 0 0 0 !important;
          padding: 3px 8px !important;
        }
      `}</style>

      <div className="sl-root">

        <div className="hidden md:block absolute top-4 right-4 z-[1000]">
          <TileSwitcher tileType={tileType} setTileType={setTileType} />
        </div>

        {/* MAP */}
        <MapContainer
          center={[11.3215, 75.9339]}
          zoom={16}
          className="absolute inset-0 z-0"
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url={tileLayers[tileType]}
          />

          <MapRecenter location={selectedLocation} />

          {selectedLocation && selectedLocation.latitude != null && selectedLocation.longitude != null && (
            <Marker position={[selectedLocation.latitude, selectedLocation.longitude]}>
              <Popup>{selectedLocation.name}</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* DESKTOP PANEL */}
        <div className="hidden md:block absolute left-0 top-0 h-full w-[380px] z-50">
          <RoutePanel
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
          />
        </div>

        {/* MOBILE */}
        <div className="md:hidden">
          <MobileLocationSheet
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            tileType={tileType}              // ✅ NEW
            setTileType={setTileType}        // ✅ NEW
          />
        </div>

      </div>
    </>
  )
}