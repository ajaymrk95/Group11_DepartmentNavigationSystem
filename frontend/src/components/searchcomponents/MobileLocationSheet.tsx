import { useRef, useState } from "react"
import type { Location } from "../../data/locations"
import SearchBar from "./SearchBar"
import { useNavigate } from "react-router-dom"
import locationImage from "../../assets/image.png"

type Props = {
locations: Location[]
selectedLocation: Location | null
onSelectLocation: (location: Location | null) => void
}

export default function MobileLocationSheet({
locations,
selectedLocation,
onSelectLocation
}: Props) {

const sheetRef = useRef<HTMLDivElement>(null)
const navigate = useNavigate()

const screenHeight = window.innerHeight
const MIN_HEIGHT = 30
const HALF = screenHeight * 0.45
const FULL = screenHeight

const [height, setHeight] = useState(MIN_HEIGHT)
const startY = useRef(0)
const startHeight = useRef(0)

function goToNavigate() {
navigate("/")
}

function setSheetHeight(h: number) {
if (!sheetRef.current) return
sheetRef.current.style.height = `${h}px`
}

function openSearch() {
setHeight(FULL)
setSheetHeight(FULL)
onSelectLocation(null)
}

function handleSearchFocus() {
setHeight(FULL)
setSheetHeight(FULL)
onSelectLocation(null)
}

function handleSelect(location: Location) {
onSelectLocation(location)
setHeight(HALF)
setSheetHeight(HALF)
}

function startDrag(clientY: number) {
startY.current = clientY
startHeight.current = sheetRef.current?.offsetHeight || MIN_HEIGHT


window.addEventListener("touchmove", onTouchMove)
window.addEventListener("touchend", stopDrag)
window.addEventListener("mousemove", onMouseMove)
window.addEventListener("mouseup", stopDrag)


}

function onTouchStart(e: React.TouchEvent) {
startDrag(e.touches[0].clientY)
}

function onMouseDown(e: React.MouseEvent) {
startDrag(e.clientY)
}

function updateHeight(clientY: number) {
const delta = startY.current - clientY
let newHeight = startHeight.current + delta


if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT
if (newHeight > FULL) newHeight = FULL

setSheetHeight(newHeight)


}

function onTouchMove(e: TouchEvent) { updateHeight(e.touches[0].clientY) }
function onMouseMove(e: MouseEvent) { updateHeight(e.clientY) }

function stopDrag() {
const currentHeight = sheetRef.current?.offsetHeight || MIN_HEIGHT
setHeight(currentHeight)


window.removeEventListener("touchmove", onTouchMove)
window.removeEventListener("touchend", stopDrag)
window.removeEventListener("mousemove", onMouseMove)
window.removeEventListener("mouseup", stopDrag)


}

return (
<> <div className="fixed top-4 right-4 z-30 flex items-center gap-2">


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
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
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
    className="
      fixed bottom-0 left-0 right-0 z-50
      rounded-t-2xl
      shadow-[0_-10px_30px_rgba(0,0,0,0.45)]
      border-t border-[#2d4a7a]
    "
    style={{ height, backgroundColor: "#1A3263" }}
  >

    {/* Drag Handle */}
    <div
      className="flex justify-center pt-3 pb-3 touch-none cursor-grab"
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
        locations={locations}
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

            <h3 className="text-base font-semibold text-[#1A3263]">
              {selectedLocation.name}
            </h3>

            <div className="flex gap-4 text-xs font-medium text-[#1A3263]/60">

              <p>Room {selectedLocation.room}</p>

              {selectedLocation.floor !== undefined && (
                <p>Floor {selectedLocation.floor}</p>
              )}

            </div>

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
                      text-xs
                      font-medium
                      bg-[#1A3263]/10
                      text-[#1A3263]
                      border border-[#1A3263]/10
                      px-3 py-1
                      rounded-full
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
