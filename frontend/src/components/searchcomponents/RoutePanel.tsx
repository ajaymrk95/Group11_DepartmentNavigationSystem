import { useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import type { Location } from "../../types/types"
import SearchBar from "./SearchBar"
import TrendingDropdown from "./TrendingDropdown"

const API_BASE = import.meta.env.VITE_API_URL

type Props = {
  selectedLocation: Location | null
  onSelectLocation: (location: Location | null) => void
}

export default function RoutePanel({ selectedLocation, onSelectLocation }: Props) {

  const navigate = useNavigate()
  const [trendingLocations, setTrendingLocations] = useState<Location[]>([])
  const [trendingOpen, setTrendingOpen] = useState(false)

  const fetchTrending = useCallback(() => {
    fetch(`${API_BASE}/locations/trending`)
      .then(res => res.json())
      .then(data => setTrendingLocations(data))
      .catch(err => console.error("Failed to fetch trending locations", err))
  }, [])

  useEffect(() => { fetchTrending() }, [fetchTrending])
  useEffect(() => {
    if (!selectedLocation) {
      setTrendingOpen(true)
    } else {
      setTrendingOpen(false)
    }
  }, [selectedLocation])

  // your functionality + fixes main's missing clearSelectedLocation
  function clearSelectedLocation() {
    onSelectLocation(null)
  }

  function handleTrendingClick(location: Location) {
    onSelectLocation(location)
    setTrendingOpen(false)

    if (location.locationType) {
      fetch(`${API_BASE}/locations/visit?id=${location.id}&locationType=${location.locationType}`, {
        method: "POST",
      })
        .then(() => fetchTrending())
        .catch(err => console.error("Failed to record visit", err))
    }
  }

  return (
    <div className="
      h-full w-full flex flex-col relative
      bg-[#0B2D72]
      border-r border-[rgba(45,74,122,0.6)]
      shadow-[10px_0_35px_rgba(0,0,0,0.35)]
      font-[Outfit,sans-serif]
      [scrollbar-width:thin]
      [scrollbar-color:rgba(246,231,188,0.15)_transparent]
    ">

      {/* Header */}
      <div className="px-8 pt-10 pb-8 flex-shrink-0 border-b border-[rgba(255,255,255,0.07)]">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-[#FAB95B] text-[28px] font-extrabold tracking-tight leading-none">View Map</h2>
            <p className="text-[rgba(246,231,188,0.55)] text-[12px] mt-1.5 tracking-[0.2em] font-semibold uppercase">Search a location to explore</p>
          </div>
          <button
            onClick={() => navigate("/")}
            title="Go to Home"
            className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(246,231,188,0.5)] flex items-center justify-center border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(250,185,91,0.2)] hover:text-[#FAB95B]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
          </button>
        </div>
      </div>

      {/* Body — scrollable area */}
      <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto pb-36"
        style={{ flex: "1 1 0", minHeight: 0 }}
      >

      <SearchBar
        onSelect={onSelectLocation}
        onFocusSearch={clearSelectedLocation}
      />

      <TrendingDropdown
        trendingLocations={trendingLocations}
        trendingOpen={trendingOpen}
        setTrendingOpen={setTrendingOpen}
        onClick={handleTrendingClick}
        selectedLocation={selectedLocation}
      />

      </div>

      {/* Footer — pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-4 bg-gradient-to-t from-[#0B2D72] via-[#0B2D72]/95 to-transparent z-10">
        <button
          onClick={() => navigate("/outdoor-navigation")}
          className="
            pointer-events-auto w-full
            flex items-center justify-between
            px-6 py-4 rounded-full border-none
            bg-[#EDE8DC] text-[#1A3263]
            font-[Outfit,sans-serif] text-sm font-bold tracking-[0.01em]
            cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.2)]
            transition-all duration-[220ms] ease-in-out
            hover:bg-[#FAB95B] hover:shadow-[0_8px_24px_rgba(250,185,91,0.35)]
            active:scale-[0.97]
            [&:hover_svg]:translate-x-[3px]
            [&_svg]:transition-transform [&_svg]:duration-200
          "
        >
          Start Navigating
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      </div>

    </div>
  )
}