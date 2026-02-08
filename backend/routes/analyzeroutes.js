const express = require("express");
const router = express.Router();

const { detectBottleneck } = require("../engine/bottleneck")
const { detectSpof } = require("../engine/spof")
const { detectLatencyRisk } = require("../engine/latencyEngine")
const { calculateRiskScore, generateSuggestions } = require("../engine/riskScoreEngine")

router.post("/", (req, res) => {
    try {
        const { nodes, edges } = req.body

        if (!nodes || !edges) {
            return res.status(400).json({ error: "Nodes and edges are required" })
        }

        const bottleneckResult = detectBottleneck(nodes, edges)
        const spofResult = detectSpof(nodes, edges)
        const latencyRiskResult = detectLatencyRisk(nodes, edges)

        const risk = calculateRiskScore(bottleneckResult, spofResult, latencyRiskResult)
        const suggestions = generateSuggestions(bottleneckResult, spofResult, latencyRiskResult)

        res.json({
            success: true,
            bottleneckResult,
            spofResult,
            latencyRiskResult,
            overallRisk: risk,
            suggestions
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Server Error" })
    }
});

module.exports = router;
