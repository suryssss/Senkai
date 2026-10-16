const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { runDES } = require("../engine/desEngine");

describe("DES Engine Tests (BUG-08 verification)", () => {
    test("reproduces BUG-08: 50/50 branch routing must conserve request count without duplication or loss", () => {
        const nodes = [
            { id: "GW", capacity: 1000, base_latency: 10, max_queue: 1000 },
            { id: "SvcA", capacity: 1000, base_latency: 10, max_queue: 1000 },
            { id: "SvcB", capacity: 1000, base_latency: 10, max_queue: 1000 },
        ];
        const edges = [
            { source: "GW", target: "SvcA", percentage: 50 },
            { source: "GW", target: "SvcB", percentage: 50 },
        ];
        const totalArrivals = 200;
        const wave = [{ t: 0, arrivals: totalArrivals }];

        const result = runDES({
            nodes,
            edges,
            entryNode: "GW",
            trafficWave: wave,
            tickMs: 1000,
            maxSimMs: 5000,
            retryAttempts: 0
        });

        const svcA = result.serviceSummaries.find(s => s.id === "SvcA");
        const svcB = result.serviceSummaries.find(s => s.id === "SvcB");

        const totalDownstreamServed = (svcA?.totalServed || 0) + (svcB?.totalServed || 0);

        // All 200 requests pass through GW and must be distributed between SvcA and SvcB.
        // Under BUG-08 independent rolls, sum was stochastic (e.g. 218 or 184).
        // With cumulative CDF routing, sum must strictly equal 200.
        assert.strictEqual(
            totalDownstreamServed,
            totalArrivals,
            `Total downstream requests served (${totalDownstreamServed}) must equal input arrivals (${totalArrivals})`
        );

        // Both services should receive approximately 50% (+/- 30 for 200 samples)
        assert.ok(svcA.totalServed > 60, `SvcA should receive traffic: got ${svcA.totalServed}`);
        assert.ok(svcB.totalServed > 60, `SvcB should receive traffic: got ${svcB.totalServed}`);
    });

    test("single downstream branch routes 100% of traffic without loss", () => {
        const nodes = [
            { id: "GW", capacity: 500, base_latency: 10 },
            { id: "App", capacity: 500, base_latency: 10 }
        ];
        const edges = [{ source: "GW", target: "App", percentage: 100 }];
        const wave = [{ t: 0, arrivals: 100 }];

        const result = runDES({
            nodes,
            edges,
            entryNode: "GW",
            trafficWave: wave,
            tickMs: 1000,
            maxSimMs: 3000,
            retryAttempts: 0
        });

        const appSummary = result.serviceSummaries.find(s => s.id === "App");
        assert.strictEqual(appSummary.totalServed, 100);
    });
});
