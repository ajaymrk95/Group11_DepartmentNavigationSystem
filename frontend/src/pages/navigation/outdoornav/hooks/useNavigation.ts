import { useEffect, useState } from "react"
import { getBearing, getDistanceAlongRoute } from "../utils/navigationUtils"
import type { TurnInfo } from "../types/navigationTypes"

export function useNavigation(
  routeCoords: [number, number][],
  currentLocation: [number, number] | null,
  isNavigating: boolean
) {
  const [turnInfo, setTurnInfo] = useState<TurnInfo>({ direction: 'straight', turnIndex: 0 })
  const [distance, setDistance] = useState<number | null>(null)

  function getNextTurn(routeCoords: [number, number][], cur: [number, number]): TurnInfo {
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

  useEffect(() => {
    if (!isNavigating || !currentLocation || routeCoords.length === 0) return

    const info = getNextTurn(routeCoords, currentLocation)
    setTurnInfo(info)

    let closest = 0, minD = Infinity
    for (let i = 0; i < routeCoords.length; i++) {
      const d = Math.hypot(currentLocation[0] - routeCoords[i][0], currentLocation[1] - routeCoords[i][1])
      if (d < minD) { minD = d; closest = i }
    }

    const dist = getDistanceAlongRoute(routeCoords, closest, info.turnIndex)
    setDistance(dist)

  }, [currentLocation, isNavigating, routeCoords])

  return { turnInfo, distance }
}