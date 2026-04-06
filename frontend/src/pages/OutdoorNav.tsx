import { useState } from "react"
import MapView from "../components/navcomponents/MapView"
import RoutePanel from "../components/navcomponents/RoutePanel"
import type { Location } from "../types/types"
import LocateButton from "../components/navcomponents/LocateButton"
import { useCurrentLocation } from "../hooks/useCurrentLocation"
import TileSwitcher from "../components/searchcomponents/TileSwitcher"

const DEFAULT_CENTER: [number, number] = [11.3210, 75.9346]

export default function OutdoorNav() {
  const [start, setStart] = useState<Location | null>(null)
  const [destination, setDestination] = useState<Location | null>(null)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [distanceText, setDistanceText] = useState("")

  // ✅ NEW: tile state
  const [tileType, setTileType] = useState<"light" | "standard" | "satelite">("light")

  
  // State to hold the destination clicked directly from the map pins
  const [clickedDestination, setClickedDestination] = useState<Location | null>(null)
  
  // Controls whether the sidebar is visible on mobile
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const { location: currentLocation } = useCurrentLocation()

  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)

  async function handleRoute(startLoc: Location, endLoc: Location) {
    setStart(startLoc)
    setDestination(endLoc)
    
    // Switch distance text to indicate loading
    setDistanceText("Calculating route...")

    try {
      const url = `http://localhost:8080/api/routes/navigate?startLat=${startLoc.latitude}&startLng=${startLoc.longitude}&endLat=${endLoc.latitude}&endLng=${endLoc.longitude}`
      const res = await fetch(url)

      if (!res.ok) {
        throw new Error("Route not found. Make sure points are accessible.")
      }

      const route = await res.json()
      
      console.log(route)
      // route.coordinates return [lng, lat], we need [lat, lng] for Leaflet Polyline
      const latLngCoords = route.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number])
      
      setRouteCoords(latLngCoords)

      const distMeters = route.properties.distanceMeters
      setDistanceText(
        distMeters < 1000
          ? Math.round(distMeters) + " m"
          : (distMeters / 1000).toFixed(2) + " km"
      )
    } catch (err: any) {
      console.error(err)
      setDistanceText("Error calculating route")
      setRouteCoords([])
    }
  }

  return (
    <div className="h-screen w-screen flex bg-slate-100 overflow-hidden font-sans relative">

        {/* ✅ TILE SWITCHER (TOP RIGHT) */}
      <div className="absolute top-4 right-4 z-[3000]">
        <TileSwitcher tileType={tileType} setTileType={setTileType} />
      </div>

      {/* SIDEBAR: 30% width on Desktop, Full screen slide-over on Mobile */}
      <div className={`
        absolute md:relative top-0 left-0 h-full w-full md:w-[30%] md:min-w-[350px]
        z-[3000] md:z-10
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isPanelOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <RoutePanel
          onRouteRequest={handleRoute}
          onClose={() => setIsPanelOpen(false)} 
          mapDestination={clickedDestination} // PASSED TO SIDEBAR
        />
      </div>

      
      <div className="flex-1 relative h-full w-full">
        
        {/* Floating Search button for mobile when panel is hidden */}
        {!isPanelOpen && (
          <button 
            onClick={() => setIsPanelOpen(true)}
            className="md:hidden absolute top-6 left-6 z-[2000] bg-[#1A3263] text-[#e9e4d9] px-5 py-3 rounded-full shadow-lg font-semibold border border-[#2d4a7a] flex items-center gap-2 hover:bg-[#243d6e] transition-colors"
          >
            🔍 Search Route
          </button>
        )}

        {/* Distance Indicator */}
        <div className="
          absolute top-24 left-1/2 -translate-x-1/2 md:top-6 md:left-1/2 md:-translate-x-1/2
          bg-[#1A3263] px-6 py-3 rounded-full shadow-xl
          border border-[#2d4a7a] text-sm font-bold text-[#e9e4d9] z-[2000] whitespace-nowrap
        ">
          {distanceText || "Select two locations"}
        </div>

        <MapView
          center={center}
          start={start}
          destination={destination}
          routeCoords={routeCoords}
          currentLocation={currentLocation}
          onSetMapDestination={(loc) => {
            setClickedDestination(loc)
            setIsPanelOpen(true) 
          }}
         tileType={tileType}
        />

        <LocateButton
          onClick={() => {
            if (currentLocation) setCenter(currentLocation)
          }}
        />
      </div>
    </div>
  )
}