const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { detectSpof } = require("../engine/spof");

describe("SPOF Algorithm Tests (BUG-04 verification)", () => {
    test("reproduces BUG-04: leaf node in a 2-node graph (A -> B) must be LOW risk, not critical", () => {
        const nodes = [{ id: "A" }, { id: "B" }];
        const edges = [{ source: "A", target: "B" }];

        const results = detectSpof(nodes, edges, "A");
        const nodeA = results.find(r => r.service === "A");
        const nodeB = results.find(r => r.service === "B");

        assert.strictEqual(nodeA.affectedServices, 1, "Gateway A should affect 1 downstream service");
        assert.strictEqual(nodeA.risk, "critical", "Gateway A is a critical SPOF");

        assert.strictEqual(nodeB.affectedServices, 0, "Leaf node B affects 0 downstream services");
        assert.strictEqual(nodeB.risk, "low", "Leaf node B must be low risk");
    });

    test("reproduces BUG-04: unreachable orphan nodes must not be counted as affected by leaf nodes", () => {
        const nodes = [
            { id: "GW" },
            { id: "App" },
            { id: "DB" },
            { id: "Orphan1" },
            { id: "Orphan2" }
        ];
        const edges = [
            { source: "GW", target: "App" },
            { source: "App", target: "DB" }
        ];

        const results = detectSpof(nodes, edges, "GW");
        const dbResult = results.find(r => r.service === "DB");

        // DB is a leaf node; removing DB should affect 0 services, NOT the 2 orphan nodes
        assert.strictEqual(dbResult.affectedServices, 0, "Removing DB must affect 0 downstream services");
        assert.strictEqual(dbResult.risk, "low");

        const orphanResult = results.find(r => r.service === "Orphan1");
        assert.strictEqual(orphanResult.affectedServices, 0);
        assert.strictEqual(orphanResult.risk, "low");
    });

    test("correctly identifies articulation point in pipeline (A -> B -> C)", () => {
        const nodes = [{ id: "A" }, { id: "B" }, { id: "C" }];
        const edges = [
            { source: "A", target: "B" },
            { source: "B", target: "C" }
        ];

        const results = detectSpof(nodes, edges, "A");
        const bResult = results.find(r => r.service === "B");
        const cResult = results.find(r => r.service === "C");

        assert.strictEqual(bResult.affectedServices, 1, "Removing B cuts off C (1 affected)");
        assert.ok(bResult.risk === "high" || bResult.risk === "critical");
        assert.strictEqual(cResult.affectedServices, 0, "Removing leaf C affects 0");
        assert.strictEqual(cResult.risk, "low");
    });

    test("handles empty graph safely", () => {
        const results = detectSpof([], []);
        assert.deepStrictEqual(results, []);
    });

    test("handles redundant paths (diamond: GW -> S1 -> DB and GW -> S2 -> DB)", () => {
        const nodes = [{ id: "GW" }, { id: "S1" }, { id: "S2" }, { id: "DB" }];
        const edges = [
            { source: "GW", target: "S1" },
            { source: "GW", target: "S2" },
            { source: "S1", target: "DB" },
            { source: "S2", target: "DB" }
        ];

        const results = detectSpof(nodes, edges, "GW");
        const s1Result = results.find(r => r.service === "S1");
        const s2Result = results.find(r => r.service === "S2");

        // Because S2 still reaches DB, removing S1 does NOT cut off DB
        assert.strictEqual(s1Result.affectedServices, 0, "Removing S1 should not cut off DB because of redundant replica S2");
        assert.strictEqual(s1Result.risk, "low");
        assert.strictEqual(s2Result.affectedServices, 0);
        assert.strictEqual(s2Result.risk, "low");
    });
});
