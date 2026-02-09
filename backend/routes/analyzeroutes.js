const express = require("express");
const router = express.Router();

const { detectBottleneck } = require("../engine/bottleneck");
const { detectSpof } = require("../engine/spof");
const { detectLatencyRisk } = require("../engine/latencyEngine");
const { calculateRiskScore, generateSuggestions } = require("../engine/riskScoreEngine");
const { findWeakestService } = require("../engine/weakPointEngine");
const { runStressTests } = require("../engine/stressTestEngine");
const { runCascadeAnalysis } = require("../engine/cascadeEngine");
const { getArchitectureAdvice } = require("../services/GroqService");

router.post("/", async (req, res) => {
    try {
        const { nodes, edges } = req.body;

        if (!nodes || !edges) {
            return res.status(400).json({ error: "Nodes and edges are required" });
        }
        const bottleneckResult = detectBottleneck(nodes, edges);
        const spofResult = detectSpof(nodes, edges);
        const latencyRiskResult = detectLatencyRisk(nodes, edges);
        const weakestPoint = findWeakestService(nodes);
        const stressTest = runStressTests(nodes);
        const cascadeAnalysis = runCascadeAnalysis(nodes, edges);
        const overallRisk = calculateRiskScore(bottleneckResult, spofResult, latencyRiskResult);
        const suggestions = generateSuggestions(bottleneckResult, spofResult, latencyRiskResult);
        const aiAdvice = await getArchitectureAdvice({
            overallRisk,
            weakestPoint,
            bottleneckResult,
            spofResult,
            latencyRiskResult,
        });

        res.json({
            success: true,
            bottleneckResult,
            spofResult,
            latencyRiskResult,
            overallRisk,
            weakestPoint,
            stressTest,
            cascadeAnalysis,
            suggestions,
            aiAdvice,
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error", message: error.message });
    }
});

module.exports = router;
