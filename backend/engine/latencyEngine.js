const { buildGraphWithLatency } = require('./graphUtils');

function dfsLatency(node, graph, currentLatency, visited) {
    if (visited.has(node)) return currentLatency;

    visited.add(node);
    let maxLatency = currentLatency;
    const neighbors = graph[node] || [];

    for (const neighbor of neighbors) {
        const total = dfsLatency(
            neighbor.target,
            graph,
            currentLatency + neighbor.latency,
            new Set(visited)
        );

        if (total > maxLatency) maxLatency = total;
    }

    return maxLatency;
}

function detectLatencyRisk(nodes, edges) {
    if (!nodes.length) return { totalLatency: 0, risk: "low" };

    const startNode = "api-gateway";
    const entryNode = nodes.find(n => n.id === startNode) ? startNode : nodes[0].id;

    const graph = buildGraphWithLatency(edges);
    const totalLatency = dfsLatency(entryNode, graph, 0, new Set());

    let risk = "low";
    if (totalLatency > 200) risk = "high";
    else if (totalLatency > 120) risk = "warning";

    return {
        criticalPathLatency: totalLatency,
        risk
    };
}

module.exports = { detectLatencyRisk };
