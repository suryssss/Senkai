const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { calculateRiskScore, generateSuggestions } = require("../engine/riskScoreEngine");

describe("riskScoreEngine Tests (BUG-02 verification)", () => {
    test("reproduces BUG-02: structural SPOF and latency risks must NOT be zeroed out when load is 0", () => {
        const bottlenecksZeroLoad = [
            { service: "api", load: 0, capacity: 1000, utilization: "0.0%", status: "safe" },
            { service: "db", load: 0, capacity: 500, utilization: "0.0%", status: "safe" }
        ];
        const spofsCritical = [
            { service: "api", affectedServices: 1, risk: "critical" },
            { service: "db", affectedServices: 1, risk: "critical" }
        ];
        const latencyHigh = { criticalPathLatency: 250, risk: "high" };

        const result = calculateRiskScore(bottlenecksZeroLoad, spofsCritical, latencyHigh);

        // Under BUG-02, spofRisk was 0, latencyRisk was 0, and riskScore was 0!
        // Under Option A: Base SPOF floor (9) + Base Latency floor (8) = 17 ("Low")
        assert.ok(result.breakdown.spofRisk > 0, "SPOF risk must not be zeroed out on idle system");
        assert.strictEqual(result.breakdown.spofRisk, 9, "Base SPOF floor is retained at idle");
        assert.strictEqual(result.breakdown.latencyRisk, 8, "Base latency floor is retained at idle");
        assert.strictEqual(result.riskScore, 17, "Total risk score retains structural vulnerability at idle");
        assert.strictEqual(result.overallRisk, "Low");
    });

    test("accumulates bottleneck risks when services are degraded or crashed", () => {
        const bottlenecks = [
            { service: "svc-1", load: 1500, capacity: 1000, utilization: "150.0%", status: "crashed" },
            { service: "svc-2", load: 900, capacity: 1000, utilization: "90.0%", status: "danger" },
            { service: "svc-3", load: 700, capacity: 1000, utilization: "70.0%", status: "warning" },
            { service: "svc-4", load: 200, capacity: 1000, utilization: "20.0%", status: "safe" }
        ];
        const spofs = [];
        const latency = { criticalPathLatency: 50, risk: "low" };

        const result = calculateRiskScore(bottlenecks, spofs, latency);

        // Crashed (25) + Danger (15) + Warning (8) = 48 -> capped at max 45
        assert.strictEqual(result.breakdown.bottleneckRisk, 45);
        assert.strictEqual(result.riskScore, 45);
        assert.strictEqual(result.overallRisk, "Medium");
    });

    test("clamps riskScore to 100 when sum exceeds maximum", () => {
        const bottlenecks = [
            { service: "s1", status: "crashed", utilization: "200%" },
            { service: "s2", status: "crashed", utilization: "200%" },
            { service: "s3", status: "crashed", utilization: "200%" }
        ];
        const spofs = [
            { service: "s1", risk: "critical" },
            { service: "s2", risk: "critical" },
            { service: "s3", risk: "critical" }
        ];
        const latency = { risk: "high" };

        const result = calculateRiskScore(bottlenecks, spofs, latency);
        // Bottlenecks (45) + SPOF (35) + Latency (20) = 100
        assert.strictEqual(result.riskScore, 100);
        assert.strictEqual(result.overallRisk, "High");
    });

    test("verifies risk score decreases dynamically when traffic and bottlenecks decrease", () => {
        const spofs = [
            { service: "api", risk: "critical" }
        ];
        const latency = { risk: "warning" };

        const highLoadBottlenecks = [
            { service: "api", status: "crashed" },
            { service: "db", status: "crashed" }
        ];
        const highResult = calculateRiskScore(highLoadBottlenecks, spofs, latency);

        const lowLoadBottlenecks = [
            { service: "api", status: "safe" },
            { service: "db", status: "safe" }
        ];
        const lowResult = calculateRiskScore(lowLoadBottlenecks, spofs, latency);

        assert.ok(highResult.riskScore > lowResult.riskScore, "Risk score must decrease as traffic/bottlenecks decrease");
        assert.strictEqual(lowResult.breakdown.bottleneckRisk, 0);
        assert.strictEqual(highResult.breakdown.bottleneckRisk, 45);
    });

    test("handles empty and undefined inputs safely without throwing", () => {
        const result = calculateRiskScore();
        assert.strictEqual(result.riskScore, 0);
        assert.strictEqual(result.overallRisk, "Low");
        assert.deepStrictEqual(result.breakdown, {
            bottleneckRisk: 0,
            spofRisk: 0,
            latencyRisk: 0
        });
    });

    test("generateSuggestions includes suggestions for crashed as well as danger services", () => {
        const bottlenecks = [
            { service: "db-primary", status: "crashed" },
            { service: "auth-mesh", status: "danger" }
        ];
        const spofs = [{ service: "api-gateway", risk: "critical" }];
        const latency = { risk: "high" };

        const suggestions = generateSuggestions(bottlenecks, spofs, latency);

        assert.ok(suggestions.some(s => s.includes("db-primary")), "Must include crashed service in suggestions");
        assert.ok(suggestions.some(s => s.includes("auth-mesh")), "Must include danger service in suggestions");
        assert.ok(suggestions.some(s => s.includes("api-gateway")), "Must include SPOF service in suggestions");
        assert.ok(suggestions.some(s => s.includes("Critical path latency")), "Must include latency in suggestions");
    });
});
