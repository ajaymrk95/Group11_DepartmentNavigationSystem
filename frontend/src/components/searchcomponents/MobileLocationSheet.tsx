import { useRef, useState } from "react"
import type { Location } from "../../types/types"
import SearchBar from "./SearchBar"
import { useNavigate } from "react-router-dom"
import locationImage from "../../assets/image.png"

type Props = {
  selectedLocation: Location | null
  onSelectLocation: (location: Location | null) => void
}

export default function MobileLocationSheet({ selectedLocation, onSelectLocation }: Props) {

  const sheetRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const screenHeight = window.innerHeight
  const PEEK = 100
  const HALF = screenHeight * 0.55
  const FULL = screenHeight

  const [height, setHeight] = useState(PEEK)
  const startY = useRef(0)
  const startHeight = useRef(0)
  const isDragging = useRef(false)

  const isExpanded = height > PEEK + 10
  const showBottomBtn = height >= HALF - 20

  function setSheetHeight(h: number) {
    if (!sheetRef.current) return
    sheetRef.current.style.height = `${h}px`
  }

  function handleSearchFocus() {
    setHeight(FULL)
    setSheetHeight(FULL)
    onSelectLocation(null)
  }

  function handleSelect(location: Location | null) {
    if (!location) return
    onSelectLocation(location)
    setHeight(HALF)
    setSheetHeight(HALF)
  }

  function handlePeekClick() {
    if (!isDragging.current) {
      setHeight(FULL)
      setSheetHeight(FULL)
    }
  }

  function startDrag(clientY: number) {
    isDragging.current = false
    startY.current = clientY
    startHeight.current = sheetRef.current?.offsetHeight || PEEK
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
    const currentHeight = sheetRef.current?.offsetHeight || PEEK
    const distPeek = Math.abs(currentHeight - PEEK)
    const distHalf = Math.abs(currentHeight - HALF)
    const distFull = Math.abs(currentHeight - FULL)
    const snapped = distPeek < distHalf && distPeek < distFull ? PEEK
      : distHalf < distFull ? HALF : FULL
    setHeight(snapped)
    setSheetHeight(snapped)
    window.removeEventListener("touchmove", onTouchMove)
    window.removeEventListener("touchend", stopDrag)
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", stopDrag)
    setTimeout(() => { isDragging.current = false }, 50)
  }

  return (
    <>
      {/* Top FAB — hidden once panel reaches halfway */}
      {!showBottomBtn && (
        <button
          onClick={() => navigate("/outdoor-navigation")}
          className="
            fixed top-4 right-4 z-30
            flex items-center gap-1.5
            px-[18px] py-2.5
            rounded-full border-none
            bg-[#0B2D72] text-[#F6E7BC]
            font-[Outfit,sans-serif] text-xs font-bold tracking-[0.04em]
            cursor-pointer shadow-[0_4px_16px_rgba(11,45,114,0.35)]
            transition-all duration-[220ms] ease-in-out
            hover:bg-[#FAB95B] hover:text-[#1A3263]
            active:scale-95
          "
        >
          Start Navigating
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>
      )}

      {/* Bottom sheet */}
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
          transition-[height] duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]
          overflow-hidden
        "
        style={{ height: PEEK }}
      >

        {/* Handle row */}
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
          {/* Drag pill */}
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

        {/* Body */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto px-5 pb-2 pt-1 flex flex-col gap-4 [scrollbar-width:thin] [scrollbar-color:rgba(246,231,188,0.15)_transparent]">

            <SearchBar
              onSelect={handleSelect}
              onFocusSearch={handleSearchFocus}
            />

            {/* Empty state when nothing selected */}
            {!selectedLocation && (
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#0AC4E0] mb-2">
                  Frequently Visited
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[rgba(246,231,188,0.05)] border border-[rgba(246,231,188,0.08)] opacity-50">
                    <div className="w-7 h-7 rounded-lg bg-[rgba(10,196,224,0.12)] flex items-center justify-center flex-shrink-0 text-[#0AC4E0]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#F6E7BC] truncate">
                        Search above to explore locations
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected location card */}
            {selectedLocation && (
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
            )}

          </div>
        )}

        {/* Sticky bottom nav button */}
        {showBottomBtn && (
          <div className="px-5 pb-7 pt-3 flex-shrink-0 sticky bottom-0 pointer-events-none">
            <button
              onClick={() => navigate("/outdoor-navigation")}
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