import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import type { Location } from "../../types/types"
import SearchBar from "../searchcomponents/SearchBar"
import locationImage from "../../assets/image.png"

type Props = {
  onRouteRequest: (start: Location, end: Location) => void
  onClose: () => void
  mapDestination?: Location | null
}

export default function RoutePanel({ onRouteRequest, onClose, mapDestination }: Props) {
  const [start, setStart] = useState<Location | null>(null)
  const [end, setEnd] = useState<Location | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (mapDestination) {
      setEnd(mapDestination)
    }
  }, [mapDestination])

  const handleSwap = () => {
    const temp = start
    setStart(end)
    setEnd(temp)
  }

  return (
    <div className="
      h-full w-full flex flex-col
      bg-[#1A3263]
      border-r border-[#2d4a7a]
      shadow-[10px_0_35px_rgba(0,0,0,0.45)]
      backdrop-blur-[2px]
      overflow-y-auto
    ">

      {/* Header with nav buttons */}
      <div className="px-6 pt-5 pb-4 flex justify-between items-center shrink-0">
        <h2 className="text-[#e9e4d9] text-xl font-bold tracking-wide">
          Outdoor Navigation
        </h2>
        <div className="flex items-center gap-2">
          {/* Home button */}
          <button
            onClick={() => navigate("/")}
            title="Home"
            className="text-[#e9e4d9]/70 hover:text-[#fab75a] hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
          </button>
          {/* Search Location button */}
          <button
            onClick={() => navigate("/search-location")}
            title="Search Location"
            className="text-[#e9e4d9]/70 hover:text-[#fab75a] hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3" />
            </svg>
          </button>
          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="md:hidden text-[#e9e4d9]/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Section Title */}
      <p className="px-6 text-xs font-semibold tracking-widest uppercase text-[#e9e4d9]/60 mb-4">
        Plan your route
      </p>

      {/* Search Inputs Area */}
      <div className="px-6 flex-1 flex flex-col">
        <div className="space-y-4 relative">

          <div className="relative z-20">
            <SearchBar
              label="Choose starting point..."
              onSelect={setStart}
              iconType="start"
              selectedLoc={start}
              showQr={true}
              useQrResult={true}
              showFilters={false}
              showMyLocation={true}
            />
          </div>

          {/* Swap button */}
          <div className="absolute right-2 top-[42px] z-30">
            <button
              onClick={handleSwap}
              className="bg-[#e9e4d9] text-[#1A3263] p-3.5 rounded-full border border-[#c8c0b0] shadow-md hover:bg-[#fab75a] hover:text-[#1a305b] hover:border-[#fab75a] transition-colors"
              title="Swap locations"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <div className="relative z-10 pt-2">
            <SearchBar
              label="Choose destination..."
              onSelect={setEnd}
              iconType="end"
              selectedLoc={end}
              showQr={false}
              useQrResult={false}
              showFilters={false}
              showMyLocation={false}
            />
          </div>
        </div>

        {/* Rich Destination Card — same style as SearchLocation */}
        {end && (
          <div className="
            mt-6
            bg-[#e9e4d9]
            rounded-xl
            overflow-hidden
            border border-[#c8c0b0]
            shadow-xl
            transition-all duration-200
            hover:-translate-y-[2px]
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
                  {end.name.toUpperCase()}
                </h3>

                {end.category && (
                  <span
                    className="
                      px-2.5 py-0.5
                      text-sm
                      rounded-full
                      bg-[#f0b35a]
                      border border-[#f0b35a]
                      text-[#1a305b]
                      font-medium
                    "
                  >
                    {end.category.toUpperCase()}
                  </span>
                )}
              </div>

              {end.category === "INDOOR" && (
                <div className="flex gap-4 text-xs font-medium text-[#1A3263]/60">
                  {end.room && <p>Room {end.room}</p>}
                  {end.floor !== undefined && <p>Floor {end.floor}</p>}
                </div>
              )}

              {end.description && (
                <p className="text-sm text-[#1A3263]/70 leading-relaxed">
                  {end.description}
                </p>
              )}

              {end.tag && end.tag.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {end.tag.map(tag => (
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

      {/* Find Route Button */}
      <div className="p-6 mt-auto shrink-0">
        <button
          disabled={!start || !end}
          onClick={() => {
            if (start && end) {
              onRouteRequest(start, end)
              onClose()
            }
          }}
          className="
            w-full flex items-center justify-between
            px-6 py-4
            rounded-full
            bg-[#e9e4d9]
            text-[#1A3263]
            text-sm font-bold tracking-wide
            shadow-md
            transition-all duration-200
            hover:bg-[#f0b35a]
            hover:shadow-2xl
            active:scale-[0.96]
            disabled:bg-[#547792]/20 disabled:text-[#547792]/50 disabled:cursor-not-allowed
          "
        >
          Find Route

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

    </div>
  )
}