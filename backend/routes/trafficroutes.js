const express = require("express");
const router = express.Router();

const { simulateTraffic } = require("../engine/trafficEngine");
const { simulateTrafficOverTime } = require("../engine/trafficTimeEngine");

router.post("/", (req, res) => {
    try {
        const body = req.body || {};

        // Support both the documented contract and previous camelCase keys
        const totalTraffic = body.total_traffic ?? body.totalTraffic ?? 0;
        const entryNode = body.entry_node ?? body.entryNode;
        const nodes = Array.isArray(body.nodes) ? body.nodes : [];
        const edges = Array.isArray(body.edges) ? body.edges : [];
        const maxVisitsPerNode = body.maxVisitsPerNode || 3;

        if (!Array.isArray(nodes) || !Array.isArray(edges)) {
            return res.status(400).json({ success: false, error: "nodes and edges must be arrays" });
        }

        const result = simulateTraffic({
            totalTraffic,
            entryNode,
            nodes: nodes.map((n) => ({
                id: n.id,
                capacity: Number(n.capacity) || 0,
                base_latency: Number(n.base_latency) || 0,
            })),
            edges: edges.map((e) => ({
                // Accept both {from,to,percentage} and {source,target,data.percentage}
                from: e.from ?? e.source,
                to: e.to ?? e.target,
                percentage: e.percentage ?? e.data?.percentage,
            })),
            maxVisitsPerNode,
        });

        const nodeResults = result.nodeSummaries.map((n) => ({
            id: n.id,
            incoming_traffic: n.load,
            capacity: n.capacity,
            utilization: n.utilization,
            status: n.status,
            queue: n.queue,
            latency: n.latency,
        }));

        return res.json({
            success: true,
            node_results: nodeResults,
        });
    } catch (error) {
        console.error("Traffic simulation error:", error);
        return res.status(500).json({
            success: false,
            error: "Server Error",
            message: error.message,
        });
    }
});

router.post("/timeline", (req, res) => {
    try {
        const body = req.body || {};

        const entryNode = body.entry_node ?? body.entryNode;
        const nodes = Array.isArray(body.nodes) ? body.nodes : [];
        const edges = Array.isArray(body.edges) ? body.edges : [];
        const trafficSteps = Array.isArray(body.traffic_steps)
            ? body.traffic_steps
            : [];

        const maxVisitsPerNode = body.maxVisitsPerNode || 3;
        const timeoutMs = body.timeout_ms || 2000;
        const retryRate = body.retry_rate ?? 1.0;
        const failureRate = body.failure_rate ?? 0.3;

        const normalizedEdges = edges.map((e) => ({
            from: e.from ?? e.source,
            to: e.to ?? e.target,
            percentage: e.percentage ?? e.data?.percentage,
        }));

        const result = simulateTrafficOverTime({
            trafficSteps,
            entryNode,
            nodes: nodes.map((n) => ({
                id: n.id,
                capacity: Number(n.capacity) || 0,
                base_latency: Number(n.base_latency) || 0,
            })),
            edges: normalizedEdges,
            maxVisitsPerNode,
            timeoutMs,
            retryRate,
            failureRate,
        });

        return res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Traffic timeline simulation error:", error);
        return res.status(500).json({
            success: false,
            error: "Server Error",
            message: error.message,
        });
    }
});

module.exports = router;

