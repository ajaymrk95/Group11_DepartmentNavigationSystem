import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import type { Location } from "../../types/types"
import SearchResults from "./SearchResults"
import { useCurrentLocation } from "../../hooks/useCurrentLocation"

type Props = {
  // --- existing props (used by search location RoutePanel) ---
  onSelect: (location: Location | null) => void
  onFocusSearch?: () => void

  // --- new optional props (used by outdoor navigation RoutePanel) ---
  label?: string                        // placeholder text, defaults to "Search location..."
  iconType?: "start" | "end"            // shows start/end icon instead of search icon
  selectedLoc?: Location | null         // controlled selected value
  showQr?: boolean                      // show QR scanner button, defaults to false
  useQrResult?: boolean                 // listen for QR scan result from router state, defaults to false
  showFilters?: boolean                 // show filter chips, defaults to true
  showMyLocation?: boolean              // show "My Location" option in dropdown, defaults to false
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

  const navigate = useNavigate()
  const location = useLocation()

  const { location: currentCoords } = useCurrentLocation()
  const myLocation: Location | null = showMyLocation && currentCoords
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
          `http://localhost:8080/locations/search?q=${encodeURIComponent(qrValue)}`
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
          locationType: loc.locationType ?? undefined,  // ← added
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

  // ── Change 1: map locationType from API response ──────────────────────────
  async function fetchResults(value: string) {
    try {
      const res = await fetch(`http://localhost:8080/locations/search?q=${encodeURIComponent(value)}`)
      const data = await res.json()
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
        locationType: loc.locationType ?? undefined,  // ← added
      }))
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
    await fetchResults(filter)
  }

  // ── Change 2: fire visit increment on select ──────────────────────────────
  function handleSelect(loc: Location) {
    setQuery(loc.name)
    setResults([])
    setActiveFilter(null)
    setOpen(false)
    onSelect(loc)

    if (loc.id !== -1 && loc.locationType) {
      fetch(`http://localhost:8080/locations/visit?id=${loc.id}&locationType=${loc.locationType}`, {
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
          onFocus={onFocusSearch}
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
            onClick={() => navigate("/qr-scanner")}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h6v2H5v4H3V3zm16 0h-6v2h4v4h2V3zM3 21h6v-2H5v-4H3v6zm18-6h-2v4h-4v2h6v-6zM7 7h4v4H7V7zm6 0h4v4h-4V7zm-6 6h4v4H7v-4zm6 0h4v4h-4v-4z" />
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
        open && query && (
          <div className="absolute mt-2 w-full bg-white border border-[#547792]/20 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-[9999]">
            {[...(myLocation ? [myLocation] : []), ...results].map((loc, index) => (
              <div
                key={index}
                className="px-5 py-3 text-base text-[#1a305b] cursor-pointer hover:bg-[#e9e4d9] transition-colors border-b border-gray-100 last:border-0"
                onClick={() => handleSelect(loc)}
              >
                {loc.name}
              </div>
            ))}
            {results.length === 0 && !myLocation && (
              <div className="px-5 py-3 text-base text-[#547792]/70 italic">No locations found</div>
            )}
          </div>
        )
      ) : (
        <div className="relative z-10">
          <SearchResults results={results} onSelect={handleSelect} />
        </div>
      )}
    </div>
  )
}