import { useState, useEffect } from "react"
import type { Location } from "../../data/locations"
import LocationSearch from "./LocationSearch"

type Props = {
  locations: Location[]
  onRouteRequest: (start: Location, end: Location) => void
  onClose: () => void
  mapDestination?: Location | null
}

export default function RoutePanel({ locations, onRouteRequest, onClose, mapDestination }: Props) {
  const [start, setStart] = useState<Location | null>(null)
  const [end, setEnd] = useState<Location | null>(null)

  useEffect(() => {
    if (mapDestination) {
      setEnd(mapDestination)
    }
  }, [mapDestination])

  const handleSwap = () => {
    const temp = start;
    setStart(end);
    setEnd(temp);
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#e9e4d9] border-r border-[#547792]/20 overflow-y-auto">
      
      {/* Header */}
      <div className="bg-[#1a305b] px-6 py-5 flex justify-between items-center shadow-md z-30 shrink-0">
        <h2 className="text-[#e9e4d9] text-xl font-bold tracking-wide">
          Outdoor Navigation
        </h2>
        <button 
          onClick={onClose}
          className="md:hidden text-white bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition"
        >
          ✕
        </button>
      </div>

      {/* Search Inputs Area */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="space-y-4 relative">
          
          <div className="relative z-20">
            <LocationSearch
              label="Choose starting point..."
              locations={locations}
              onSelect={setStart}
              iconType="start"
              selectedLoc={start}
            />
          </div>

          <div className="absolute right-6 top-[42px] z-30">
            <button
              onClick={handleSwap}
              className="bg-white text-[#547792] p-3.5 rounded-full border border-[#54779]/30 shadow-sm hover:bg-[#fab75a] hover:text-[#1a305b] hover:border-[#fab75a] transition-colors"
              title="Swap locations"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            </button>
          </div>

          <div className="relative z-10 pt-2">
            <LocationSearch
              label="Choose destination..."
              locations={locations}
              onSelect={setEnd}
              iconType="end"
              selectedLoc={end}
            />
          </div>
        </div>


        {end && (
          <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-[#547792]/20 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#1a305b] text-sm uppercase tracking-wider">Destination Info</h3>
         
                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  {end.type}
                </span>
            </div>
            <h4 className="text-[#1a305b] font-semibold text-lg">{end.name}</h4>
            
            <p className="text-sm text-[#547792] mt-2 leading-relaxed">
          
              {end.description || `This is an ${end.category === 'indoor' ? 'indoor room' : 'outdoor building'} located on campus. Follow the route shown on the map to reach here.`}
            </p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white/50 border-t border-[#547792]/10 z-0 shrink-0">
        <button
          disabled={!start || !end}
          onClick={() => {
            if (start && end) {
              onRouteRequest(start, end)
              onClose() 
            }
          }}
          className="
            w-full py-3.5 rounded-xl shadow-md
            bg-[#fab75a] text-[#1a305b] font-bold text-lg tracking-wide
            disabled:bg-[#547792]/20 disabled:text-[#547792]/50 disabled:cursor-not-allowed
            hover:bg-[#f9aa3d] active:scale-[0.98] transition-all duration-200
          "
        >
          Find Route
        </button>


        {start && end && end.category ==='indoor' && (
          <button
            onClick={() => alert("This will trigger the indoor map view!")}
            className="
              w-full mt-3 py-3 rounded-xl shadow-sm
              border-2 border-[#1a305b] text-[#1a305b] font-bold text-base
              hover:bg-[#1a305b] hover:text-[#e9e4d9] active:scale-[0.98] transition-all duration-200
            "
          >
            Switch to Indoor Map
          </button>
        )}
      </div>
    </div>
  )
}