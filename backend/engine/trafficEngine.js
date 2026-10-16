const { calculateUtilization } = require("./graphUtils");

function simulateTraffic({ totalTraffic, entryNode, nodes, edges, maxVisitsPerNode = 3 }) {
    if (typeof totalTraffic !== "number" || Number.isNaN(totalTraffic) || totalTraffic < 0) {
        throw new Error("totalTraffic must be a non-negative number");
    }

    if (!entryNode) {
        throw new Error("entryNode is required");
    }

    if (!Array.isArray(nodes) || nodes.length === 0) {
        throw new Error("nodes must be a non-empty array");
    }

    if (!Array.isArray(edges)) {
        throw new Error("edges must be an array");
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    if (!nodeIds.has(entryNode)) {
        throw new Error(`Entry node '${entryNode}' not found in nodes`);
    }

    const graph = {};
    const nodeLoad = {};

    nodes.forEach((n) => {
        graph[n.id] = [];
        nodeLoad[n.id] = 0;
    });

    edges.forEach((edge) => {
        const from = edge.source || edge.from;
        const to = edge.target || edge.to;
        if (!from || !to) return;

        if (!graph[from]) {
            graph[from] = [];
            if (nodeLoad[from] === undefined) nodeLoad[from] = 0;
        }
        if (nodeLoad[to] === undefined) nodeLoad[to] = 0;

        const rawPct = edge.percentage ?? edge.data?.percentage ?? 0;
        const pct = Number(rawPct);
        const safePct = Number.isFinite(pct) ? Math.max(0, pct) : 0;

        graph[from].push({
            to,
            percentage: safePct,
        });
    });

    let currentWave = {};
    nodes.forEach((n) => {
        currentWave[n.id] = n.id === entryNode ? totalTraffic : 0;
        nodeLoad[n.id] = currentWave[n.id];
    });

    const visitCount = {};
    nodes.forEach((n) => {
        visitCount[n.id] = n.id === entryNode && totalTraffic > 0 ? 1 : 0;
    });

    const maxSteps = 50;
    const epsilon = 0.001;

    for (let step = 0; step < maxSteps; step++) {
        let hasActiveTraffic = false;
        const nextWave = {};
        nodes.forEach((n) => { nextWave[n.id] = 0; });

        for (const from in graph) {
            const loadToForward = currentWave[from] || 0;
            if (loadToForward <= epsilon) continue;

            for (const { to, percentage } of graph[from]) {
                if (!to || !Number.isFinite(percentage) || percentage <= 0) continue;
                if (visitCount[to] >= maxVisitsPerNode) {
                    continue; // Loop bounded by TTL / max visits
                }
                const forwarded = loadToForward * (percentage / 100);
                if (forwarded > epsilon) {
                    nextWave[to] += forwarded;
                    hasActiveTraffic = true;
                }
            }
        }

        if (!hasActiveTraffic) break;

        for (const id in nextWave) {
            if (nextWave[id] > epsilon) {
                visitCount[id] = (visitCount[id] || 0) + 1;
                nodeLoad[id] = (nodeLoad[id] || 0) + nextWave[id];
            }
        }

        currentWave = nextWave;
    }

    const nodeSummaries = nodes.map((node) => {
        const load = Math.round(nodeLoad[node.id] || 0);
        const capacity = Number(node.capacity) || 0;
        const utilization = calculateUtilization(load, capacity);

        const baseLatency = Number(node.base_latency) || 0;
        const overload = capacity > 0 ? Math.max(0, load - capacity) : 0;
        const queue = overload;
        const latency = capacity > 0
            ? baseLatency + (queue / capacity) * 100
            : baseLatency;
        let status = "safe";
        if (utilization >= 1.2) {
            status = "critical";
        } else if (utilization >= 0.85) {
            status = "overloaded";
        } else if (utilization >= 0.6) {
            status = "warning";
        }

        return {
            id: node.id,
            load,
            capacity,
            utilization,
            utilizationPercent: Number((utilization * 100).toFixed(1)),
            status,
            queue,
            latency,
        };
    });

    const nodeLoads = {};
    nodeSummaries.forEach((n) => {
        nodeLoads[n.id] = n.load;
    });

    return {
        nodeLoads,
        nodeSummaries,
    };
}

module.exports = {
    simulateTraffic,
};
