const express = require("express");
const router = express.Router();

const { simulateTraffic } = require("../engine/trafficEngine");
const { simulateTrafficOverTime } = require("../engine/trafficTimeEngine");
const { runDES } = require("../engine/desEngine");

router.post("/", (req, res) => {
    try {
        const body = req.body || {};
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

router.post("/des", (req, res) => {
    try {
        const body = req.body || {};

        const entryNode = body.entry_node ?? body.entryNode;
        const nodes = Array.isArray(body.nodes) ? body.nodes : [];
        const edges = Array.isArray(body.edges) ? body.edges : [];
        const trafficWave = Array.isArray(body.traffic_wave) ? body.traffic_wave : [];
        const tickMs = Number(body.tick_ms) || 1000;
        const maxSimMs = Number(body.max_sim_ms) || 60000;
        const retryAttempts = Number(body.retry_attempts) || 2;
        const retryDelayMs = Number(body.retry_delay_ms) || 500;

        if (!entryNode) {
            return res.status(400).json({ success: false, error: "entry_node is required" });
        }
        if (nodes.length === 0) {
            return res.status(400).json({ success: false, error: "nodes must be a non-empty array" });
        }
        if (trafficWave.length === 0) {
            return res.status(400).json({ success: false, error: "traffic_wave must be a non-empty array" });
        }

        const normalisedNodes = nodes.map(n => ({
            id: n.id,
            capacity: Number(n.capacity) || 100,
            base_latency: Number(n.base_latency) || 10,
            max_queue: Number(n.max_queue) || 0,
            timeout_ms: Number(n.timeout_ms) || 2000,
            cb_failure_rate: Number(n.cb_failure_rate) || 0.5,
            cb_window_ms: Number(n.cb_window_ms) || 5000,
            cb_reset_ms: Number(n.cb_reset_ms) || 10000,
        }));

        const result = runDES({
            nodes: normalisedNodes,
            edges,
            entryNode,
            trafficWave,
            tickMs,
            maxSimMs,
            retryAttempts,
            retryDelayMs,
        });

        return res.json({ success: true, ...result });
    } catch (error) {
        console.error("DES simulation error:", error);
        return res.status(500).json({
            success: false,
            error: "Server Error",
            message: error.message,
        });
    }
});

module.exports = router;
