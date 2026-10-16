function calculateRiskScore(bottlenecks = [], spof = [], latency = {}) {
    // 1. Operational Load / Bottleneck Risk (Max 45 points)
    // Reflects live traffic and service degradation
    let bottleneckRaw = 0;
    let maxUtilization = 0;

    (bottlenecks || []).forEach(b => {
        if (b.status === "crashed") bottleneckRaw += 25;
        else if (b.status === "danger") bottleneckRaw += 15;
        else if (b.status === "warning") bottleneckRaw += 8;

        let util = parseFloat(b.utilization) || 0;
        if (util > maxUtilization) maxUtilization = util;
        if (b.status === "crashed") maxUtilization = Math.max(maxUtilization, 100);
    });
    const bottleneckRisk = Math.min(45, bottleneckRaw);

    // Dynamic load factor based on service strain (reaches 1.0 at 80% utilization or crashes)
    const loadFactor = Math.min(Math.max(maxUtilization / 80, 0), 1);

    // 2. Structural SPOF Risk (Max 35 points)
    // At idle (loadFactor ~ 0): base architectural warning floor (up to 10 points)
    // Under heavy load (loadFactor ~ 1.0): dynamically amplifies up to 35 points
    let spofRaw = 0;
    (spof || []).forEach(s => {
        if (s.risk === "critical") spofRaw += 15;
        else if (s.risk === "high") spofRaw += 8;
    });
    const maxSpof = Math.min(35, spofRaw);
    const baseSpof = maxSpof > 0 ? Math.min(10, Math.round(maxSpof * (10 / 35))) : 0;
    const dynamicSpof = Math.round((maxSpof - baseSpof) * loadFactor);
    const spofRisk = baseSpof + dynamicSpof;

    // 3. Performance / Latency Risk (Max 20 points)
    // At idle: base latency floor (5 pts for warning, 8 pts for high)
    // Under load: dynamically amplifies up to 10 or 20 points
    let maxLatency = 0;
    if (latency && latency.risk === "high") maxLatency = 20;
    else if (latency && latency.risk === "warning") maxLatency = 10;

    const baseLatency = maxLatency > 0 ? (maxLatency === 20 ? 8 : 5) : 0;
    const dynamicLatency = Math.round((maxLatency - baseLatency) * loadFactor);
    const latencyRisk = baseLatency + dynamicLatency;

    // Total composite score: [0, 100]
    let score = bottleneckRisk + spofRisk + latencyRisk;
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    let overall = "Low";
    if (score > 70) overall = "High";
    else if (score > 40) overall = "Medium";

    return {
        riskScore: score,
        overallRisk: overall,
        breakdown: {
            bottleneckRisk,
            spofRisk,
            latencyRisk
        }
    };
}

function generateSuggestions(bottlenecks = [], spof = [], latency = {}) {
    const suggestions = [];

    (bottlenecks || []).forEach(b => {
        if (b.status === "crashed") {
            suggestions.push(
                `Service ${b.service} is crashed due to severe overload. Scale immediately or add shedding.`
            );
        } else if (b.status === "danger") {
            suggestions.push(
                `Service ${b.service} is overloaded. Consider scaling or load balancing.`
            );
        }
    });

    (spof || []).forEach(s => {
        if (s.risk === "critical") {
            suggestions.push(
                `${s.service} is a single point of failure. Add redundancy or replica.`
            );
        }
    });

    if (latency && (latency.risk === "high" || latency.risk === "warning")) {
        suggestions.push(
            "Critical path latency is high. Optimize service communication or caching."
        );
    }

    return suggestions;
}

module.exports = { calculateRiskScore, generateSuggestions };

