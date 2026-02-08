const express = require("express");
const router = express.Router();

const { detectBottleneck } = require("../engine/bottleneck")
const { detectSpof } = require("../engine/spof")
const { detectLatencyRisk } = require("../engine/latencyEngine")
const { calculateRiskScore, generateSuggestions } = require("../engine/riskScoreEngine")
const { findWeakestService } = require("../engine/weakPointEngine")
const { runStressTests } = require("../engine/stressTestEngine")
const { runCascadeAnalysis } = require("../engine/cascadeEngine")

router.post("/", (req, res) => {
    try {
        const { nodes, edges } = req.body

        if (!nodes || !edges) {
            return res.status(400).json({ error: "Nodes and edges are required" })
        }

        const bottleneckResult = detectBottleneck(nodes, edges)
        const spofResult = detectSpof(nodes, edges)
        const latencyRiskResult = detectLatencyRisk(nodes, edges)
        const weakestServiceResult = findWeakestService(nodes)
        const stressTestResult = runStressTests(nodes)
        const cascadeResult = runCascadeAnalysis(nodes, edges)

        const risk = calculateRiskScore(bottleneckResult, spofResult, latencyRiskResult)
        const suggestions = generateSuggestions(bottleneckResult, spofResult, latencyRiskResult)

        res.json({
            success: true,
            bottleneckResult,
            spofResult,
            latencyRiskResult,
            overallRisk: risk,
            weakestPoint: weakestServiceResult,
            stressTest: stressTestResult,
            cascadeAnalysis: cascadeResult,
            suggestions
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server Error" })
    }
});

module.exports = router;
