import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import type { Location } from "../types/types"
import MapView from "../components/navcomponents/MapView"
import LocateButton from "../components/navcomponents/LocateButton"
import SearchBar from "../components/searchcomponents/SearchBar"
import { useCurrentLocation } from "../hooks/useCurrentLocation"
import TileSwitcher from "../components/searchcomponents/TileSwitcher"
import locationImage from "../assets/image.png"

const DEFAULT_CENTER: [number, number] = [11.3210, 75.9346]

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3
  const phi1 = lat1 * Math.PI / 180, phi2 = lat2 * Math.PI / 180
  const dPhi = (lat2 - lat1) * Math.PI / 180, dLambda = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dPhi/2)**2 + Math.cos(phi1)*Math.cos(phi2)*Math.sin(dLambda/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function OutdoorNav() {
  const navigate = useNavigate()
  const [start, setStart] = useState<Location | null>(null)
  const [end, setEnd] = useState<Location | null>(null)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [distanceText, setDistanceText] = useState("")

  // ✅ NEW: tile state
  const [tileType, setTileType] = useState<"light" | "standard" | "satelite">("light")

  
  // State to hold the destination clicked directly from the map pins
  const [clickedDestination, setClickedDestination] = useState<Location | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const [activeDistanceMeters, setActiveDistanceMeters] = useState<number | null>(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [routeError, setRouteError] = useState("")
  const { location: currentLocation } = useCurrentLocation()
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)

  useEffect(() => {
    if (clickedDestination) setEnd(clickedDestination)
  }, [clickedDestination])

  useEffect(() => {
    if (isNavigating && currentLocation) {
      setCenter(currentLocation)
      if (end?.latitude && end?.longitude) {
        setActiveDistanceMeters(getDistanceInMeters(currentLocation[0], currentLocation[1], end.latitude, end.longitude))
      }
    }
  }, [currentLocation, isNavigating, end])

  const handleSwap = () => { const t = start; setStart(end); setEnd(t) }

  async function handleRoute() {
    if (!start || !end) return
    setIsLoadingRoute(true)
    setRouteError("")
    setDistanceText("Calculating…")
    try {
      const res = await fetch(`http://localhost:8080/api/routes/navigate?startLat=${start.latitude}&startLng=${start.longitude}&endLat=${end.latitude}&endLng=${end.longitude}`)
      if (!res.ok) throw new Error("Route not found.")
      const route = await res.json()
      setRouteCoords(route.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]))
      const d = route.properties.distanceMeters
      setDistanceText(d < 1000 ? Math.round(d) + " m" : (d/1000).toFixed(2) + " km")
    } catch (err: any) {
      setRouteError(err.message ?? "Error calculating route")
      setRouteCoords([])
      setDistanceText("")
    } finally {
      setIsLoadingRoute(false)
    }
  }

  const hasRoute = routeCoords.length > 0

  return (
    <div className="h-screen w-screen flex overflow-hidden font-[Outfit] relative bg-[#E8E2DB]">

        {/* ✅ TILE SWITCHER (TOP RIGHT) */}
      <div className="absolute top-4 right-4 z-[3000]">
        <TileSwitcher tileType={tileType} setTileType={setTileType} />
      </div>

      {/* SIDEBAR: 30% width on Desktop, Full screen slide-over on Mobile */}
      <div className={`
        absolute md:relative top-0 left-0 h-full z-[3000] md:z-10
        w-full md:w-[380px] md:min-w-[380px] shrink-0
        transition-transform duration-300 ease-in-out
        ${isPanelOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-full flex flex-col bg-[#0B2D72] shadow-[12px_0_40px_rgba(0,0,0,0.4)] overflow-y-auto">

          {/* Panel Header */}
          <div className="px-6 pt-6 pb-4 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[rgba(250,185,91,0.15)] border border-[rgba(250,185,91,0.25)] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAB95B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[#F6E7BC] text-base font-extrabold tracking-tight leading-none">Navigation</h2>
                  <p className="text-[rgba(246,231,188,0.45)] text-[10px] mt-0.5 tracking-widest uppercase">Outdoor routing</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => navigate("/")} title="Home"
                  className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(246,231,188,0.5)] flex items-center justify-center border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(250,185,91,0.2)] hover:text-[#FAB95B]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>
                </button>
                <button onClick={() => navigate("/search-location")} title="Search"
                  className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(246,231,188,0.5)] flex items-center justify-center border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(250,185,91,0.2)] hover:text-[#FAB95B]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
                </button>
                <button onClick={() => setIsPanelOpen(false)}
                  className="md:hidden w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(246,231,188,0.5)] flex items-center justify-center border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(255,255,255,0.12)] hover:text-[#F6E7BC]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 h-px bg-[rgba(255,255,255,0.07)] shrink-0" />

          {/* Route inputs */}
          <div className="px-6 pt-5 flex flex-col gap-3 shrink-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[rgba(246,231,188,0.4)]">Plan your route</p>

            <div className="relative">
              {/* Start */}
              <div className="relative z-20">
                <SearchBar label="Starting point…" onSelect={setStart} iconType="start"
                  selectedLoc={start} showQr useQrResult showFilters={false} showMyLocation />
              </div>

              {/* Connector line */}
              <div className="absolute left-[18px] top-[52px] bottom-[52px] w-px bg-[rgba(246,231,188,0.15)] z-10" />

              {/* Swap */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30">
                <button onClick={handleSwap} title="Swap"
                  className="w-9 h-9 rounded-full bg-[#FAB95B] text-[#1A3263] flex items-center justify-center border-none cursor-pointer shadow-[0_4px_12px_rgba(250,185,91,0.4)] transition-all duration-200 hover:bg-[#f9aa3d] hover:scale-110">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
                </button>
              </div>

              {/* End */}
              <div className="relative z-10 pt-2">
                <SearchBar label="Destination…" onSelect={setEnd} iconType="end"
                  selectedLoc={end} showQr={false} useQrResult={false} showFilters={false} showMyLocation={false} />
              </div>
            </div>

            {/* Error */}
            {routeError && (
              <div className="flex items-center gap-2 bg-[rgba(220,53,69,0.15)] border border-[rgba(220,53,69,0.3)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#ff6b7a]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {routeError}
              </div>
            )}
          </div>

          {/* Destination card */}
          {end && (
            <div className="mx-6 mt-5 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] shrink-0">
              <div className="h-36 overflow-hidden relative">
                <img src={locationImage} alt="Location" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2D72] to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-end justify-between">
                    <h3 className="text-[#F6E7BC] font-bold text-base leading-tight truncate">{end.name}</h3>
                    {end.category && (
                      <span className="shrink-0 ml-2 px-2.5 py-0.5 rounded-full bg-[#FAB95B] text-[#1A3263] text-[10px] font-bold uppercase tracking-wide">
                        {end.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 flex flex-col gap-2">
                {end.category === "INDOOR" && (end.room || end.floor !== undefined) && (
                  <div className="flex gap-3 text-[11px] text-[rgba(246,231,188,0.5)] font-mono">
                    {end.room && <span>Room {end.room}</span>}
                    {end.floor !== undefined && <span>Floor {end.floor}</span>}
                  </div>
                )}
                {end.description && (
                  <p className="text-[12px] text-[rgba(246,231,188,0.6)] leading-relaxed">{end.description}</p>
                )}
                {end.tag && end.tag.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {end.tag.map(tag => (
                      <span key={tag} className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[rgba(246,231,188,0.1)] text-[rgba(246,231,188,0.6)] border border-[rgba(246,231,188,0.12)]">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distance badge */}
          {distanceText && !isLoadingRoute && (
            <div className="mx-6 mt-3 flex items-center gap-2.5 bg-[rgba(250,185,91,0.1)] border border-[rgba(250,185,91,0.2)] rounded-xl px-4 py-3 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAB95B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className="text-[#FAB95B] text-sm font-bold">{distanceText}</span>
              <span className="text-[rgba(246,231,188,0.4)] text-xs ml-auto">estimated distance</span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="p-6 flex flex-col gap-3 shrink-0">
            {!hasRoute ? (
              <button onClick={handleRoute} disabled={!start || !end || isLoadingRoute}
                className="w-full flex items-center justify-between px-6 py-4 rounded-full bg-[#F6E7BC] text-[#1A3263] text-sm font-bold tracking-wide border-none cursor-pointer transition-all duration-200 hover:bg-[#FAB95B] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                {isLoadingRoute ? (
                  <><span className="inline-block w-4 h-4 border-2 border-[#1A3263]/30 border-t-[#1A3263] rounded-full animate-spin" /><span>Calculating…</span></>
                ) : (
                  <><span>Find Route</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg></>
                )}
              </button>
            ) : (
              <button onClick={() => { setIsNavigating(true); setIsPanelOpen(false) }}
                className="w-full flex items-center justify-between px-6 py-4 rounded-full bg-[#FAB95B] text-[#1A3263] text-sm font-bold tracking-wide border-none cursor-pointer transition-all duration-200 hover:bg-[#f9aa3d] hover:-translate-y-0.5 shadow-[0_0_24px_rgba(250,185,91,0.45)]">
                <span>Start Navigation</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-pulse"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              </button>
            )}

            {end?.buildingName && (
              <button onClick={() => navigate(`/indoor-navigation/${end.buildingName!.toLowerCase()}?floor=${end.floor || 1}`)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-transparent text-[#FAB95B] border border-[rgba(250,185,91,0.4)] text-sm font-bold border-solid cursor-pointer transition-all duration-200 hover:bg-[rgba(250,185,91,0.1)] hover:border-[#FAB95B]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18M3 15h18"/></svg>
                Indoor Navigation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Map area ── */}
      <div className="flex-1 relative h-full">

        {/* Mobile: open panel button */}
        {!isPanelOpen && (
          <button onClick={() => setIsPanelOpen(true)}
            className="md:hidden absolute top-5 left-5 z-[2000] bg-[#0B2D72] text-[#F6E7BC] px-5 py-3 rounded-full shadow-xl font-semibold border border-[rgba(255,255,255,0.1)] flex items-center gap-2 hover:bg-[#1A3263] transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
            Search Route
          </button>
        )}

        {/* ── Status pill (idle / has route) ── */}
        {!isNavigating && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[2000] pointer-events-none">
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-xl backdrop-blur-sm text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              hasRoute
                ? "bg-[#FAB95B] text-[#1A3263] shadow-[0_4px_20px_rgba(250,185,91,0.4)]"
                : "bg-[rgba(11,45,114,0.85)] text-[#F6E7BC] border border-[rgba(255,255,255,0.1)]"
            }`}>
              {hasRoute ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>{distanceText} — Route found</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>{distanceText || "Select two locations"}</>
              )}
            </div>
          </div>
        )}

        {/* ── Active navigation overlay ── */}
        {isNavigating && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-[420px]">
            <div className="bg-[#0B2D72] border border-[rgba(255,255,255,0.1)] rounded-3xl shadow-2xl overflow-hidden">
              {/* Amber accent bar */}
              <div className="h-1 w-full bg-[#FAB95B]" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-[#FAB95B] tracking-widest uppercase">Navigating To</span>
                  <button onClick={() => { setIsNavigating(false); setRouteCoords([]); setStart(null); setEnd(null); setDistanceText("") }}
                    className="text-[rgba(246,231,188,0.5)] hover:text-[#ff6b7a] hover:bg-[rgba(255,107,122,0.1)] transition-colors text-xs bg-[rgba(255,255,255,0.06)] px-3 py-1 rounded-full border-none cursor-pointer font-semibold tracking-wider">
                    End
                  </button>
                </div>
                <div className="text-[#F6E7BC] text-xl font-bold leading-snug mb-4 truncate">{end?.name}</div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAB95B] flex items-center justify-center shadow-[0_0_20px_rgba(250,185,91,0.5)] shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A3263" strokeWidth="2.5" className="animate-pulse"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                  </div>
                  <div>
                    <div className="text-[#F6E7BC] text-3xl font-black tracking-tight leading-none">
                      {activeDistanceMeters !== null
                        ? (activeDistanceMeters < 1000 ? Math.round(activeDistanceMeters) + " m" : (activeDistanceMeters/1000).toFixed(2) + " km")
                        : "Tracking…"}
                    </div>
                    <div className="text-[rgba(246,231,188,0.45)] text-xs font-semibold uppercase tracking-widest mt-1">Straight-line distance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <MapView
          center={center}
          start={start}
          destination={end}
          routeCoords={routeCoords}
          currentLocation={currentLocation}
          onSetMapDestination={(loc) => {
            setClickedDestination(loc)
            setIsPanelOpen(true) 
          }}
         tileType={tileType}
        />

        <LocateButton onClick={() => { if (currentLocation) setCenter(currentLocation) }} />
      </div>
    </div>
  )
}