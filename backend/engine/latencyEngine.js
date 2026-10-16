const { buildGraphWithLatency } = require('./graphUtils');

function detectLatencyRisk(nodes = [], edges = [], entryNodeId) {
    if (!nodes || !nodes.length) return { criticalPathLatency: 0, risk: "low" };

    const entryNode = entryNodeId || nodes[0].id;
    const graph = buildGraphWithLatency(edges);

    const memo = new Map();
    const visiting = new Set(); // Recursion stack for cycle detection

    function computeMaxPath(nodeId) {
        if (visiting.has(nodeId)) {
            // Cycle detected: break loop without infinite recursion
            return 0;
        }
        if (memo.has(nodeId)) {
            return memo.get(nodeId);
        }

        visiting.add(nodeId);
        let maxDownstream = 0;
        const neighbors = graph[nodeId] || [];

        for (const neighbor of neighbors) {
            const edgeLatency = Number(neighbor.latency) || 0;
            const downstream = edgeLatency + computeMaxPath(neighbor.target);
            if (downstream > maxDownstream) {
                maxDownstream = downstream;
            }
        }

        visiting.delete(nodeId);
        memo.set(nodeId, maxDownstream);
        return maxDownstream;
    }

    const totalLatency = computeMaxPath(entryNode);

    let risk = "low";
    if (totalLatency > 200) risk = "high";
    else if (totalLatency > 120) risk = "warning";

    return {
        criticalPathLatency: totalLatency,
        risk
    };
}

module.exports = { detectLatencyRisk };

