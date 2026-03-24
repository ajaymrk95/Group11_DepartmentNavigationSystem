import { useRef, useState, useEffect, useCallback } from "react"
import type { Location } from "../../types/types"
import SearchBar from "./SearchBar"
import { useNavigate } from "react-router-dom"
import locationImage from "../../assets/image.png"

const API_BASE = "http://localhost:8080"

type Props = {
  selectedLocation: Location | null
  onSelectLocation: (location: Location | null) => void
}

export default function MobileLocationSheet({
  selectedLocation,
  onSelectLocation,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const screenHeight = window.innerHeight
  const MIN_HEIGHT = 30
  const HALF = screenHeight * 0.45
  const FULL = screenHeight

  const [height, setHeight] = useState(MIN_HEIGHT)
  const [trendingLocations, setTrendingLocations] = useState<Location[]>([])
  const [trendingOpen, setTrendingOpen] = useState(false)

  const startY = useRef(0)
  const startHeight = useRef(0)
  const dragging = useRef(false)

  const fetchTrending = useCallback(() => {
    fetch(`${API_BASE}/locations/trending`)
      .then(res => res.json())
      .then(data => setTrendingLocations(data))
      .catch(err => console.error("Failed to fetch trending locations", err))
  }, [])

  useEffect(() => { fetchTrending() }, [fetchTrending])

  // Close dropdown when selection is cleared
  useEffect(() => {
    if (!selectedLocation) setTrendingOpen(false)
  }, [selectedLocation])

  function handleTrendingClick(location: Location) {
    onSelectLocation(location)
    setTrendingOpen(false)
    snapTo(HALF)
    if (location.locationType) {
      fetch(`${API_BASE}/locations/visit?id=${location.id}&locationType=${location.locationType}`, {
        method: "POST",
      })
        .then(() => fetchTrending())
        .catch(err => console.error("Failed to record visit", err))
    }
  }

  function snapTo(h: number) {
    if (sheetRef.current) {
      sheetRef.current.style.transition = "height 0.3s ease"
      sheetRef.current.style.height = `${h}px`
    }
    setHeight(h)
  }

  function goToNavigate() { navigate("/outdoor-navigation") }
  function openSearch() { snapTo(FULL); onSelectLocation(null) }
  function handleSearchFocus() { snapTo(FULL); onSelectLocation(null) }
  function handleSelect(location: Location | null) {
    onSelectLocation(location)
    if (location) snapTo(HALF)
  }

  function disableTransition() {
    if (sheetRef.current) sheetRef.current.style.transition = "none"
  }

  function startDrag(clientY: number) {
    startY.current = clientY
    startHeight.current = sheetRef.current?.offsetHeight ?? MIN_HEIGHT
    dragging.current = true
    disableTransition()
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend", stopDrag)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", stopDrag)
  }

  function updateHeight(clientY: number) {
    if (!dragging.current) return
    const delta = startY.current - clientY
    let newHeight = startHeight.current + delta
    if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT
    if (newHeight > FULL) newHeight = FULL
    if (sheetRef.current) sheetRef.current.style.height = `${newHeight}px`
  }

  function onTouchMove(e: TouchEvent) { updateHeight(e.touches[0].clientY) }
  function onMouseMove(e: MouseEvent) { updateHeight(e.clientY) }

  function stopDrag() {
    if (!dragging.current) return
    dragging.current = false
    const currentHeight = sheetRef.current?.offsetHeight ?? MIN_HEIGHT
    const snapPoints = [MIN_HEIGHT, HALF, FULL]
    const snapped = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
    )
    snapTo(snapped)
    window.removeEventListener("touchmove", onTouchMove)
    window.removeEventListener("touchend", stopDrag)
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", stopDrag)
  }

  function onTouchStart(e: React.TouchEvent) { startDrag(e.touches[0].clientY) }
  function onMouseDown(e: React.MouseEvent) { startDrag(e.clientY) }

  // Each trending item ~52px, cap visible at 5
  const ITEM_HEIGHT = 52
  const MAX_VISIBLE = 5
  const dropdownHeight = Math.min(trendingLocations.length, MAX_VISIBLE) * ITEM_HEIGHT

  return (
    <>
      {/* Floating top-right buttons */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          title="Home"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1A3263] text-[#e9e4d9] shadow-lg transition-all duration-200 hover:bg-[#f0b35a] hover:text-[#1A3263] active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
        </button>

        {height <= MIN_HEIGHT && (
          <button onClick={openSearch} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1A3263] text-[#e9e4d9] text-xs font-bold tracking-wide shadow-lg transition-all duration-200 hover:bg-[#f0b35a] hover:text-[#1A3263] active:scale-95">
            Find Location
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
            </svg>
          </button>
        )}

        <button onClick={goToNavigate} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1A3263] text-[#e9e4d9] text-xs font-bold tracking-wide shadow-lg transition-all duration-200 hover:bg-[#f0b35a] hover:text-[#1A3263] active:scale-95">
          Navigate
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.45)] border-t border-[#2d4a7a] overflow-hidden"
        style={{
          height,
          backgroundColor: "#1A3263",
          transition: "height 0.3s ease",
          willChange: "height",
        }}
      >
        <div className="h-full flex flex-col">

          {/* Drag Handle */}
          <div
            className="flex justify-center pt-3 pb-3 touch-none cursor-grab active:cursor-grabbing flex-shrink-0"
            onTouchStart={onTouchStart}
            onMouseDown={onMouseDown}
          >
            <div className="w-12 h-1.5 rounded-full bg-[#e9e4d9]/40" />
          </div>

          {/* Label + Search bar */}
          <div className="px-4 flex-shrink-0">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#e9e4d9]/50 mb-4">
              Find a Location
            </p>
            <SearchBar
              onSelect={handleSelect}
              onFocusSearch={handleSearchFocus}
            />
          </div>

          {/* ── NO SELECTION: normal scrollable trending list ── */}
          {!selectedLocation && trendingLocations.length > 0 && (
            <div className="
              flex-1 min-h-0 overflow-y-auto
              px-4 pb-6 mt-5
              flex flex-col gap-2
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-white/10
              [&::-webkit-scrollbar-thumb]:rounded-full
              hover:[&::-webkit-scrollbar-thumb]:bg-white/20
            ">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#e9e4d9]/60 mb-1 flex-shrink-0">
                Frequently Visited
              </p>
              {trendingLocations.map(location => (
                <TrendingItem
                  key={`${location.locationType}-${location.id}`}
                  location={location}
                  onClick={handleTrendingClick}
                />
              ))}
            </div>
          )}

          {/* Trending Dropdown */}
          {trendingLocations.length > 0 && (
            <div className="flex-shrink-0 px-4 mt-5">

              {/* Toggle button */}
              <button
                onClick={() => setTrendingOpen(prev => !prev)}
                className="
                  w-full flex items-center justify-between
                  px-4 py-3 rounded-xl
                  bg-white/5 border border-white/10
                  hover:bg-white/10 hover:border-[#fab75a]/40
                  transition-all duration-200
                "
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#fab75a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-semibold tracking-widest uppercase text-[#e9e4d9]/60">
                    Frequently Visited
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-[#e9e4d9]/50 transition-transform duration-300 ${trendingOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Animated dropdown list, scrollable after 5 items */}
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: trendingOpen ? `${dropdownHeight}px` : "0px" }}
              >
                <div
                  className="
                    flex flex-col gap-1 mt-1 overflow-y-auto
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-white/10
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-white/20
                  "
                  style={{ maxHeight: `${dropdownHeight}px` }}
                >
                  {trendingLocations.map(location => (
                    <TrendingItem
                      key={`${location.locationType}-${location.id}`}
                      location={location}
                      onClick={handleTrendingClick}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── LOCATION SELECTED: card + trending as collapsible dropdown ── */}
          {selectedLocation && (
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 mt-5 flex flex-col gap-3
              [&::-webkit-scrollbar]:w-1
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-white/10
              [&::-webkit-scrollbar-thumb]:rounded-full
            ">

              {/* Location Card */}
              <div className="flex-shrink-0 bg-[#e9e4d9] rounded-xl overflow-hidden border border-[#c8c0b0] shadow-xl">
                <div className="h-40 overflow-hidden">
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
                    <p className="text-sm text-[#1A3263]/70 leading-relaxed">{selectedLocation.description}</p>
                  )}

                  {selectedLocation.tag && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedLocation.tag.map(tag => (
                        <span key={tag} className="text-xs font-medium bg-[#1A3263]/10 text-[#1A3263] border border-[#1A3263]/10 px-3 py-1 rounded-full transition-colors duration-200 hover:bg-[#1A3263]/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              
            </div>
          )}

        </div>
      </div>
    </>
  )
}

function TrendingItem({ location, onClick }: { location: Location; onClick: (l: Location) => void }) {
  return (
    <button
      onClick={() => onClick(location)}
      className="
        w-full flex items-center gap-3
        px-4 py-3 rounded-xl
        bg-white/5 border border-white/10
        hover:bg-white/10 hover:border-[#fab75a]/40
        active:scale-[0.98]
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
  )
}