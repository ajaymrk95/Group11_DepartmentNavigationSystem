import { useRef, useState } from "react"
import type { Location } from "../../types/types"
import SearchBar from "./SearchBar"
import { useNavigate } from "react-router-dom"
import locationImage from "../../assets/image.png"

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

  // Only used for initial render and snap targets — NlOT updated during drag
  const [height, setHeight] = useState(MIN_HEIGHT)

  const startY = useRef(0)
  const startHeight = useRef(0)
  const dragging = useRef(false)

  function goToNavigate() {
    navigate("/outdoor-navigation")
  }

  function openSearch() {
    setHeight(FULL)
    onSelectLocation(null)
  }

  function handleSearchFocus() {
    setHeight(FULL)
    onSelectLocation(null)
  }

  function handleSelect(location: Location | null) {
    onSelectLocation(location)
    if (location) {
      setHeight(HALF)
    }
  }

  function setSheetHeight(h: number) {
    if (sheetRef.current) {
      sheetRef.current.style.height = `${h}px`
    }
  }

  function enableTransition() {
    if (sheetRef.current) {
      sheetRef.current.style.transition = "height 0.3s ease"
    }
  }

  function disableTransition() {
    if (sheetRef.current) {
      sheetRef.current.style.transition = "none"
    }
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
    // Direct DOM write — no React re-render
    setSheetHeight(newHeight)
  }

  function onTouchMove(e: TouchEvent) { updateHeight(e.touches[0].clientY) }
  function onMouseMove(e: MouseEvent) { updateHeight(e.clientY) }

  function stopDrag() {
    if (!dragging.current) return
    dragging.current = false

    const currentHeight = sheetRef.current?.offsetHeight ?? MIN_HEIGHT

    // Snap to nearest position
    const snapPoints = [MIN_HEIGHT, HALF, FULL]
    const snapped = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
    )

    enableTransition()
    setSheetHeight(snapped)
    setHeight(snapped) // sync React state after snap

    window.removeEventListener("touchmove", onTouchMove)
    window.removeEventListener("touchend", stopDrag)
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", stopDrag)
  }

  function onTouchStart(e: React.TouchEvent) {
    startDrag(e.touches[0].clientY)
  }

  function onMouseDown(e: React.MouseEvent) {
    startDrag(e.clientY)
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          title="Home"
          className="
            flex items-center justify-center
            w-10 h-10 rounded-full
            bg-[#1A3263] text-[#e9e4d9]
            shadow-lg transition-all duration-200
            hover:bg-[#f0b35a] hover:text-[#1A3263]
            active:scale-95
          "
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
        </button>
        {height <= MIN_HEIGHT && (
          <button
            onClick={openSearch}
            className="
              flex items-center gap-2
              px-4 py-2.5 rounded-full
              bg-[#1A3263] text-[#e9e4d9]
              text-xs font-bold tracking-wide
              shadow-lg transition-all duration-200
              hover:bg-[#f0b35a] hover:text-[#1A3263]
              active:scale-95
            "
          >
            Find Location
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
            </svg>
          </button>
        )}
        <button
          onClick={goToNavigate}
          className="
            flex items-center gap-2
            px-4 py-2.5 rounded-full
            bg-[#1A3263] text-[#e9e4d9]
            text-xs font-bold tracking-wide
            shadow-lg transition-all duration-200
            hover:bg-[#f0b35a] hover:text-[#1A3263]
            active:scale-95
          "
        >
          Navigate
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.45)] border-t border-[#2d4a7a]"
        style={{
          height,
          backgroundColor: "#1A3263",
          transition: "height 0.3s ease",
          willChange: "height",
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3 pb-3 touch-none cursor-grab active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onMouseDown={onMouseDown}
        >
          <div className="w-12 h-1.5 rounded-full bg-[#e9e4d9]/40" />
        </div>

        <div className="px-4 pb-6 flex flex-col h-full overflow-hidden">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#e9e4d9]/50 mb-4">
            Find a Location
          </p>
          <SearchBar
            onSelect={handleSelect}
            onFocusSearch={handleSearchFocus}
          />
          {selectedLocation && (
            <div className="
              mt-5
              bg-[#e9e4d9]
              rounded-xl
              overflow-hidden
              border border-[#c8c0b0]
              shadow-xl
              transition-all duration-200
              hover:-translate-y-[2px]
              flex-shrink-0
            ">
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
                    {selectedLocation.floor !== undefined && (
                      <p>Floor {selectedLocation.floor}</p>
                    )}
                  </div>
                )}
                {selectedLocation.description && (
                  <p className="text-sm text-[#1A3263]/70 leading-relaxed">
                    {selectedLocation.description}
                  </p>
                )}
                {selectedLocation.tag && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedLocation.tag.map(tag => (
                      <span
                        key={tag}
                        className="
                          text-xs font-medium
                          bg-[#1A3263]/10 text-[#1A3263]
                          border border-[#1A3263]/10
                          px-3 py-1 rounded-full
                          transition-colors duration-200
                          hover:bg-[#1A3263]/20
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
        </div>
      </div>
    </>
  )
}