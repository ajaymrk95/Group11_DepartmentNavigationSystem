import { useNavigate } from "react-router-dom"
import { useEffect, useState, useCallback } from "react"
import type { Location } from "../../types/types"
import SearchBar from "./SearchBar"
import locationImage from "../../assets/image.png"

const API_BASE = "http://localhost:8080"

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
      bg-[#1A3263]
      border-r border-[#2d4a7a]
      p-6
      shadow-[10px_0_35px_rgba(0,0,0,0.45)]
      backdrop-blur-[2px]
    ">

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-[#e9e4d9] text-xl font-bold tracking-wide">
          Search Location
        </h2>
        <button
          onClick={() => navigate("/")}
          title="Home"
          className="text-[#e9e4d9]/70 hover:text-[#fab75a] hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
        </button>
      </div>

      <p className="text-xs font-semibold tracking-widest uppercase text-[#e9e4d9]/60 mb-5 flex-shrink-0">
        Find a Location
      </p>

      {/* SearchBar — fixed, never shrinks */}
      <div className="flex-shrink-0">
        <SearchBar
          onSelect={onSelectLocation}
          onFocusSearch={() => onSelectLocation(null)}
        />
      </div>

      {/* Selected Location Card — fixed, outside scroll */}
      {selectedLocation && (
        <div className="
          mt-6 flex-shrink-0
          bg-[#e9e4d9] rounded-xl overflow-hidden
          border border-[#c8c0b0] shadow-xl
          transition-all duration-200 hover:-translate-y-[2px]
        ">
          <div className="h-48 overflow-hidden">
            <img
              src={locationImage}
              alt="Location"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.04]"
            />
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[#1a305b] text-md">
                {selectedLocation.name.toUpperCase()}
              </h3>
              <span className="px-2.5 py-0.5 text-sm rounded-full bg-[#f0b35a] border border-[#f0b35a] text-[#1a305b] font-medium">
                {selectedLocation.category?.toUpperCase()}
              </span>
            </div>

            {selectedLocation.category === "INDOOR" && (
              <div className="flex gap-4 text-xs font-medium text-[#1A3263]/60">
                <p>Room {selectedLocation.room}</p>
                {selectedLocation.floor !== undefined && <p>Floor {selectedLocation.floor}</p>}
              </div>
            )}

            {selectedLocation.description && (
              <p className="text-sm text-[#1A3263]/70 leading-relaxed">
                {selectedLocation.description}
              </p>
            )}

            {selectedLocation.tag && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedLocation.tag.map(tag => (
                  <span key={tag} className="text-xs font-medium bg-[#1A3263]/10 text-[#1A3263] border border-[#1A3263]/10 px-3 py-1 rounded-full transition-colors duration-200 hover:bg-[#1A3263]/20">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Frequently Visited — only this section scrolls */}
      {trendingLocations.length > 0 && (
        <div className="flex flex-col mt-6 flex-1 min-h-0">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#e9e4d9]/60 mb-3 flex-shrink-0">
            Frequently Visited
          </p>
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
                  hover:bg-white/10 hover:border-[#fab75a]/40
                  transition-all duration-200
                  text-left group
                "
              >
                <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-[#fab75a]/20 flex items-center justify-center">
                  {location.locationType === "BUILDING" ? (
                    <svg className="w-4 h-4 text-[#fab75a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#fab75a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[#e9e4d9] text-sm font-medium truncate group-hover:text-[#fab75a] transition-colors duration-200">
                    {location.name}
                  </p>
                  <p className="text-[#e9e4d9]/40 text-xs truncate">
                    {location.locationType === "BUILDING"
                      ? "Building"
                      : location.room
                        ? `Room ${location.room}${location.floor != null ? ` · Floor ${location.floor}` : ""}`
                        : location.category ?? "Room"}
                  </p>
                </div>

                <svg className="w-4 h-4 text-[#e9e4d9]/30 group-hover:text-[#fab75a] flex-shrink-0 transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Button — always pinned to bottom */}
      <div className="pt-4 flex-shrink-0">
        <button
          onClick={() => navigate("/outdoor-navigation")}
          className="
            w-full flex items-center justify-between
            px-6 py-4 rounded-full
            bg-[#e9e4d9] text-[#1A3263]
            text-sm font-bold tracking-wide
            shadow-md transition-all duration-200
            hover:bg-[#f0b35a] hover:shadow-2xl
            active:scale-[0.96]
          "
        >
          Start Navigating
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

    </div>
  )
}