import { useNavigate, useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
import type { Location } from "../types/types"
import MapView from "../components/navcomponents/MapView"
import { useCurrentLocation } from "../hooks/useCurrentLocation"
import { getDistanceAlongRoute, getNextTurn } from "./navigation/outdoornav/utils/navigationUtils"
import type { TurnInfo } from "./navigation/outdoornav/types/navigationTypes"
import RouteInputs from "./navigation/outdoornav/components/RouteInputs"
import NavigationOverlay from "./navigation/outdoornav/components/NavigationOverlay"
import TopControls from "./navigation/outdoornav/components/TopControls"
import DestinationInfo from "./navigation/outdoornav/components/DestinationInfo"
import { useLocation } from "react-router-dom";

const DEFAULT_CENTER: [number, number] = [11.3210, 75.9346]

export default function OutdoorNav() {

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [start, setStart] = useState<Location | null>(null)
  const [end, setEnd] = useState<Location | null>(null)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [distanceText, setDistanceText] = useState("")
  const [tileType, setTileTypeRaw] = useState<"light" | "standard" | "satelite">(
    () => {
      const stored = localStorage.getItem('preferredTileType') as "light" | "standard" | "satelite" | null
      if (stored === 'light' || stored === 'standard' || stored === 'satelite') return stored
      const t = searchParams.get('tileType') as "light" | "standard" | "satelite" | null
      return (t === 'light' || t === 'standard' || t === 'satelite') ? t : 'light'
    }
  )
  const setTileType = (t: "light" | "standard" | "satelite") => {
    localStorage.setItem('preferredTileType', t)
    setTileTypeRaw(t)
  }
  const [clickedDestination, setClickedDestination] = useState<Location | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const [activeDistanceMeters, setActiveDistanceMeters] = useState<number | null>(null)
  const [turnInfo, setTurnInfo] = useState<TurnInfo>({ direction: 'straight', turnIndex: 0 })
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [routeError, setRouteError] = useState("")
  const [routeDistanceMeters, setRouteDistanceMeters] = useState<number | null>(null)
  const { location: currentLocation } = useCurrentLocation()
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [autoStart, setAutoStart] = useState(false) // true when coming from indoor nav continue flow

  const routerLocation = useLocation();

  useEffect(() => {
      const state = routerLocation.state as { end?: any } | null;  
      if (state?.end) {
          setEnd(state.end);  
          if (state.end.latitude && state.end.longitude) {
              setCenter([state.end.latitude, state.end.longitude]);
          }
      }
  }, [routerLocation.state]);

  useEffect(() => {
    if (clickedDestination) setEnd(clickedDestination)
  }, [clickedDestination])

  // ── Pre-fill start+end from continueStart/End* params (coming from indoor nav "Go Outdoor") ──
  useEffect(() => {
    const startLat = searchParams.get('continueStartLat')
    const startLng = searchParams.get('continueStartLng')
    const endLat = searchParams.get('continueEndLat')
    const endLng = searchParams.get('continueEndLng')
    if (!endLat || !endLng) return

    // Pre-fill end
    const name = searchParams.get('continueEndName') ?? 'Destination'
    const type = searchParams.get('continueEndType') as 'ROOM' | 'BUILDING' | null
    const buildingName = searchParams.get('continueEndBuilding')
    const floor = searchParams.get('continueEndFloor')
    const entranceLat = searchParams.get('continueEndEntranceLat')
    const entranceLng = searchParams.get('continueEndEntranceLng')
    const endLoc: Location = {
      id: -1,
      name,
      category: null,
      room: null,
      latitude: Number(endLat),
      longitude: Number(endLng),
      tag: [],
      floor: floor ? Number(floor) : null,
      description: null,
      locationType: type ?? undefined,
      buildingName: buildingName ?? null,
      buildingEntranceLat: entranceLat ? Number(entranceLat) : null,
      buildingEntranceLng: entranceLng ? Number(entranceLng) : null,
    }
    setEnd(endLoc)

    // Pre-fill start (building entrance from the indoor leg)
    if (startLat && startLng) {
      const startLoc: Location = {
        id: -2,
        name: 'Building Entrance',
        category: null,
        room: null,
        latitude: Number(startLat),
        longitude: Number(startLng),
        tag: [],
        floor: 1,
        description: null,
      }
      setStart(startLoc)
      setAutoStart(true) // mark for auto-starting navigation once route loads
      fetchRoute(startLoc, endLoc)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auto-start navigation when route loads in continue flow ──
  useEffect(() => {
    if (autoStart && routeCoords.length > 0) {
      setIsNavigating(true)
      setIsPanelOpen(false)
      setAutoStart(false) // consume the flag
    }
  }, [autoStart, routeCoords])

  useEffect(() => {
    if (isNavigating && currentLocation) {
      setCenter(currentLocation)
      if (routeCoords.length > 0) {
        const info = getNextTurn(routeCoords, currentLocation)
        setTurnInfo(info)

        let closest = 0, minD = Infinity
        for (let i = 0; i < routeCoords.length; i++) {
          const d = Math.hypot(currentLocation[0] - routeCoords[i][0], currentLocation[1] - routeCoords[i][1])
          if (d < minD) { minD = d; closest = i }
        }

        const distToTurn = getDistanceAlongRoute(routeCoords, closest, info.turnIndex)
        setActiveDistanceMeters(distToTurn)
      }
    }
  }, [currentLocation, isNavigating, end, routeCoords])

  const handleSwap = () => { const t = start; setStart(end); setEnd(t) }

  async function fetchRoute(s: Location, e: Location) {
    setIsLoadingRoute(true)
    setRouteError("")
    setDistanceText("Calculating…")

    // When start is a ROOM (with entrance still available), use entrance —
    // but in the continue flow start.locationType is undefined (plain entrance), so just use coords directly
    const startLat = s.locationType === "ROOM" && s.buildingEntranceLat != null
      ? s.buildingEntranceLat
      : s.latitude
    const startLng = s.locationType === "ROOM" && s.buildingEntranceLng != null
      ? s.buildingEntranceLng
      : s.longitude
    const endLat = e.latitude
    const endLng = e.longitude

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/routes/navigate?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}`)
      if (!res.ok) throw new Error("Route not found.")
      const route = await res.json()
      setRouteCoords(route.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]))
      const d = route.properties.distanceMeters
      setRouteDistanceMeters(d)
      setDistanceText(
        d < 1000 ? Math.round(d) + " m" : (d / 1000).toFixed(2) + " km"
      )
    } catch (err: any) {
      setRouteError(err.message ?? "Error calculating route")
      setRouteCoords([])
      setDistanceText("")
    } finally {
      setIsLoadingRoute(false)
    }
  }

  async function handleRoute() {
    if (!start || !end) return

    // ── Case: both are rooms in the SAME building → go directly to indoor nav ──
    if (
      start.locationType === "ROOM" &&
      end.locationType === "ROOM" &&
      start.buildingName &&
      start.buildingName === end.buildingName
    ) {
      const buildingSlug = start.buildingName.toLowerCase()
      const params = new URLSearchParams()
      if (start.latitude != null && start.longitude != null) {
        params.set('startLat', String(start.latitude))
        params.set('startLng', String(start.longitude))
        params.set('startFloor', String(start.floor || 1))
      }
      if (end.latitude != null && end.longitude != null) {
        params.set('endLat', String(end.latitude))
        params.set('endLng', String(end.longitude))
        params.set('endFloor', String(end.floor || 1))
      }
      params.set('tileType', tileType)
      navigate(`/indoor-navigation/${buildingSlug}?${params.toString()}`)
      return
    }

    // ── Case: start is a ROOM going to a different building/location ──
    if (start.locationType === "ROOM" && start.buildingName && start.buildingEntranceLat != null && start.buildingEntranceLng != null) {
      const buildingSlug = start.buildingName.toLowerCase()
      const params = new URLSearchParams()
      if (start.latitude != null && start.longitude != null) {
        params.set('startLat', String(start.latitude))
        params.set('startLng', String(start.longitude))
        params.set('startFloor', String(start.floor || 1))
      }
      params.set('endLat', String(start.buildingEntranceLat))
      params.set('endLng', String(start.buildingEntranceLng))
      params.set('endFloor', '1')
      if (end.latitude != null && end.longitude != null) {
        params.set('nextOutdoorEndLat', String(end.latitude))
        params.set('nextOutdoorEndLng', String(end.longitude))
        params.set('nextOutdoorEndName', end.name)
        if (end.locationType === 'ROOM' && end.buildingName) {
          params.set('nextOutdoorEndType', 'ROOM')
          params.set('nextOutdoorEndBuilding', end.buildingName)
          if (end.buildingEntranceLat != null) params.set('nextOutdoorEndEntranceLat', String(end.buildingEntranceLat))
          if (end.buildingEntranceLng != null) params.set('nextOutdoorEndEntranceLng', String(end.buildingEntranceLng))
          params.set('nextOutdoorEndFloor', String(end.floor || 1))
        }
      }
      params.set('tileType', tileType)
      navigate(`/indoor-navigation/${buildingSlug}?${params.toString()}`)
      return
    }

    await fetchRoute(start, end)
  }

  const hasRoute = routeCoords.length > 0

  return (
    <div className="h-screen w-screen flex overflow-hidden font-[Outfit] relative bg-[#E8E2DB]">

      <TopControls
        tileType={tileType}
        setTileType={setTileType}
        isPanelOpen={isPanelOpen}
        setIsPanelOpen={setIsPanelOpen}
      />

      {/* SIDEBAR: 30% width on Desktop, Full screen slide-over on Mobile */}
      <div className={`
        absolute md:relative top-0 left-0 h-full z-[3000] md:z-10
        w-full md:w-[380px] md:min-w-[380px] shrink-0
        transition-transform duration-300 ease-in-out
        ${isPanelOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-full flex flex-col bg-[#0B2D72] shadow-[12px_0_40px_rgba(0,0,0,0.4)] overflow-y-auto">

          {/* Panel Header */}
          <div className="px-8 pt-10 pb-8 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div>
                  <h2 className="text-[#FAB95B] text-[28px] font-extrabold tracking-tight leading-none">Navigation</h2>
                  <p className="text-[rgba(246,231,188,0.55)] text-[12px] mt-1.5 tracking-[0.2em] font-semibold uppercase">Outdoor routing</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate("/")} title="Home"
                  className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(246,231,188,0.5)] flex items-center justify-center border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(250,185,91,0.2)] hover:text-[#FAB95B]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>
                </button>
                <button onClick={() => setIsPanelOpen(false)}
                  className="md:hidden w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(246,231,188,0.5)] flex items-center justify-center border-none cursor-pointer transition-colors duration-150 hover:bg-[rgba(255,255,255,0.12)] hover:text-[#F6E7BC]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
              <RouteInputs
                start={start}
                end={end}
                setStart={setStart}
                setEnd={setEnd}
                handleSwap={handleSwap}
              />
            </div>

            {/* Error */}
            {routeError && (
              <div className="flex items-center gap-2 bg-[rgba(220,53,69,0.15)] border border-[rgba(220,53,69,0.3)] rounded-xl px-3.5 py-2.5 text-[13px] text-[#ff6b7a]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {routeError}
              </div>
            )}

            {/* Clear All */}
            {(start || end) && (
              <button onClick={() => {
                setStart(null)
                setEnd(null)
                setRouteCoords([])
                setDistanceText("")
                setRouteDistanceMeters(null)
                setRouteError("")
                setIsNavigating(false)
                setClickedDestination(null)
              }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-transparent text-[#ff6b7a] text-[12px] font-semibold cursor-pointer transition-all duration-200 hover:text-[#ff4d5e]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                Clear All
              </button>
            )}
          </div>

          <DestinationInfo
            start={start}
            end={end}
            distanceText={distanceText}
            distanceMeters={routeDistanceMeters}
            isLoadingRoute={isLoadingRoute}
          />

          {/* Tips Card — only show when no destination is selected */}
          {!end && (
            <div className="mx-6 mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[rgba(246,231,188,0.4)]">How it works</p>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAB95B]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAB95B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#F6E7BC] leading-tight">Set your start & end</p>
                  <p className="text-[11px] text-[rgba(246,231,188,0.5)] mt-1 leading-relaxed">Search for locations or tap the map to pick your destination.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAB95B]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAB95B" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#F6E7BC] leading-tight">Get directions</p>
                  <p className="text-[11px] text-[rgba(246,231,188,0.5)] mt-1 leading-relaxed">Hit "Find Route" and we'll calculate the fastest walking path for you.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FAB95B]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAB95B" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18M3 15h18"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#F6E7BC] leading-tight">Go indoors</p>
                  <p className="text-[11px] text-[rgba(246,231,188,0.5)] mt-1 leading-relaxed">If your destination is inside a building, seamlessly switch to indoor navigation.</p>
                </div>
              </div>
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
                  <><span>Find Route</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg></>
                )}
              </button>
            ) : (
              <button onClick={() => { setIsNavigating(true); setIsPanelOpen(false) }}
                className="w-full flex items-center justify-between px-6 py-4 rounded-full bg-[#FAB95B] text-[#1A3263] text-sm font-bold tracking-wide border-none cursor-pointer transition-all duration-200 hover:bg-[#f9aa3d] hover:-translate-y-0.5 shadow-[0_0_24px_rgba(250,185,91,0.45)]">
                <span>Start Navigation</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-pulse"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Map area ── */}
      <div className="flex-1 relative h-full">
        {/* ── Compact navigation bar ── */}
        {isNavigating && (
          <NavigationOverlay
            turnInfo={turnInfo}
            distance={activeDistanceMeters}
            totalDistanceText={distanceText}
            start={start}
            end={end}
            tileType={tileType}
            onEnd={() => {
              setIsNavigating(false)
              setRouteCoords([])
              setStart(null)
              setEnd(null)
              setDistanceText("")
            }}
          />
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
      </div>
    </div>
  )
}