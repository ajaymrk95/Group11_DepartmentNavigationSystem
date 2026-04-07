import { useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import type { Location } from "../../types/types"
import SearchBar from "./SearchBar"
import locationImage from "../../assets/image.png"

const API_BASE = import.meta.env.VITE_API_URL

type Props = {
  selectedLocation: Location | null
  onSelectLocation: (location: Location | null) => void
}

export default function RoutePanel({ selectedLocation, onSelectLocation }: Props) {

  const navigate = useNavigate()
  const [trendingLocations, setTrendingLocations] = useState<Location[]>([])

  const fetchTrending = useCallback(() => {
    fetch(`${API_BASE}/locations/trending`)
      .then(res => res.json())
      .then(data => setTrendingLocations(data))
      .catch(err => console.error("Failed to fetch trending locations", err))
  }, [])

  useEffect(() => { fetchTrending() }, [fetchTrending])

  // your functionality + fixes main's missing clearSelectedLocation
  function clearSelectedLocation() {
    onSelectLocation(null)
  }

  function handleTrendingClick(location: Location) {
    onSelectLocation(location)
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

      {/* Card — pinned, never scrolls */}
      {selectedLocation && (
        <div className="
          flex-shrink-0
          bg-[#EDE8DC] rounded-2xl overflow-hidden
          border border-[rgba(200,192,176,0.5)]
          shadow-[0_8px_24px_rgba(0,0,0,0.2)]
          transition-[transform,box-shadow] duration-200 ease-in-out
          hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.28)]
          group
        ">
          <div className="h-40 overflow-hidden">
            <img
              src={locationImage}
              alt="Location"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          </div>
          <div className="px-[18px] py-4 flex flex-col gap-2">
            <div className="text-base font-bold text-[#1A3263] tracking-[-0.01em]">
              {selectedLocation.name}
            </div>
            <div className="flex gap-3.5">
              {selectedLocation.room && (
                <span className="text-[11px] font-semibold text-[rgba(26,50,99,0.5)] tracking-[0.04em] uppercase">
                  Room {selectedLocation.room}
                </span>
              )}
              {selectedLocation.floor != null && (
                <span className="text-[11px] font-semibold text-[rgba(26,50,99,0.5)] tracking-[0.04em] uppercase">
                  Floor {selectedLocation.floor}
                </span>
              )}
            </div>
            {selectedLocation.description && (
              <p className="text-[13px] text-[rgba(26,50,99,0.65)] leading-relaxed">
                {selectedLocation.description}
              </p>
            )}
            {selectedLocation.tag && selectedLocation.tag.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {selectedLocation.tag.map((tag: string) => (
                  <span
                    key={tag}
                    className="
                      text-[11px] font-medium
                      bg-[rgba(26,50,99,0.08)] text-[#1A3263]
                      border border-[rgba(26,50,99,0.12)]
                      px-2.5 py-[3px] rounded-full
                      transition-colors duration-[180ms]
                      hover:bg-[rgba(26,50,99,0.16)]
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Frequently Visited — independent scrollable area */}
      <div className="flex flex-col flex-1 min-h-0">
        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#0AC4E0] mb-2.5 flex-shrink-0">
          Frequently Visited
        </p>

        {/* Empty state */}
        {trendingLocations.length === 0 && (
          <div className="flex items-center gap-3 px-3.5 py-[11px] rounded-xl bg-[rgba(246,231,188,0.05)] border border-[rgba(246,231,188,0.08)] cursor-default opacity-50">
            <div className="w-8 h-8 rounded-lg bg-[rgba(10,196,224,0.12)] flex items-center justify-center flex-shrink-0 text-[#0AC4E0]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
            </div>
            <div className="text-[13px] font-semibold text-[#F6E7BC] truncate">
              Search above to explore locations
            </div>
          </div>
        )}

        {/* Scrollable list */}
        {trendingLocations.length > 0 && (
          <div className="
            flex flex-col gap-2 overflow-y-auto pr-0.5
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-white/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-white/20
          ">
            {trendingLocations.map(location => (
              <button
                key={`${location.locationType}-${location.id}`}
                onClick={() => handleTrendingClick(location)}
                className="
                  w-full flex items-center gap-3
                  px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  hover:bg-white/10 hover:border-[#FAB95B]/40
                  transition-all duration-200
                  text-left group
                "
              >
                <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-[rgba(250,185,91,0.15)] flex items-center justify-center">
                  {location.locationType === "BUILDING" ? (
                    <svg className="w-4 h-4 text-[#FAB95B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#FAB95B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F6E7BC] text-sm font-medium truncate group-hover:text-[#FAB95B] transition-colors duration-200">
                    {location.name}
                  </p>
                  <p className="text-[rgba(246,231,188,0.4)] text-xs truncate">
                    {location.locationType === "BUILDING"
                      ? "Building"
                      : location.room
                        ? `Room ${location.room}${location.floor != null ? ` · Floor ${location.floor}` : ""}`
                        : location.category ?? "Room"}
                  </p>
                </div>
                <svg className="w-4 h-4 text-[rgba(246,231,188,0.3)] group-hover:text-[#FAB95B] flex-shrink-0 transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
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