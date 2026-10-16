const test = require("node:test");
const assert = require("node:assert/strict");
const { simulateTraffic } = require("../engine/trafficEngine");

test("Traffic Engine Test Suite", async (t) => {
    await t.test("linear pipeline propagates traffic accurately", () => {
        const nodes = [
            { id: "A", capacity: 200, base_latency: 10 },
            { id: "B", capacity: 100, base_latency: 20 },
            { id: "C", capacity: 50, base_latency: 30 }
        ];
        const edges = [
            { from: "A", to: "B", percentage: 100 },
            { from: "B", to: "C", percentage: 100 }
        ];

        const result = simulateTraffic({
            totalTraffic: 100,
            entryNode: "A",
            nodes,
            edges
        });

        const loadMap = {};
        result.nodeSummaries.forEach(n => { loadMap[n.id] = n.load; });

        assert.equal(loadMap["A"], 100);
        assert.equal(loadMap["B"], 100);
        assert.equal(loadMap["C"], 100);

        const nodeC = result.nodeSummaries.find(n => n.id === "C");
        assert.equal(nodeC.utilization, 2); // 100 load / 50 cap = ratio 2.0
        assert.equal(nodeC.utilizationPercent, 200); // 200%
        assert.equal(nodeC.status, "critical");
    });

    await t.test("branching edge percentages divide traffic correctly", () => {
        const nodes = [
            { id: "GW", capacity: 500 },
            { id: "S1", capacity: 200 },
            { id: "S2", capacity: 200 }
        ];
        const edges = [
            { from: "GW", to: "S1", percentage: 60 },
            { from: "GW", to: "S2", percentage: 40 }
        ];

        const result = simulateTraffic({
            totalTraffic: 200,
            entryNode: "GW",
            nodes,
            edges
        });

        const loadMap = {};
        result.nodeSummaries.forEach(n => { loadMap[n.id] = n.load; });

        assert.equal(loadMap["GW"], 200);
        assert.equal(loadMap["S1"], 120);
        assert.equal(loadMap["S2"], 80);
    });

    await t.test("cyclic feedback loops do not explode to unbounded 50x multipliers", () => {
        const nodes = [
            { id: "A", capacity: 200 },
            { id: "B", capacity: 200 }
        ];
        const edges = [
            { from: "A", to: "B", percentage: 100 },
            { from: "B", to: "A", percentage: 100 }
        ];

        const result = simulateTraffic({
            totalTraffic: 100,
            entryNode: "A",
            nodes,
            edges,
            maxVisitsPerNode: 3
        });

        const loadMap = {};
        result.nodeSummaries.forEach(n => { loadMap[n.id] = n.load; });

        // With maxVisitsPerNode = 3, load should be bounded (<= totalTraffic * 3 = 300), NOT 5,100
        assert.ok(loadMap["A"] <= 350, `Load on A (${loadMap["A"]}) should be bounded by visit limit`);
        assert.ok(loadMap["B"] <= 350, `Load on B (${loadMap["B"]}) should be bounded by visit limit`);
    });
});
