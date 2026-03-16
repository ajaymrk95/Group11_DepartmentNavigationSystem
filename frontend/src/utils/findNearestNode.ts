import type { Graph } from "./buildGraph"
import { distance } from "./distance"

export function findNearestNode(graph: Graph, point: [number, number]) {
  let bestId: string | null = null
  let bestDist = Infinity

  graph.forEach(node => {
    const d = distance(point, node.coord)
    if (d < bestDist) {
      bestDist = d
      bestId = node.id
    }
  })

  return bestId
}
