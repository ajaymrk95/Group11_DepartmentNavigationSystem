import { useNavigate } from "react-router-dom"
import type { Location } from "../../types/types"
import locationImage from "../../assets/image.png"

type Props = {
  trendingLocations: Location[]
  trendingOpen: boolean
  setTrendingOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClick: (location: Location) => void
  selectedLocation: Location | null
}

export default function TrendingDropdown({
  trendingLocations,
  trendingOpen,
  setTrendingOpen,
  onClick,
  selectedLocation
}: Props) {

  const navigate = useNavigate()

  const ITEM_HEIGHT = 52
  const MAX_VISIBLE = 5

  if (trendingLocations.length === 0) return null

  return (
    <div className="flex flex-col gap-1">

      {/* Toggle */}
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
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#0AC4E0]">
            Frequently Visited
          </span>
        </div>

        <svg
          className={`w-4 h-4 text-[rgba(246,231,188,0.5)] transition-transform duration-300 ${trendingOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
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
            <button
              key={`${location.locationType}-${location.id}`}
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
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-[#FAB95B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[#F6E7BC] text-sm font-medium truncate">
                  {location.name}
                </p>
              </div>

              <svg className="w-4 h-4 text-[rgba(246,231,188,0.3)] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Location Card */}
      {selectedLocation && (
        <div className="bg-[#EDE8DC] rounded-2xl overflow-hidden border border-[rgba(200,192,176,0.5)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5 mt-2">
          
          <div className="h-[130px] overflow-hidden">
            <img
              src={locationImage}
              alt="Location"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.04]"
            />
          </div>

          <div className="px-4 py-3.5 flex flex-col gap-1.5">
            <div className="text-[15px] font-bold text-[#1A3263]">
              {selectedLocation.name}
            </div>

            <div className="flex gap-3.5">
              {selectedLocation.room && (
                <span className="text-[11px] font-semibold text-[rgba(26,50,99,0.5)] uppercase">
                  Room {selectedLocation.room}
                </span>
              )}
              {selectedLocation.floor != null && (
                <span className="text-[11px] font-semibold text-[rgba(26,50,99,0.5)] uppercase">
                  Floor {selectedLocation.floor}
                </span>
              )}
            </div>

            {selectedLocation.description && (
              <p className="text-xs text-[rgba(26,50,99,0.65)]">
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

            {/* ✅ Indoor Navigation Button (FIXED) */}
            {(() => {
              const locType = selectedLocation.locationType?.toUpperCase()
              const buildingSlug =
                locType === "BUILDING"
                  ? selectedLocation.name.toLowerCase()
                  : selectedLocation.buildingName?.toLowerCase() ?? null

              if (!buildingSlug) return null

              const handleIndoorClick = () => {
                const params = new URLSearchParams()

                if (
                  selectedLocation.buildingEntranceLat != null &&
                  selectedLocation.buildingEntranceLng != null
                ) {
                  params.set("startLng", String(selectedLocation.buildingEntranceLng))
                  params.set("startLat", String(selectedLocation.buildingEntranceLat))
                  params.set("startFloor", "1")
                }

                if (
                  locType === "ROOM" &&
                  selectedLocation.latitude != null &&
                  selectedLocation.longitude != null
                ) {
                  params.set("endLng", String(selectedLocation.longitude))
                  params.set("endLat", String(selectedLocation.latitude))
                  params.set("endFloor", String(selectedLocation.floor ?? 1))
                }

                navigate(`/indoor-navigation/${buildingSlug}?${params.toString()}`)
              }

              return (
                <div className="pt-2 pb-1">
                  <button
                    onClick={handleIndoorClick}
                    className="
                      w-full flex items-center justify-center gap-2
                      px-4 py-3 rounded-xl
                      bg-[#1A3263] text-[#F6E7BC]
                      text-[13.5px] font-bold
                      border border-[rgba(246,231,188,0.15)]
                      transition-all duration-200
                      hover:bg-[#0B2D72] hover:border-[rgba(250,185,91,0.5)] hover:text-[#FAB95B]
                      active:scale-[0.97]
                    "
                  >
                    Indoor Map
                  </button>
                </div>
              )
            })()}
          </div>
        </div>
      )}

    </div>
  )
}