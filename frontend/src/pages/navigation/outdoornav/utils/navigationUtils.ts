import type { TurnInfo } from "../types/navigationTypes"

export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3
  const phi1 = lat1 * Math.PI / 180, phi2 = lat2 * Math.PI / 180
  const dPhi = (lat2 - lat1) * Math.PI / 180, dLambda = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dPhi/2)**2 + Math.cos(phi1)*Math.cos(phi2)*Math.sin(dLambda/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => d * Math.PI / 180
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

export function getDistanceAlongRoute(routeCoords: [number, number][], startIndex: number, endIndex: number): number {
  let dist = 0
  for (let i = startIndex; i < endIndex; i++) {
    dist += getDistanceInMeters(
      routeCoords[i][0], routeCoords[i][1],
      routeCoords[i + 1][0], routeCoords[i + 1][1]
    )
  }
  return dist
}

export function getNextTurn(routeCoords: [number, number][], cur: [number, number]): TurnInfo {
  if (routeCoords.length < 3) return { direction: 'straight', turnIndex: 0 }

  let closest = 0, minD = Infinity
  for (let i = 0; i < routeCoords.length; i++) {
    const d = Math.hypot(cur[0] - routeCoords[i][0], cur[1] - routeCoords[i][1])
    if (d < minD) { minD = d; closest = i }
  }

  for (let i = closest; i < routeCoords.length - 2; i++) {
    const b1 = getBearing(
      routeCoords[i][0], routeCoords[i][1],
      routeCoords[i + 1][0], routeCoords[i + 1][1]
    )

    const b2 = getBearing(
      routeCoords[i + 1][0], routeCoords[i + 1][1],
      routeCoords[i + 2][0], routeCoords[i + 2][1]
    )

    let diff = b2 - b1
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360

    if (diff > 25) return { direction: 'right', turnIndex: i + 1 }
    if (diff < -25) return { direction: 'left', turnIndex: i + 1 }
  }

  return { direction: 'arrive', turnIndex: routeCoords.length - 1 }
}