const Groq = require("groq-sdk");

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const AI_ENABLED = process.env.ENABLE_AI !== "false";

let groq = null;
if (GROQ_API_KEY && GROQ_API_KEY !== "YOUR_GROQ_API_KEY") {
    groq = new Groq({ apiKey: GROQ_API_KEY });
}

function sanitizeServiceName(name) {
    if (typeof name !== "string") return "unknown";
    // Strip control characters, newlines, system overrides, and markdown injection characters
    return name.replace(/[\r\n\t`#*<>[\]\\]/g, " ").trim().substring(0, 60);
}

async function getArchitectureAdvice(analysisData) {
    if (!groq || !AI_ENABLED) {
        return {
            enabled: false,
            message: GROQ_API_KEY ? "AI temporarily disabled" : "Set GROQ_API_KEY in .env.local to enable AI suggestions",
            suggestions: []
        };
    }

    try {
        const serviceDetails = analysisData.bottleneckResult?.map(b =>
            `${sanitizeServiceName(b.service)}: ${b.utilization} (${b.status})`
        ).join(", ") || "No services";

        const spofDetails = analysisData.spofResult?.filter(s => s.risk === "critical" || s.risk === "high")
            .map(s => sanitizeServiceName(s.service)).join(", ") || "None";

        const systemPrompt = `You are a senior system architect reviewing a microservices architecture.
Analyze the provided architecture metrics and provide exactly 4 specific, actionable improvements.
Focus on:
1. The weakest/most overloaded service specifically
2. High-utilization services (>80%) that need attention
3. Single points of failure
4. Overall architecture resilience

Return ONLY a valid JSON array with exactly 4 objects. Each object must have:
- "title": Short title (e.g., "Scale PostgreSQL Database")
- "severity": "critical", "high", "medium", or "low"
- "problem": Brief description of the issue
- "risk": What could go wrong if not addressed
- "solution": Specific actionable fix

No markdown formatting, no code blocks, no explanation. Just the raw JSON array.`;

        const userContent = `Architecture Risk Report:
- Overall Risk Score: ${Number(analysisData.overallRisk?.riskScore) || 0}/100 (${sanitizeServiceName(analysisData.overallRisk?.overallRisk || "Unknown")})
- Weakest Service: ${sanitizeServiceName(analysisData.weakestPoint?.weakestService || "None")}
  - Utilization: ${analysisData.weakestPoint?.utilization || "N/A"}
  - Remaining Capacity: ${analysisData.weakestPoint?.remainingCapacity || "N/A"}
  - Risk Level: ${sanitizeServiceName(analysisData.weakestPoint?.risk || "Unknown")}
- All Services (with utilization): ${serviceDetails}
- Single Points of Failure (High Risk): ${spofDetails}
- Critical Path Latency: ${Number(analysisData.latencyRiskResult?.criticalPathLatency) || 0}ms (${sanitizeServiceName(analysisData.latencyRiskResult?.risk || "Unknown")} risk)`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            model: GROQ_MODEL,
            temperature: 0.5,
            max_tokens: 1500,
        }, { timeout: 15000 });

        const responseText = completion.choices[0]?.message?.content || "";

        let suggestions = [];
        try {
            const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            suggestions = JSON.parse(cleaned);
        } catch {
            console.error("Failed to parse AI response:", responseText.substring(0, 200));
            suggestions = [{ title: "AI Analysis", severity: "medium", problem: "See details", risk: "Review needed", solution: responseText.substring(0, 200) }];
        }

        return { enabled: true, suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 4) : [suggestions] };

    } catch (error) {
        if (error.message?.includes("rate") || error.message?.includes("429")) {
            return {
                enabled: false,
                message: "AI rate limit reached. Please try again in a moment.",
                suggestions: []
            };
        }

        return { enabled: false, message: error.message || "AI unavailable", suggestions: [] };
    }
}

module.exports = { getArchitectureAdvice, sanitizeServiceName };
