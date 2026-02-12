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

    nodeLoad[entryNode] = totalTraffic;

    const visitCount = {};
    const queue = [entryNode];

    while (queue.length > 0) {
        const current = queue.shift();

        visitCount[current] = (visitCount[current] || 0) + 1;
        if (visitCount[current] > maxVisitsPerNode) {
            continue;
        }

        const currentLoad = nodeLoad[current] || 0;
        const neighbors = graph[current] || [];

        for (const { to, percentage } of neighbors) {
            if (!to || !Number.isFinite(percentage) || percentage <= 0) continue;

            const trafficToChild = currentLoad * (percentage / 100);
            if (!Number.isFinite(trafficToChild) || trafficToChild <= 0) continue;

            if (nodeLoad[to] === undefined) nodeLoad[to] = 0;
            nodeLoad[to] += trafficToChild;
            queue.push(to);
        }
    }

    const nodeSummaries = nodes.map((node) => {
        const load = Math.round(nodeLoad[node.id] || 0);
        const capacity = Number(node.capacity) || 0;
        const utilization = calculateUtilization(load, capacity);

        const baseLatency = Number(node.base_latency) || 0;
        const overload = capacity > 0 ? Math.max(0, load - capacity) : 0;
        const queue = overload; // simple queue model: anything above capacity queues
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

