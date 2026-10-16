const test = require("node:test");
const assert = require("node:assert/strict");
const { simulateTrafficOverTime } = require("../engine/trafficTimeEngine");

test("Timeline Traffic Engine Tests (BUG-13 & BUG-14 verification)", async (t) => {
    await t.test("reproduces BUG-13: queues must drain when incoming load drops below capacity", () => {
        const nodes = [
            { id: "API", capacity: 100, base_latency: 10 }
        ];
        const edges = [];

        // Step 1: Traffic 150 (overload of 50 -> queue = 50)
        // Step 2: Traffic drops to 70 (spare capacity of 30 -> queue should drain to 20)
        // Step 3: Traffic drops to 40 (spare capacity of 60 -> queue should drain to 0)
        const trafficSteps = [
            { t: 0, total_traffic: 150 },
            { t: 1, total_traffic: 70 },
            { t: 2, total_traffic: 40 }
        ];

        const result = simulateTrafficOverTime({
            trafficSteps,
            entryNode: "API",
            nodes,
            edges,
            timeoutMs: 5000
        });

        assert.equal(result.steps.length, 3);

        const step1Queue = result.steps[0].node_results.find(n => n.id === "API").queue;
        const step2Queue = result.steps[1].node_results.find(n => n.id === "API").queue;
        const step3Queue = result.steps[2].node_results.find(n => n.id === "API").queue;

        assert.equal(step1Queue, 50, "Step 1 queue should accumulate 50 overload");
        assert.equal(step2Queue, 20, "Step 2 queue should drain from 50 down to 20 via 30 spare capacity");
        assert.equal(step3Queue, 0, "Step 3 queue should drain completely to 0");

        // Step 3 latency should return to baseline
        const step3Latency = result.steps[2].node_results.find(n => n.id === "API").latency;
        assert.equal(step3Latency, 10, "Latency should return to base_latency once queue is empty");
    });

    await t.test("reproduces BUG-14: downstream database retries must NOT pollute ingress API gateway", () => {
        const nodes = [
            { id: "GW", capacity: 1000, base_latency: 5 },
            { id: "DB", capacity: 50, base_latency: 10 }
        ];
        const edges = [
            { from: "GW", to: "DB", percentage: 100 }
        ];

        // Step 1: 150 traffic. DB (capacity 50) overloads, queue explodes, latency > 200ms -> DB times out!
        // Step 2: 100 traffic. Gateway traffic should ONLY be 100, not 100 + DB retries!
        const trafficSteps = [
            { t: 0, total_traffic: 150 },
            { t: 1, total_traffic: 100 }
        ];

        const result = simulateTrafficOverTime({
            trafficSteps,
            entryNode: "GW",
            nodes,
            edges,
            timeoutMs: 200, // DB queue of 100 gives latency: 10 + (100/50)*100 = 210ms > 200ms
            retryRate: 1.0,
            failureRate: 0.5
        });

        const step1GW = result.steps[0].node_results.find(n => n.id === "GW");
        const step1DB = result.steps[0].node_results.find(n => n.id === "DB");
        assert.equal(step1GW.incoming_traffic, 150);
        assert.equal(step1DB.incoming_traffic, 150);
        assert.ok(step1DB.latency > 200, "DB latency should exceed timeout threshold");

        // Verify Step 2 Gateway traffic
        const step2GW = result.steps[1].node_results.find(n => n.id === "GW");
        assert.equal(
            step2GW.incoming_traffic,
            100,
            "Gateway incoming traffic on step 2 must remain exactly base traffic (100), not inflated by DB retries"
        );

        // Verify Step 2 DB traffic: DB should receive 100 (from GW) + its own carried retries
        const step2DB = result.steps[1].node_results.find(n => n.id === "DB");
        assert.ok(
            step2DB.incoming_traffic > 100,
            "Downstream DB should receive retries directed to it"
        );
    });

    await t.test("correctly applies client retries to gateway when gateway itself times out", () => {
        const nodes = [
            { id: "GW", capacity: 50, base_latency: 10 }
        ];
        const edges = [];

        // GW capacity 50, incoming traffic 200 -> queue 150 -> latency = 10 + (150/50)*100 = 310ms > 200ms
        const trafficSteps = [
            { t: 0, total_traffic: 200 },
            { t: 1, total_traffic: 50 }
        ];

        const result = simulateTrafficOverTime({
            trafficSteps,
            entryNode: "GW",
            nodes,
            edges,
            timeoutMs: 200,
            retryRate: 1.0,
            failureRate: 0.5
        });

        // Step 1 GW timed out (load 200 * 0.5 failure * 1.0 retry = 100 retries)
        // Step 2 effective traffic at GW should be base (50) + client retries (100) = 150
        const step2GW = result.steps[1].node_results.find(n => n.id === "GW");
        assert.equal(step2GW.incoming_traffic, 150, "Client retries should hit the entry gateway");
        assert.equal(result.steps[1].effective_traffic, 150);
    });

    await t.test("identifies first failure and reason correctly", () => {
        const nodes = [
            { id: "GW", capacity: 100, base_latency: 10 }
        ];
        const trafficSteps = [
            { t: 0, total_traffic: 50 },
            { t: 1, total_traffic: 250 }
        ];

        const result = simulateTrafficOverTime({
            trafficSteps,
            entryNode: "GW",
            nodes,
            edges: [],
            timeoutMs: 150
        });

        assert.ok(result.first_failure);
        assert.equal(result.first_failure.node_id, "GW");
        assert.equal(result.first_failure.at_time, 1);
    });

    await t.test("throws error when trafficSteps is empty or entryNode is missing", () => {
        assert.throws(() => {
            simulateTrafficOverTime({ trafficSteps: [], entryNode: "GW", nodes: [], edges: [] });
        }, /trafficSteps must be a non-empty array/);

        assert.throws(() => {
            simulateTrafficOverTime({ trafficSteps: [{ t: 0, total_traffic: 100 }], entryNode: "Missing", nodes: [{ id: "GW" }], edges: [] });
        }, /Entry node 'Missing' not found in nodes/);
    });
});
