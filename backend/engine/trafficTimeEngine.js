const { calculateUtilization } = require("./graphUtils");

function simulateTrafficOverTime({
    trafficSteps,
    entryNode,
    nodes,
    edges,
    maxVisitsPerNode = 3,
    timeoutMs = 2000,
    retryRate = 1.0,
    failureRate = 0.3,
}) {
    if (!Array.isArray(trafficSteps) || trafficSteps.length === 0) {
        throw new Error("trafficSteps must be a non-empty array");
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    if (!nodeIds.has(entryNode)) {
        throw new Error(`Entry node '${entryNode}' not found in nodes`);
    }

    const normalizedEdges = edges.map((e) => ({
        from: e.from,
        to: e.to,
        percentage: Number(e.percentage) || 0,
    }));

    const nodeQueue = {};
    const carryRetryPerNode = {};
    nodes.forEach((n) => {
        nodeQueue[n.id] = 0;
        carryRetryPerNode[n.id] = 0;
    });

    const steps = [];
    let stableUntil = null;
    let firstFailure = null;

    for (const step of trafficSteps) {
        const baseTraffic = Number(step.total_traffic) || 0;
        // Entry gateway receives external base traffic + client retries directed at the gateway
        const entryRetryTraffic = carryRetryPerNode[entryNode] || 0;
        const effectiveTraffic = baseTraffic + entryRetryTraffic;
        const graph = {};
        const nodeLoad = {};

        nodes.forEach((n) => {
            graph[n.id] = [];
            nodeLoad[n.id] = 0;
        });

        normalizedEdges.forEach((edge) => {
            const { from, to, percentage } = edge;
            if (!from || !to) return;
            if (!graph[from]) {
                graph[from] = [];
                if (nodeLoad[from] === undefined) nodeLoad[from] = 0;
            }
            if (nodeLoad[to] === undefined) nodeLoad[to] = 0;
            if (percentage <= 0) return;

            graph[from].push({
                to,
                percentage,
            });
        });

        let currentNodeLoad = {};
        nodes.forEach((n) => {
            currentNodeLoad[n.id] = n.id === entryNode ? effectiveTraffic : (carryRetryPerNode[n.id] || 0);
        });

        const maxIterations = 50;
        const epsilon = 0.1;

        for (let iter = 0; iter < maxIterations; iter++) {
            const nextLoad = {};
            nodes.forEach((n) => {
                nextLoad[n.id] = n.id === entryNode ? effectiveTraffic : (carryRetryPerNode[n.id] || 0);
            });

            for (const from in graph) {
                const currentLoad = currentNodeLoad[from] || 0;
                if (currentLoad <= 0) continue;

                for (const { to, percentage } of graph[from]) {
                    if (!to || !Number.isFinite(percentage) || percentage <= 0) continue;
                    nextLoad[to] += currentLoad * (percentage / 100);
                }
            }

            let maxDiff = 0;
            nodes.forEach((n) => {
                maxDiff = Math.max(maxDiff, Math.abs(nextLoad[n.id] - (currentNodeLoad[n.id] || 0)));
            });

            currentNodeLoad = nextLoad;
            if (maxDiff < epsilon) break;
        }

        for (const id in currentNodeLoad) {
            nodeLoad[id] = currentNodeLoad[id];
        }

        const nextRetryPerNode = {};
        nodes.forEach((n) => { nextRetryPerNode[n.id] = 0; });
        let stepRetryTraffic = 0;

        const nodeResults = nodes.map((node) => {
            const load = Math.round(nodeLoad[node.id] || 0);
            const capacity = Number(node.capacity) || 0;
            const utilization = calculateUtilization(load, capacity);

            const baseLatency = Number(node.base_latency) || 0;
            const overload = capacity > 0 ? Math.max(0, load - capacity) : 0;
            const spareCapacity = capacity > 0 ? Math.max(0, capacity - load) : 0;
            // Drain queue by available spare capacity when load < capacity (BUG-13)
            nodeQueue[node.id] = Math.max(0, nodeQueue[node.id] + overload - spareCapacity);
            const queueSize = nodeQueue[node.id];

            const latency = capacity > 0
                ? baseLatency + (queueSize / capacity) * 100
                : baseLatency;

            let status = "safe";
            if (utilization >= 1.2 || latency > timeoutMs) {
                status = "critical";
            } else if (utilization >= 0.85) {
                status = "overloaded";
            } else if (utilization >= 0.6) {
                status = "warning";
            }

            if (latency > timeoutMs && load > 0) {
                const failed = load * failureRate;
                const retries = failed * retryRate;
                // Track retry traffic targeting this specific failing service (BUG-14)
                nextRetryPerNode[node.id] = retries;
                stepRetryTraffic += retries;
            }

            return {
                id: node.id,
                incoming_traffic: load,
                capacity,
                utilization,
                status,
                queue: queueSize,
                latency,
            };
        });

        // Pass retries forward to next step per node
        nodes.forEach((n) => {
            carryRetryPerNode[n.id] = nextRetryPerNode[n.id] || 0;
        });

        const hasFailure = nodeResults.some(
            (n) => n.status === "critical" || n.utilization > 1 || n.queue > n.capacity
        );

        if (!hasFailure) {
            stableUntil = effectiveTraffic;
        } else if (!firstFailure) {
            const failingNode =
                nodeResults.find((n) => n.status === "critical" || n.utilization > 1 || n.queue > n.capacity) ||
                nodeResults[0];

            let reason = "overload";
            if (failingNode.queue > failingNode.capacity) {
                reason = "queue_overflow";
            } else if (failingNode.latency > timeoutMs) {
                reason = "timeout";
            }

            firstFailure = {
                node_id: failingNode.id,
                at_time: step.t,
                at_traffic: effectiveTraffic,
                reason,
            };
        }

        steps.push({
            t: step.t,
            base_traffic: baseTraffic,
            retry_traffic: stepRetryTraffic,
            effective_traffic: effectiveTraffic,
            node_results: nodeResults,
        });
    }

    return {
        steps,
        stable_until: stableUntil,
        first_failure: firstFailure,
    };
}

module.exports = {
    simulateTrafficOverTime,
};
