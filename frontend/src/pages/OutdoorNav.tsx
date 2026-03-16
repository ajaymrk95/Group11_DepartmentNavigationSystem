import { useState, useEffect } from "react"
import MapView from "../components/navcomponents/MapView"
import RoutePanel from "../components/navcomponents/RoutePanel"
import { locations, type Location } from "../data/locations"
import LocateButton from "../components/navcomponents/LocateButton"
import { useCurrentLocation } from "../hooks/useCurrentLocation"
import { distance } from "../utils/distance"

const DEFAULT_CENTER: [number, number] = [11.3210, 75.9346]
const BACKEND_URL = "http://localhost:8080/api"

export default function OutdoorNav() {
  const [start, setStart] = useState<Location | null>(null)
  const [destination, setDestination] = useState<Location | null>(null)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [distanceText, setDistanceText] = useState("")
  
  // State for map interactions
  const [clickedDestination, setClickedDestination] = useState<Location | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)

  const { location: currentLocation } = useCurrentLocation()

  // Define current location as a selectable option
  const currentLocationOption: Location | null = currentLocation
    ? {
        id: 0, 
        name: "My Current Location",
        coords: currentLocation,
        type: "custom"
      }
    : null

  const selectableLocations: Location[] = currentLocationOption
    ? [currentLocationOption, ...locations]
    : locations

  /**
   * API CALL: Fetch the route from Spring Boot / PostGIS
   */
  async function handleRoute(startLoc: Location, endLoc: Location) {
    setStart(startLoc)
    setDestination(endLoc)

    try {
      // Build the query params for your NavigationController
      const query = new URLSearchParams({
        sLat: startLoc.coords[0].toString(),
        sLng: startLoc.coords[1].toString(),
        eLat: endLoc.coords[0].toString(),
        eLng: endLoc.coords[1].toString(),
      })

      const response = await fetch(`${BACKEND_URL}/navigate?${query}`)
      
      if (!response.ok) throw new Error("Route not found")

      const pathData = await response.json() // Returns Array of {x: lng, y: lat}

      // Format JTS Coordinates (x=lng, y=lat) to Leaflet format [lat, lng]
      const formatted: [number, number][] = pathData.map((p: any) => [p.y, p.x])
      setRouteCoords(formatted)

      // Calculate total distance using your utility
      let totalKm = 0
      for (let i = 0; i < formatted.length - 1; i++) {
        totalKm += distance(formatted[i], formatted[i + 1])
      }

      setDistanceText(
        totalKm < 1
          ? Math.round(totalKm * 1000) + " m"
          : totalKm.toFixed(2) + " km"
      )
    } catch (err) {
      console.error("Navigation Error:", err)
      setDistanceText("Error calculating route")
      setRouteCoords([])
    }
  }

  return (
    <div className="h-screen w-screen flex bg-slate-100 overflow-hidden font-sans relative">

      {/* SIDEBAR */}
      <div className={`
        absolute md:relative top-0 left-0 h-full w-full md:w-[30%] md:min-w-[350px]
        z-[3000] md:z-10
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isPanelOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <RoutePanel
          locations={selectableLocations}
          onRouteRequest={handleRoute}
          onClose={() => setIsPanelOpen(false)} 
          mapDestination={clickedDestination} 
        />
      </div>

      <div className="flex-1 relative h-full w-full">
        
        {/* Mobile Search Toggle */}
        {!isPanelOpen && (
          <button 
            onClick={() => setIsPanelOpen(true)}
            className="md:hidden absolute top-6 left-6 z-[2000] bg-white text-[#1a305b] px-5 py-3 rounded-full shadow-lg font-semibold border border-[#547792]/20 flex items-center gap-2"
          >
            🔍 Search Route
          </button>
        )}

        {/* Distance UI Overlay */}
        <div className="
          absolute top-6 right-6 md:top-6 md:left-1/2 md:-translate-x-1/2
          bg-white px-6 py-3 rounded-full shadow-xl
          border border-[#547792]/20 text-sm font-bold text-[#1a305b] z-[2000]
        ">
          {distanceText || "Select two locations"}
        </div>

        <MapView
          center={center}
          locations={locations}
          start={start}
          destination={destination}
          routeCoords={routeCoords}
          currentLocation={currentLocation}
          onSetMapDestination={(loc) => {
            setClickedDestination(loc)
            setIsPanelOpen(true) 
          }}
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