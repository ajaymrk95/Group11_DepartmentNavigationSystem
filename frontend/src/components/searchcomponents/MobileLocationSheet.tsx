import { useRef, useState, useEffect, useCallback } from "react"
import type { Location } from "../../types/types"
import SearchBar from "./SearchBar"
import { useNavigate } from "react-router-dom"
import locationImage from "../../assets/image.png"
import TileSwitcher from "./TileSwitcher"

const API_BASE = "http://localhost:8080"

type Props = {
  selectedLocation: Location | null
  onSelectLocation: (location: Location | null) => void

  tileType: TileType
  setTileType: React.Dispatch<React.SetStateAction<TileType>>
}

type TileType = "light" | "standard" | "satelite"

export default function MobileLocationSheet({ selectedLocation, onSelectLocation, tileType, setTileType }: Props) {

  const sheetRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const screenHeight = window.innerHeight
  const PEEK = 100
  const HALF = screenHeight * 0.55
  const FULL = screenHeight

  const [height, setHeight] = useState(PEEK)
  const [trendingLocations, setTrendingLocations] = useState<Location[]>([])
  const [trendingOpen, setTrendingOpen] = useState(false)

  const startY = useRef(0)
  const startHeight = useRef(0)
  const isDragging = useRef(false)
  const dragging = useRef(false)

  const isExpanded = height > PEEK + 10
  const showBottomBtn = height >= HALF - 20

  // ── Your functionality ──
  const fetchTrending = useCallback(() => {
    fetch(`${API_BASE}/locations/trending`)
      .then(res => res.json())
      .then(data => setTrendingLocations(data))
      .catch(err => console.error("Failed to fetch trending locations", err))
  }, [])

  useEffect(() => { fetchTrending() }, [fetchTrending])

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

  // ── Snap with smooth transition (your branch) ──
  function snapTo(h: number) {
    if (sheetRef.current) {
      sheetRef.current.style.transition = "height 0.3s ease"
      sheetRef.current.style.height = `${h}px`
    }
    setHeight(h)
  }

  function disableTransition() {
    if (sheetRef.current) sheetRef.current.style.transition = "none"
  }

  function setSheetHeight(h: number) {
    if (!sheetRef.current) return
    sheetRef.current.style.height = `${h}px`
  }

  function handleSearchFocus() {
    snapTo(FULL)
    onSelectLocation(null)
  }

  function handleSelect(location: Location | null) {
    if (!location) return
    onSelectLocation(location)
    snapTo(HALF)
  }

  function handlePeekClick() {
    if (!isDragging.current) {
      snapTo(FULL)
    }
  }

  function openSearch() { snapTo(FULL); onSelectLocation(null) }
  function goToNavigate() { navigate("/outdoor-navigation") }

  // ── Drag logic ──
  function startDrag(clientY: number) {
    isDragging.current = false
    dragging.current = true
    startY.current = clientY
    startHeight.current = sheetRef.current?.offsetHeight || PEEK
    disableTransition()
    window.addEventListener("touchmove", onTouchMove)
    window.addEventListener("touchend", stopDrag)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", stopDrag)
  }

  function onTouchStart(e: React.TouchEvent) { startDrag(e.touches[0].clientY) }
  function onMouseDown(e: React.MouseEvent) { startDrag(e.clientY) }

  function updateHeight(clientY: number) {
    const delta = startY.current - clientY
    if (Math.abs(delta) > 5) isDragging.current = true
    let newHeight = startHeight.current + delta
    if (newHeight < PEEK) newHeight = PEEK
    if (newHeight > FULL) newHeight = FULL
    setSheetHeight(newHeight)
  }

  function onTouchMove(e: TouchEvent) { updateHeight(e.touches[0].clientY) }
  function onMouseMove(e: MouseEvent) { updateHeight(e.clientY) }

  function stopDrag() {
    if (!dragging.current) return
    dragging.current = false
    const currentHeight = sheetRef.current?.offsetHeight || PEEK
    const snapPoints = [PEEK, HALF, FULL]
    const snapped = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
    )
    snapTo(snapped)
    window.removeEventListener("touchmove", onTouchMove)
    window.removeEventListener("touchend", stopDrag)
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", stopDrag)
    setTimeout(() => { isDragging.current = false }, 50)
  }

  // Dropdown height calc (your branch)
  const ITEM_HEIGHT = 52
  const MAX_VISIBLE = 5
  const dropdownHeight = Math.min(trendingLocations.length, MAX_VISIBLE) * ITEM_HEIGHT

  return (
    <>
      {/* Top FAB — hidden once panel reaches halfway (main's logic) */}
      {!showBottomBtn && (
        <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
          {/* Home button */}
          <button
            onClick={() => navigate("/")}
            title="Home"
            className="
              flex items-center justify-center w-10 h-10 rounded-full
              bg-[#0B2D72] text-[#F6E7BC]
              shadow-lg transition-all duration-200
              hover:bg-[#FAB95B] hover:text-[#1A3263] active:scale-95
            "
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
          </button>

          {/* ✅ TILE SWITCHER HERE */}
          <TileSwitcher tileType={tileType} setTileType={setTileType} />

          {/* Find Location — only at peek */}
          {/* {!isExpanded && (
            <button
              onClick={openSearch}
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-full
                bg-[#0B2D72] text-[#F6E7BC]
                text-xs font-bold tracking-wide shadow-lg
                transition-all duration-200
                hover:bg-[#FAB95B] hover:text-[#1A3263] active:scale-95
              "
            >
              Find Location
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
              </svg>
            </button>
          )} */}

          <button
            onClick={goToNavigate}
            className="
              flex items-center gap-1.5 px-[18px] py-2.5 rounded-full
              bg-[#0B2D72] text-[#F6E7BC]
              text-xs font-bold tracking-[0.04em] shadow-lg
              transition-all duration-[220ms] ease-in-out
              hover:bg-[#FAB95B] hover:text-[#1A3263] active:scale-95
            "
          >
            Start Navigating
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="
          fixed bottom-0 left-0 right-0 z-50
          flex flex-col
          rounded-t-3xl
          bg-[#0B2D72]
          shadow-[0_-16px_48px_rgba(0,0,0,0.5)]
          border-t border-white/[0.08]
          font-[Outfit,sans-serif]
          overflow-hidden
        "
        style={{ height: PEEK }}
      >

        {/* Handle row — tap to expand (main's UI) */}
        <div
          className="
            relative flex items-center
            px-6 pt-2.5 pb-3.5
            touch-none cursor-grab
            flex-shrink-0 select-none
          "
          onTouchStart={onTouchStart}
          onMouseDown={onMouseDown}
          onClick={handlePeekClick}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-[rgba(246,231,188,0.2)]" />
          <div className="mt-2">
            <div className="text-[24px] font-black text-[#F6E7BC] tracking-[-0.03em] leading-tight">
              View Map
            </div>
            <div className="text-[15px] text-[rgba(246,231,188,0.55)] font-normal mt-0.5 truncate max-w-[260px]">
              {!isExpanded ? "Tap to expand!" : "Search or tap a location"}
            </div>
          </div>
        </div>

        {/* Body — only visible when expanded */}
        {isExpanded && (
          <div className="
            flex-1 overflow-y-auto px-5 pb-2 pt-1
            flex flex-col gap-4
            [scrollbar-width:thin]
            [scrollbar-color:rgba(246,231,188,0.15)_transparent]
          ">
            <SearchBar
              onSelect={handleSelect}
              onFocusSearch={handleSearchFocus}
            />

            {/* STATE 1 — Nothing selected: plain visible list */}
            {!selectedLocation && trendingLocations.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#0AC4E0]">
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

            {/* STATE 1 — Nothing selected, no trending yet: empty state */}
            {!selectedLocation && trendingLocations.length === 0 && (
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#0AC4E0] mb-2">
                  Frequently Visited
                </p>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[rgba(246,231,188,0.05)] border border-[rgba(246,231,188,0.08)] opacity-50">
                  <div className="w-7 h-7 rounded-lg bg-[rgba(10,196,224,0.12)] flex items-center justify-center flex-shrink-0 text-[#0AC4E0]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-[#F6E7BC] truncate">
                    Search above to explore locations
                  </div>
                </div>
              </div>
            )}

            {/* STATE 2 — Location selected: collapsible dropdown ABOVE card */}
            {selectedLocation && (
              <div className="flex flex-col gap-3">

                {/* Collapsible dropdown toggle */}
                {trendingLocations.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setTrendingOpen(prev => !prev)}
                      className="
                        w-full flex items-center justify-between
                        px-4 py-3 rounded-xl
                        bg-white/5 border border-white/10
                        hover:bg-white/10 hover:border-[#FAB95B]/40
                        transition-all duration-200
                      "
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#FAB95B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#0AC4E0]">
                          Frequently Visited
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-[rgba(246,231,188,0.5)] transition-transform duration-300 ${trendingOpen ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown — max 5 items, scrollable */}
                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{ maxHeight: trendingOpen ? `${ITEM_HEIGHT * MAX_VISIBLE}px` : "0px" }}
                    >
                      <div
                        className="
                          flex flex-col gap-1 overflow-y-auto
                          [&::-webkit-scrollbar]:w-1
                          [&::-webkit-scrollbar-track]:bg-transparent
                          [&::-webkit-scrollbar-thumb]:bg-white/10
                          [&::-webkit-scrollbar-thumb]:rounded-full
                        "
                        style={{ maxHeight: `${ITEM_HEIGHT * MAX_VISIBLE}px` }}
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

                {/* Selected location card — below the dropdown */}
                <div className="bg-[#EDE8DC] rounded-2xl overflow-hidden border border-[rgba(200,192,176,0.5)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="h-[130px] overflow-hidden">
                    <img
                      src={locationImage}
                      alt="Location"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.04]"
                    />
                  </div>
                  <div className="px-4 py-3.5 flex flex-col gap-1.5">
                    <div className="text-[15px] font-bold text-[#1A3263] tracking-[-0.01em]">
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
                      <p className="text-xs text-[rgba(26,50,99,0.65)] leading-[1.55]">
                        {selectedLocation.description}
                      </p>
                    )}
                    {selectedLocation.tag && selectedLocation.tag.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {selectedLocation.tag.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium bg-[rgba(26,50,99,0.08)] text-[#1A3263] border border-[rgba(26,50,99,0.12)] px-2.5 py-0.5 rounded-full"
                          >
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
        )}

        {/* Sticky bottom nav button (main's UI) */}
        {showBottomBtn && (
          <div className="px-5 pb-7 pt-3 flex-shrink-0 sticky bottom-0 pointer-events-none">
            <button
              onClick={goToNavigate}
              className="
                pointer-events-auto w-full
                flex items-center justify-between
                px-6 py-4 rounded-full border-none
                bg-[#EDE8DC] text-[#1A3263]
                font-[Outfit,sans-serif] text-sm font-bold
                cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.2)]
                transition-all duration-[220ms] ease-in-out
                hover:bg-[#FAB95B] hover:shadow-[0_8px_24px_rgba(250,185,91,0.35)]
                active:scale-[0.97]
                [&:hover_svg]:translate-x-1
                [&_svg]:transition-transform [&_svg]:duration-200
              "
            >
              Start Navigating
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </button>
          </div>
        )}

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
        hover:bg-white/10 hover:border-[#FAB95B]/40
        active:scale-[0.98]
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
  )
}