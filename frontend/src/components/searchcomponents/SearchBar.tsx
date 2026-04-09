import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import type { Location } from "../../types/types"
import SearchResults from "./SearchResults"
import { useCurrentLocation } from "../../hooks/useCurrentLocation"

type Props = {
  onSelect: (location: Location | null) => void
  onFocusSearch?: () => void
  label?: string
  iconType?: "start" | "end"
  selectedLoc?: Location | null
  showQr?: boolean
  useQrResult?: boolean
  showFilters?: boolean
  showMyLocation?: boolean
}

const filters = [
  "Faculty",
  "Lab",
  "Classroom",
  "Toilet",
  "Office",
  "Indoor",
  "Outdoor",
]

export default function SearchBar({
  onSelect,
  onFocusSearch,
  label = "Search location...",
  iconType,
  selectedLoc,
  showQr = false,
  useQrResult = false,
  showFilters = true,
  showMyLocation = false,
}: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Location[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)
  const [gpsAlert, setGpsAlert] = useState<string | null>(null)

  const navigate = useNavigate()
  const location = useLocation()

  const { location: currentCoords, error: locationError } = useCurrentLocation()
  const myLocation: Location | null = currentCoords
    ? {
        id: -1,
        name: "My Location",
        room: null,
        category: null,
        description: "Your current position",
        latitude: currentCoords[0],
        longitude: currentCoords[1],
        tag: [],
        floor: null,
      }
    : null

  useEffect(() => {
    if (selectedLoc) {
      setQuery(selectedLoc.name)
    } else if (selectedLoc === null) {
      setQuery("")
    }
  }, [selectedLoc])

  useEffect(() => {
    if (!useQrResult) return
    const qrValue = location.state?.qrData
    if (!qrValue) return

    async function handleQr() {
      setQrError(null)
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/locations/search?q=${encodeURIComponent(qrValue)}`
        )
        const data = await res.json()
        if (!data.length) {
          setQrError("No location matched the scanned QR code.")
          navigate(location.pathname, { replace: true })
          return
        }
        const loc = data[0]
        const mapped: Location = {
          id: loc.id,
          name: loc.name,
          category: loc.category ?? null,
          room: loc.room ?? null,
          description: loc.description ?? null,
          latitude: loc.latitude ?? null,
          longitude: loc.longitude ?? null,
          tag: loc.tag || [],
          floor: loc.floor ?? null,
          locationType: loc.locationType ?? undefined,
          buildingName: loc.buildingName ?? null,
          buildingEntranceLat: loc.buildingEntranceLat ?? null,
          buildingEntranceLng: loc.buildingEntranceLng ?? null,
        }
        onSelect(mapped)
        setQuery(mapped.name)
        setOpen(false)
        navigate(location.pathname, { replace: true })
      } catch (err) {
        setQrError("Couldn't reach the server. Please check your connection and try again.")
        navigate(location.pathname, { replace: true })
        console.error("QR scanning failed:", err)
      }
    }
    handleQr()
  }, [location.state, useQrResult])

  async function fetchResults(value: string) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/locations/search?q=${encodeURIComponent(value)}`)
      const data = await res.json()

      if (!Array.isArray(data)) {
           console.error("Expected an array but got:", data);
           setResults([]);
           return;
      }
      const mapped = data.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        category: loc.category ?? null,
        room: loc.room ?? null,
        description: loc.description ?? null,
        latitude: loc.latitude ?? null,
        longitude: loc.longitude ?? null,
        tag: loc.tag || [],
        floor: loc.floor ?? null,
        locationType: loc.locationType ?? undefined,
        buildingName: loc.buildingName ?? null,
        buildingEntranceLat: loc.buildingEntranceLat ?? null,
        buildingEntranceLng: loc.buildingEntranceLng ?? null,
      }))
      console.log(mapped)
      setResults(mapped)
    } catch (err) {
      console.error("Search failed:", err)
    }
  }

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    setOpen(true)
    setQrError(null)

    if (value.trim() === "") {
      setResults([])
      onSelect(null)
      return
    }
    await fetchResults(value)
  }

  async function handleFilter(filter: string) {
    onFocusSearch?.()
    setActiveFilter(filter)
    setOpen(true)          // ← fix: was missing, results never showed
    await fetchResults(filter)
  }

  function handleSelect(loc: Location) {
    setQuery(loc.name)
    setResults([])
    setActiveFilter(null)
    setOpen(false)
    onSelect(loc)

    if (loc.id !== -1 && loc.locationType) {
      fetch(`${import.meta.env.VITE_API_URL}/locations/visit?id=${loc.id}&locationType=${loc.locationType}`, {
        method: "POST",
      }).catch(err => console.error("Failed to record visit", err))
    }
  }

  function renderIcon() {
    if (iconType === "start") {
      return <div className="w-4 h-4 rounded-full border-[4px] border-[#547792]" />
    }
    if (iconType === "end") {
      return (
        <svg className="w-5 h-5 text-[#1a305b]" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3" />
      </svg>
    )
  }

  const isRoutingMode = iconType !== undefined

  return (
    <div className={`relative w-full ${!isRoutingMode ? "bg-[#E8E2DB] p-4 rounded-xl shadow-md" : ""}`}>

      <div
        className={`
          flex items-center bg-white
          border rounded-xl shadow-sm px-4 py-2
          focus-within:ring-2 focus-within:ring-[#547792] focus-within:border-transparent
          transition-all
          ${isRoutingMode ? "border-[#547792]/30" : "border-gray-200"}
        `}
      >
        <div className="flex-shrink-0 w-6 flex justify-center mr-3">
          {renderIcon()}
        </div>

        <input
          type="text"
          placeholder={label}
          value={query}
          onChange={handleSearch}
          onFocus={() => {
            onFocusSearch?.()
            if (results.length > 0) setOpen(true)  // ← fix: reopen if results exist on refocus
          }}
          className="
            w-full py-1.5 bg-transparent
            text-[#1a305b] text-base font-medium
            placeholder:text-gray-500 placeholder:font-normal
            focus:outline-none
          "
        />

        {showQr && (
          <button
            type="button"
            className="ml-2 flex-shrink-0 text-[#1a305b] hover:text-[#547792]"
            onClick={() => {
              if (myLocation) {
                handleSelect(myLocation);
              } else {
                if (locationError) {
                  setGpsAlert(`Unable to get location: ${locationError}`);
                } else {
                  setGpsAlert("Still waiting for location... please ensure location access is allowed and try again in a few seconds.");
                }
              }
            }}
            title="Use My Location"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m18 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0z" />
            </svg>
          </button>
        )}
      </div>

      {qrError && (
        <div
          className="mt-2 flex items-start gap-3 bg-[#1A3263] border border-[#547792] rounded-xl px-4 py-3 shadow-md"
          style={{ borderLeft: "4px solid #FAB95B", animation: "qrSlideIn 0.25s ease" }}
        >
          <div
            className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(250,185,91,0.15)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#FAB95B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#E8E2DB] mb-0.5">Invalid QR Code</p>
            <p className="text-xs text-[#547792] leading-relaxed">{qrError}</p>
          </div>
          <button onClick={() => setQrError(null)} className="flex-shrink-0 text-[#547792] hover:text-[#E8E2DB] transition-colors mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes qrSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {gpsAlert && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#1A3263] border-2 border-[#FAB95B] rounded-2xl p-6 shadow-2xl max-w-sm w-full relative" style={{ animation: "qrSlideIn 0.3s ease" }}>
            <div className="absolute top-4 right-4 cursor-pointer text-[#547792] hover:text-[#FAB95B] transition-colors" onClick={() => setGpsAlert(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#FAB95B]/10 rounded-full flex items-center justify-center mb-4 border border-[#FAB95B]/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FAB95B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#E8E2DB] mb-2">Location Unavailable</h3>
              <p className="text-sm text-[#E8E2DB]/80 leading-relaxed">
                {gpsAlert}
              </p>
              <button 
                onClick={() => setGpsAlert(null)}
                className="mt-6 px-6 py-2 bg-[#FAB95B] text-[#1A3263] font-bold rounded-xl hover:bg-[#f0b35a] transition-colors w-full"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilters && !isRoutingMode && (
        <>
          <div className="mt-5 mb-2 text-sm font-semibold text-[#1a305b]">Filters</div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter
              return (
                <button
                  key={filter}
                  onClick={() => handleFilter(filter)}
                  className={`
                    px-4 py-1.5 text-sm rounded-full border
                    transition-all duration-150 hover:scale-[1.03] active:scale-[0.96]
                    ${isActive
                      ? "bg-[#f0b35a] border-[#f0b35a] text-[#1a305b]"
                      : "bg-[#e9e4d9] border-gray-200 text-[#1a305b] hover:bg-[#f0b35a]/40"
                    }
                  `}
                >
                  {filter}
                </button>
              )
            })}
          </div>
        </>
      )}

      {isRoutingMode ? (
        open && (query || activeFilter) && (
          <div className="absolute mt-2 w-full bg-white border border-[#547792]/20 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-[9999]">
            {[...(showMyLocation && myLocation ? [myLocation] : []), ...results].map((loc, index) => (
              <div
                key={index}
                className="px-5 py-3 text-base text-[#1a305b] cursor-pointer hover:bg-[#e9e4d9] transition-colors border-b border-gray-100 last:border-0 flex items-center justify-between gap-2"
                onClick={() => handleSelect(loc)}
              >
                <span className="truncate">{loc.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {loc.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#FAB95B]/15 text-[#1a305b] border border-[#FAB95B]/30">{loc.category}</span>
                  )}
                  {loc.floor != null && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#547792]/10 text-[#547792] border border-[#547792]/20">F{loc.floor}</span>
                  )}
                </div>
              </div>
            ))}
            {results.length === 0 && !(showMyLocation && myLocation) && (
              <div className="px-5 py-3 text-base text-[#547792]/70 italic">No locations found</div>
            )}
          </div>
        )
      ) : (
        open && (query || activeFilter) && results.length > 0 && (  // ← fix: gate on open + results
          <div className="relative z-10">
            <SearchResults results={results} onSelect={handleSelect} />
          </div>
        )
      )}
    </div>
  )
}