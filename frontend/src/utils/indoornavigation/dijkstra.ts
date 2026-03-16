// utils/dijkstra.ts
import type { Graph, NodeId } from "./buildGraph";

export interface PathResult {
    nodes: NodeId[];       // ordered node IDs
    totalCost: number;
}

export function dijkstra(
    graph: Graph,
    startId: NodeId,
    endId: NodeId
): PathResult | null {

    const dist = new Map<NodeId, number>();
    const prev = new Map<NodeId, NodeId | null>();
    // Min-heap via a simple priority queue
    const queue: Array<{ id: NodeId; cost: number }> = [];

    dist.set(startId, 0);
    queue.push({ id: startId, cost: 0 });

    while (queue.length > 0) {
        // Pop lowest cost node
        queue.sort((a, b) => a.cost - b.cost);
        const { id: current } = queue.shift()!;

        if (current === endId) break;

        for (const edge of graph.get(current) ?? []) {
            const newCost = (dist.get(current) ?? Infinity) + edge.weight;
            if (newCost < (dist.get(edge.to) ?? Infinity)) {
                dist.set(edge.to, newCost);
                prev.set(edge.to, current);
                queue.push({ id: edge.to, cost: newCost });
            }
        }
    }

    if (!dist.has(endId)) return null; // no path

    // Reconstruct path
    const nodes: NodeId[] = [];
    let cursor: NodeId | null | undefined = endId;
    while (cursor) {
        nodes.unshift(cursor);
        cursor = prev.get(cursor);
    }

    return { nodes, totalCost: dist.get(endId)! };
}