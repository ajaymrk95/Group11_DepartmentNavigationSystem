import { distance } from "./distance"

type NodeId = string

export type Graph = Map<NodeId, { id: NodeId, coord: [number, number], edges: { to: NodeId, weight: number }[] }>

export function buildGraph(geojson: any): Graph {
  const graph: Graph = new Map()

  function addNode(coord: [number, number]) {
    const id = `${coord[0]},${coord[1]}`
    if (!graph.has(id)) {
      graph.set(id, { id, coord, edges: [] })
    }
    return id
  }

  geojson.features.forEach((feature: any) => {
    const coords = feature.geometry.coordinates

    for (let i = 0; i < coords.length - 1; i++) {
      const a: [number, number] = [coords[i][1], coords[i][0]]
      const b: [number, number] = [coords[i + 1][1], coords[i + 1][0]]

      const idA = addNode(a)
      const idB = addNode(b)

      const w = distance(a, b)

      graph.get(idA)!.edges.push({ to: idB, weight: w })
      graph.get(idB)!.edges.push({ to: idA, weight: w })
    }
  })

  return graph
}
