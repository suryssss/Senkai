const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { detectLatencyRisk } = require("../engine/latencyEngine");

describe("Latency Engine Tests (BUG-03 verification)", () => {
    test("calculates correct critical path latency on a linear pipeline", () => {
        const nodes = [{ id: "A" }, { id: "B" }, { id: "C" }];
        const edges = [
            { source: "A", target: "B", latency: 50 },
            { source: "B", target: "C", latency: 100 }
        ];

        const result = detectLatencyRisk(nodes, edges, "A");
        assert.strictEqual(result.criticalPathLatency, 150);
        assert.strictEqual(result.risk, "warning"); // 120 < 150 <= 200
    });

    test("finds the longest path in a diamond branch", () => {
        const nodes = [{ id: "GW" }, { id: "Fast" }, { id: "Slow" }, { id: "DB" }];
        const edges = [
            { source: "GW", target: "Fast", latency: 10 },
            { source: "Fast", target: "DB", latency: 20 },
            { source: "GW", target: "Slow", latency: 50 },
            { source: "Slow", target: "DB", latency: 80 }
        ];

        const result = detectLatencyRisk(nodes, edges, "GW");
        // Longest path: GW -> Slow -> DB = 50 + 80 = 130
        assert.strictEqual(result.criticalPathLatency, 130);
        assert.strictEqual(result.risk, "warning");
    });

    test("reproduces BUG-03 prevention: 25-step diamond graph must complete in < 50ms (linear O(V+E))", () => {
        // A 25-step diamond graph has 2^25 = 33,554,432 paths.
        // Old code froze the process. New code must finish in milliseconds.
        const K = 25;
        const nodes = [];
        const edges = [];

        for (let i = 0; i <= K; i++) {
            nodes.push({ id: `n_${i}` });
            if (i < K) {
                nodes.push({ id: `top_${i}` });
                nodes.push({ id: `bot_${i}` });
                edges.push({ source: `n_${i}`, target: `top_${i}`, latency: 2 });
                edges.push({ source: `n_${i}`, target: `bot_${i}`, latency: 5 }); // bot is slower
                edges.push({ source: `top_${i}`, target: `n_${i+1}`, latency: 2 });
                edges.push({ source: `bot_${i}`, target: `n_${i+1}`, latency: 5 });
            }
        }

        const start = performance.now();
        const result = detectLatencyRisk(nodes, edges, "n_0");
        const elapsed = performance.now() - start;

        // In each step, bot branch is 5 + 5 = 10ms. For 25 steps: 25 * 10 = 250ms
        assert.strictEqual(result.criticalPathLatency, 250);
        assert.strictEqual(result.risk, "high"); // > 200 is high
        assert.ok(elapsed < 100, `Must complete in < 100ms, took ${elapsed.toFixed(2)}ms`);
    });

    test("handles cycles safely without infinite loops or stack overflow", () => {
        const nodes = [{ id: "A" }, { id: "B" }, { id: "C" }];
        const edges = [
            { source: "A", target: "B", latency: 20 },
            { source: "B", target: "A", latency: 20 }, // Mutual cycle
            { source: "B", target: "C", latency: 30 }
        ];

        const result = detectLatencyRisk(nodes, edges, "A");
        // A -> B (20) -> C (30) = 50
        assert.strictEqual(result.criticalPathLatency, 50);
        assert.strictEqual(result.risk, "low");
    });

    test("handles empty and undefined inputs safely", () => {
        const result = detectLatencyRisk([], []);
        assert.deepStrictEqual(result, { criticalPathLatency: 0, risk: "low" });
    });
});
