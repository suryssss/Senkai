const { buildGraphExcluding, dfs } = require('./graphUtils');

function detectSpof(nodes = [], edges = [], entryNodeId) {
    if (!nodes || !nodes.length) return [];

    const startNode = entryNodeId || nodes[0].id;

    // 1. Calculate baseline reachability from startNode before any node is removed
    const baselineGraph = buildGraphExcluding(nodes, edges, null);
    const baselineVisited = new Set();
    dfs(startNode, baselineGraph, baselineVisited);
    const baselineReachable = baselineVisited.size; // includes startNode

    return nodes.map(node => {
        const removed = node.id;

        // If startNode itself is removed, removing the entry gateway cuts off all downstream services
        if (removed === startNode) {
            const affected = Math.max(0, baselineReachable - 1);
            return { service: removed, affectedServices: affected, risk: affected > 0 ? "critical" : "low" };
        }

        // If the node was not even reachable from startNode, removing it affects 0 downstream reachable nodes
        if (!baselineVisited.has(removed)) {
            return { service: removed, affectedServices: 0, risk: "low" };
        }

        // Build graph without the removed node and calculate reachability from startNode
        const graph = buildGraphExcluding(nodes, edges, removed);
        const visited = new Set();
        dfs(startNode, graph, visited);

        const reachable = visited.size;
        // Newly unreachable nodes (excluding the removed node itself)
        const affected = Math.max(0, baselineReachable - reachable - 1);

        let risk = "low";
        if (affected > 0) {
            const reachableDownstream = baselineReachable - 1;
            const ratio = reachableDownstream > 0 ? affected / reachableDownstream : 0;
            if (ratio >= 0.75 || affected >= 3) {
                risk = "critical";
            } else if (ratio >= 0.3 || affected >= 1) {
                risk = "high";
            }
        }

        return { service: removed, affectedServices: affected, risk };
    });
}

module.exports = { detectSpof };