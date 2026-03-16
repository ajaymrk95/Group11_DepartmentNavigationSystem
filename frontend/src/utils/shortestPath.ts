import type { Graph } from "./buildGraph"

export function shortestPath(graph: Graph, startId: string, endId: string) {
  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()

  graph.forEach((_, id) => {
    dist.set(id, Infinity)
    prev.set(id, null)
  })

  dist.set(startId, 0)

  while (visited.size < graph.size) {
    let u: string | null = null
    let best = Infinity

    dist.forEach((d, id) => {
      if (!visited.has(id) && d < best) {
        best = d
        u = id
      }
    })

    if (!u) break
    if (u === endId) break

    visited.add(u)

    graph.get(u)!.edges.forEach(edge => {
      const alt = dist.get(u)! + edge.weight
      if (alt < dist.get(edge.to)!) {
        dist.set(edge.to, alt)
        prev.set(edge.to, u)
      }
    })
  }

  if (prev.get(endId) === null && startId !== endId) {
  return [] 
}

const path: string[] = []
let u: string | null = endId

while (u) {
  path.unshift(u)
  u = prev.get(u) || null
}

return path
}
