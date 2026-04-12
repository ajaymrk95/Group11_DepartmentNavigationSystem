import { useEffect, useRef, useState } from "react"
import {
  findClosestSegmentIndex,
  trimRouteFromPosition,
  checkDeviation,
  getRemainingDistance,
} from "../utils/routeTracker"
import { getDistanceInMeters } from "../utils/navigationUtils"

// ─── Config ──────────────────────────────────────────────────────────────────

/** Distance in metres from destination that counts as "arrived". */
const ARRIVAL_RADIUS_METERS = 15

/** Distance in metres off-route before rerouting is considered. */
const DEVIATION_THRESHOLD_METERS = 25

/**
 * How many *consecutive* off-route GPS updates are required before
 * actually triggering a reroute — filters out single noisy fixes.
 */
const DEVIATION_REQUIRED_COUNT = 3

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UseRouteTrackerOptions {
  /** The original, full route as [lat, lng] pairs. */
  fullRoute: [number, number][]
  /** Live GPS coordinate [lat, lng] from useCurrentLocation. */
  currentLocation: [number, number] | null
  /** Whether the user has started navigation (hook is idle when false). */
  isNavigating: boolean
  /** Destination — used for arrival detection. */
  destination: { latitude: number | null; longitude: number | null } | null
  /**
   * Called when deviation is confirmed. Receives the current GPS position
   * so the caller can issue a new fetchRoute() call from that point.
   */
  onReroute: (currentPos: [number, number]) => void
  /** Called once when the user reaches the destination. */
  onArrive: () => void
  /** Override deviation threshold in metres (default: 25). */
  deviationThresholdMeters?: number
  /** Override arrival radius in metres (default: 15). */
  arrivalRadiusMeters?: number
}

export interface UseRouteTrackerResult {
  /**
   * The *trimmed* route to pass to <MapView routeCoords={...}>.
   * Only the remaining path from the user's projected position.
   * Falls back to fullRoute when not navigating.
   */
  displayedRoute: [number, number][]
  /** True while waiting for a reroute API response. */
  isRerouting: boolean
  /** Remaining walking distance in metres along the trimmed route. */
  remainingDistanceMeters: number | null
  /** Perpendicular distance in metres from user to the nearest route segment. */
  distanceFromRouteMeters: number | null
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRouteTracker({
  fullRoute,
  currentLocation,
  isNavigating,
  destination,
  onReroute,
  onArrive,
  deviationThresholdMeters = DEVIATION_THRESHOLD_METERS,
  arrivalRadiusMeters = ARRIVAL_RADIUS_METERS,
}: UseRouteTrackerOptions): UseRouteTrackerResult {

  const [displayedRoute, setDisplayedRoute] = useState<[number, number][]>([])
  const [isRerouting, setIsRerouting] = useState(false)
  const [remainingDistanceMeters, setRemainingDistanceMeters] = useState<number | null>(null)
  const [distanceFromRouteMeters, setDistanceFromRouteMeters] = useState<number | null>(null)

  /**
   * The highest segment index the user has reached.
   * Monotonically increases — enforces forward-only progression.
   */
  const minSegIndexRef = useRef<number>(0)
  /** Consecutive off-route GPS fix count for hysteresis. */
  const deviationCountRef = useRef<number>(0)
  /** Guards against double-firing onReroute / onArrive. */
  const reroutingRef = useRef<boolean>(false)
  const arrivedRef = useRef<boolean>(false)

  // Reset all state when a new route arrives (fresh start or after reroute)
  useEffect(() => {
    minSegIndexRef.current = 0
    deviationCountRef.current = 0
    reroutingRef.current = false
    arrivedRef.current = false
    setIsRerouting(false)
    setDisplayedRoute(fullRoute)
    setRemainingDistanceMeters(null)
  }, [fullRoute])

  // Reset when navigation stops
  useEffect(() => {
    if (!isNavigating) {
      minSegIndexRef.current = 0
      deviationCountRef.current = 0
      reroutingRef.current = false
      arrivedRef.current = false
      setDisplayedRoute(fullRoute)
      setRemainingDistanceMeters(null)
      setDistanceFromRouteMeters(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating])

  // Core tracking — runs on every GPS update
  useEffect(() => {
    if (!isNavigating || !currentLocation || fullRoute.length < 2) return
    if (reroutingRef.current || arrivedRef.current) return

    const [curLat, curLng] = currentLocation

    // 1. Arrival check
    if (destination?.latitude != null && destination?.longitude != null) {
      const distToDest = getDistanceInMeters(
        curLat, curLng,
        destination.latitude, destination.longitude
      )
      if (distToDest <= arrivalRadiusMeters) {
        arrivedRef.current = true
        setDisplayedRoute([])
        setRemainingDistanceMeters(0)
        onArrive()
        return
      }
    }

    // 2. Find closest segment (forward-only)
    const { segmentIndex, projectedPoint, distanceMeters } = findClosestSegmentIndex(
      fullRoute,
      currentLocation,
      minSegIndexRef.current
    )

    // Advance the floor — never allow going back
    if (segmentIndex > minSegIndexRef.current) {
      minSegIndexRef.current = segmentIndex
    }

    setDistanceFromRouteMeters(distanceMeters)

    // 3. Deviation detection with hysteresis
    if (checkDeviation(distanceMeters, deviationThresholdMeters)) {
      deviationCountRef.current += 1
      if (deviationCountRef.current >= DEVIATION_REQUIRED_COUNT) {
        reroutingRef.current = true
        setIsRerouting(true)
        deviationCountRef.current = 0
        onReroute(currentLocation)
        return
      }
    } else {
      deviationCountRef.current = 0
    }

    // 4. Trim route to remaining path
    const trimmed = trimRouteFromPosition(fullRoute, segmentIndex, projectedPoint)
    setDisplayedRoute(trimmed)

    // 5. Update remaining distance
    setRemainingDistanceMeters(getRemainingDistance(trimmed))

  }, [
    currentLocation,
    isNavigating,
    fullRoute,
    destination,
    onReroute,
    onArrive,
    deviationThresholdMeters,
    arrivalRadiusMeters,
  ])

  return {
    displayedRoute: isNavigating && displayedRoute.length > 0 ? displayedRoute : fullRoute,
    isRerouting,
    remainingDistanceMeters,
    distanceFromRouteMeters,
  }
}
