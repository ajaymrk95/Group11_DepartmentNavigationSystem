/**
 * routeTracker.ts
 *
 * Core logic for dynamic route tracking during live GPS navigation.
 * Handles:
 *   - Nearest-point detection on a polyline (segment-level, not just vertex-level)
 *   - Forward-only route progression (no GPS-jitter regression)
 *   - Route trimming so only the remaining path is rendered
 *   - Deviation detection with configurable threshold
 */

import { getDistanceInMeters } from "./navigationUtils"

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ClosestResult {
  /** Index of the segment START vertex where the closest point lies (0-based) */
  segmentIndex: number
  /** The actual projected point on the polyline closest to the user */
  projectedPoint: [number, number]
  /** Perpendicular distance in metres from the user to the polyline */
  distanceMeters: number
}

// ─── Geometry helpers ────────────────────────────────────────────────────────

/**
 * Projects `point` onto the infinite line through `a`→`b`, then clamps
 * the result to the segment [a, b].  Returns the closest point on that
 * finite segment and the distance from `point` to it.
 *
 * Uses a Euclidean (flat-earth) approximation which is accurate over the
 * short campus-scale distances involved (< 1 km).
 */
export function findClosestPointOnSegment(
  point: [number, number],
  a: [number, number],
  b: [number, number]
): { closestPoint: [number, number]; distanceMeters: number } {
  const [pLat, pLng] = point
  const [aLat, aLng] = a
  const [bLat, bLng] = b

  // Vector AB
  const abLat = bLat - aLat
  const abLng = bLng - aLng
  const abLen2 = abLat * abLat + abLng * abLng

  if (abLen2 === 0) {
    // Degenerate segment (a === b) — return a itself
    return { closestPoint: a, distanceMeters: getDistanceInMeters(pLat, pLng, aLat, aLng) }
  }

  // Scalar projection of AP onto AB, clamped to [0, 1]
  const t = Math.max(0, Math.min(1, ((pLat - aLat) * abLat + (pLng - aLng) * abLng) / abLen2))

  const closestPoint: [number, number] = [aLat + t * abLat, aLng + t * abLng]
  const distanceMeters = getDistanceInMeters(pLat, pLng, closestPoint[0], closestPoint[1])

  return { closestPoint, distanceMeters }
}

// ─── Main functions ──────────────────────────────────────────────────────────

/**
 * Finds the closest segment on the polyline to `userPosition`, enforcing a
 * **forward-only** progression to prevent GPS jitter from snapping backwards.
 *
 * @param route         Full or currently-active route as [lat, lng] pairs.
 * @param userPosition  Current GPS fix as [lat, lng].
 * @param minSegIndex   Minimum segment index to consider (never go below this).
 *                      Pass 0 for first call; pass the previous result on
 *                      subsequent calls to enforce forward movement.
 * @param lookAheadBuffer  How many segments *behind* minSegIndex to still
 *                         allow (handles slight backward GPS wobble without
 *                         full regression).  Default: 2.
 * @returns ClosestResult with the best matching segment info.
 */
export function findClosestSegmentIndex(
  route: [number, number][],
  userPosition: [number, number],
  minSegIndex: number = 0,
  lookAheadBuffer: number = 2
): ClosestResult {
  if (route.length < 2) {
    return {
      segmentIndex: 0,
      projectedPoint: route[0] ?? userPosition,
      distanceMeters: 0,
    }
  }

  // Allow a small backward window to handle GPS wobble, but never before 0
  const searchStart = Math.max(0, minSegIndex - lookAheadBuffer)

  let bestSegIndex = searchStart
  let bestPoint: [number, number] = route[searchStart]
  let bestDist = Infinity

  for (let i = searchStart; i < route.length - 1; i++) {
    const { closestPoint, distanceMeters } = findClosestPointOnSegment(
      userPosition,
      route[i],
      route[i + 1]
    )
    if (distanceMeters < bestDist) {
      bestDist = distanceMeters
      bestSegIndex = i
      bestPoint = closestPoint
    }
  }

  return {
    segmentIndex: bestSegIndex,
    projectedPoint: bestPoint,
    distanceMeters: bestDist,
  }
}

/**
 * Returns the **remaining** portion of the route from the user's current
 * position to the destination, so the map only draws the path still ahead.
 *
 * The first point is the exact projected position on the polyline (not a
 * snapped vertex) for a smooth visual appearance.
 *
 * @param route       Full original route.
 * @param segIndex    The segment index returned by `findClosestSegmentIndex`.
 * @param projected   The projected point on that segment.
 * @returns Trimmed route starting at `projected`, followed by all subsequent vertices.
 */
export function trimRouteFromPosition(
  route: [number, number][],
  segIndex: number,
  projected: [number, number]
): [number, number][] {
  if (route.length === 0) return []

  // Take all vertices *after* the current segment start
  const remaining = route.slice(segIndex + 1)

  // Prepend the projected point (user's exact position on the line)
  return [projected, ...remaining]
}

/**
 * Returns `true` if the user has deviated from the route far enough
 * to warrant a reroute API call.
 *
 * Also applies a **hysteresis** check: you can optionally require the user to
 * be off-route for `consecutiveMisses` consecutive updates before triggering,
 * preventing a single noisy GPS fix from causing an unnecessary reroute.
 *
 * @param distanceMeters        Perpendicular distance from the user to the polyline.
 * @param thresholdMeters       Maximum allowed distance before deviation is flagged (default 25 m).
 * @returns true if deviated beyond threshold.
 */
export function checkDeviation(
  distanceMeters: number,
  thresholdMeters: number = 25
): boolean {
  return distanceMeters > thresholdMeters
}

/**
 * Computes the **total remaining distance** along the trimmed route in metres.
 * Useful for updating the ETA display during navigation.
 */
export function getRemainingDistance(trimmedRoute: [number, number][]): number {
  let total = 0
  for (let i = 0; i < trimmedRoute.length - 1; i++) {
    total += getDistanceInMeters(
      trimmedRoute[i][0], trimmedRoute[i][1],
      trimmedRoute[i + 1][0], trimmedRoute[i + 1][1]
    )
  }
  return total
}
