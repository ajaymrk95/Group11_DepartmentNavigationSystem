import { useState, useEffect } from "react"
import MapView from "../components/navcomponents/MapView"
import RoutePanel from "../components/navcomponents/RoutePanel"
import type { Location } from "../types/types"
import { buildGraph, type Graph } from "../utils/buildGraph"
import { findNearestNode } from "../utils/findNearestNode"
import { shortestPath } from "../utils/shortestPath"
import LocateButton from "../components/navcomponents/LocateButton"
import { distance } from "../utils/distance"
import { useCurrentLocation } from "../hooks/useCurrentLocation"


const DEFAULT_CENTER: [number, number] = [11.3210, 75.9346]

export default function OutdoorNav() {
  const [graph, setGraph] = useState<Graph | null>(null)
  const [start, setStart] = useState<Location | null>(null)
  const [destination, setDestination] = useState<Location | null>(null)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [distanceText, setDistanceText] = useState("")
  
  // State to hold the destination clicked directly from the map pins
  const [clickedDestination, setClickedDestination] = useState<Location | null>(null)
  
  // Controls whether the sidebar is visible on mobile
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const { location: currentLocation } = useCurrentLocation();


  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)

  useEffect(() => {
    fetch("/nitc_roads.geojson")
      .then(r => r.json())
      .then(data => setGraph(buildGraph(data)))
  }, [])

  function handleRoute(startLoc: Location, endLoc: Location) {
    if (!graph) return

    setStart(startLoc)
    setDestination(endLoc)

    const startId = findNearestNode(graph, [startLoc.latitude!, startLoc.longitude!])!
    const endId = findNearestNode(graph, [endLoc.latitude!, endLoc.longitude!])!

    const pathIds = shortestPath(graph, startId, endId)
    const coords = pathIds.map(id => graph.get(id)!.coord)

    setRouteCoords(coords)

    let total = 0
    for (let i = 0; i < coords.length - 1; i++) {
      total += distance(coords[i], coords[i + 1])
    }

    setDistanceText(
      total < 1
        ? Math.round(total * 1000) + " m"
        : total.toFixed(2) + " km"
    )
  }

  return (
    <div className="h-screen w-screen flex bg-slate-100 overflow-hidden font-sans relative">

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
          absolute top-6 right-6 md:top-6 md:left-1/2 md:-translate-x-1/2
          bg-[#1A3263] px-6 py-3 rounded-full shadow-xl
          border border-[#2d4a7a] text-sm font-bold text-[#e9e4d9] z-[2000]
        ">
          {distanceText || "Select two locations"}
        </div>

        <MapView
          center={center}
          start={start}
          destination={destination}
          graph={graph}
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