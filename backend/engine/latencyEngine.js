function buildGraphWithLatency(edges) {
    const graph = {};

    edges.forEach(edge => {
        if (!graph[edge.source]) {
            graph[edge.source] = [];
        }

        graph[edge.source].push({
            node: edge.target,
            latency: Number(edge.latency) || 0
        });
    });

    return graph;
}

function dfsLatency(node, graph, currentLatency, visited) {
    visited.add(node);

    let maxLatency = currentLatency;

    const neighbors = graph[node] || [];

    for (let neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
            const total = dfsLatency(
                neighbor.node,
                graph,
                currentLatency + neighbor.latency,
                new Set(visited)
            );

            if (total > maxLatency) {
                maxLatency = total;
            }
        }
    }

    return maxLatency;
}

function detectLatencyRisk(nodes, edges) {
    if (!nodes.length) return { totalLatency: 0, risk: "low" };

    const startNode = nodes[0].id; // assume first node is entry
    const graph = buildGraphWithLatency(edges);

    const totalLatency = dfsLatency(startNode, graph, 0, new Set());

    let risk = "low";
    if (totalLatency > 200) risk = "high";
    else if (totalLatency > 120) risk = "warning";

    return {
        criticalPathLatency: totalLatency,
        risk
    };
}

module.exports = { detectLatencyRisk };
