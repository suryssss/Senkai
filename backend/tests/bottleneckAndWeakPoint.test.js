const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { calculateUtilization, getStatus } = require("../engine/graphUtils");
const { detectBottleneck } = require("../engine/bottleneck");
const { findWeakestService } = require("../engine/weakPointEngine");

describe("Bottleneck and Weak Point Tests (BUG-10 verification)", () => {
    test("calculateUtilization with capacity <= 0 and positive load returns Infinity (crashed)", () => {
        const util = calculateUtilization(500, 0);
        assert.strictEqual(util, Infinity, "Positive load on zero capacity must be infinite utilization");
        assert.strictEqual(getStatus(util), "crashed");
    });

    test("calculateUtilization with capacity <= 0 and zero load returns 0", () => {
        const util = calculateUtilization(0, 0);
        assert.strictEqual(util, 0);
        assert.strictEqual(getStatus(util), "safe");
    });

    test("detectBottleneck flags zero-capacity node with load as crashed, not safe", () => {
        const nodes = [{ id: "unprovisioned-db", capacity: 0, load: 250 }];
        const results = detectBottleneck(nodes);

        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].status, "crashed", "Zero-capacity node with load must be crashed");
    });

    test("findWeakestService identifies 95% utilized service over 10% utilized service despite absolute headroom", () => {
        const nodes = [
            { id: "SmallService", capacity: 10, load: 1 },    // 10% load, remaining = 9
            { id: "BigDatabase", capacity: 1000, load: 950 }  // 95% load, remaining = 50
        ];

        const weakest = findWeakestService(nodes);
        assert.ok(weakest !== null);
        assert.strictEqual(weakest.weakestService, "BigDatabase", "Service at 95% capacity must be identified as weakest over 10% service");
        assert.strictEqual(weakest.risk, "high");
    });

    test("findWeakestService handles zero-capacity node with load as critical", () => {
        const nodes = [
            { id: "ZeroCapNode", capacity: 0, load: 50 },
            { id: "NormalNode", capacity: 100, load: 10 }
        ];

        const weakest = findWeakestService(nodes);
        assert.strictEqual(weakest.weakestService, "ZeroCapNode");
        assert.strictEqual(weakest.risk, "critical");
    });

    test("handles empty nodes gracefully", () => {
        assert.deepStrictEqual(detectBottleneck([]), []);
        assert.strictEqual(findWeakestService([]), null);
    });
});
