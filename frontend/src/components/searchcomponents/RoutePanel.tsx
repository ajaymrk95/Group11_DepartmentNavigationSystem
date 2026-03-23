import { useNavigate } from "react-router-dom"
import type { Location } from "../../types/types"
import SearchBar from "./SearchBar"
import locationImage from "../../assets/image.png"

type Props = {
  selectedLocation: Location | null
  onSelectLocation: (location: Location | null) => void
}

export default function RoutePanel({ selectedLocation, onSelectLocation }: Props) {

  const navigate = useNavigate()

  function clearSelectedLocation() {
    onSelectLocation(null)
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

      {/* Header */}
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

          {/* Home button */}
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
      <div className="px-6 py-5 flex-1 flex flex-col gap-6">

        <SearchBar
          onSelect={onSelectLocation}
          onFocusSearch={clearSelectedLocation}
        />

        {!selectedLocation && (
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#0AC4E0] mb-2.5">
              Frequently Visited
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3.5 py-[11px] rounded-xl bg-[rgba(246,231,188,0.05)] border border-[rgba(246,231,188,0.08)] cursor-default opacity-50">
                <div className="w-8 h-8 rounded-lg bg-[rgba(10,196,224,0.12)] flex items-center justify-center flex-shrink-0 text-[#0AC4E0]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#F6E7BC] truncate">
                    Search above to explore locations
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedLocation && (
          <div className="
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

      </div>

      {/* Footer */}
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