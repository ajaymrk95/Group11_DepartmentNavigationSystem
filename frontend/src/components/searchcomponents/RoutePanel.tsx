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
      h-full w-full flex flex-col
      bg-[#0B2D72]
      border-r border-[rgba(45,74,122,0.6)]
      shadow-[10px_0_35px_rgba(0,0,0,0.35)]
      font-[Outfit,sans-serif]
      overflow-y-auto
      [scrollbar-width:thin]
      [scrollbar-color:rgba(246,231,188,0.15)_transparent]
    ">

      {/* Header — main's UI */}
      <div className="px-6 pt-7 pb-5 flex-shrink-0 border-b border-[rgba(246,231,188,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[26px] font-extrabold text-[#F6E7BC] tracking-[-0.02em] leading-[1.1]">
              View Map
            </div>
            <div className="text-[15px] font-normal text-[rgba(246,231,188,0.45)] mt-[5px] tracking-[0.01em]">
              Search a location to explore
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            title="Go to Home"
            className="
              flex-shrink-0 mt-1
              w-9 h-9 rounded-xl
              flex items-center justify-center
              bg-[rgba(246,231,188,0.08)] text-[rgba(246,231,188,0.6)]
              border border-[rgba(246,231,188,0.1)]
              transition-all duration-[180ms] ease-in-out
              hover:bg-[rgba(246,231,188,0.15)] hover:text-[#F6E7BC] hover:border-[rgba(246,231,188,0.2)]
              active:scale-95
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      {/* Body */}
      <div className="px-6 py-5 flex-1 flex flex-col gap-4 min-h-0">

      <SearchBar
        onSelect={onSelectLocation}
        onFocusSearch={clearSelectedLocation}
      />

      {/* Frequently Visited — independent scrollable area */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-h-0">
          <TrendingDropdown
            trendingLocations={trendingLocations}
            trendingOpen={trendingOpen}
            setTrendingOpen={setTrendingOpen}
            onClick={handleTrendingClick}
            selectedLocation={selectedLocation}
          />
        </div>
      </div>

      </div>

      {/* Footer — main's UI */}
      <div className="px-6 pb-7 pt-5 flex-shrink-0 sticky bottom-0 z-10 pointer-events-none">
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