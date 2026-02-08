function calculateRiskScore(bottlenecks, spof, latency) {
    let score = 0;

    // Bottleneck scoring 
    let bottleneckRisk = 0;
    bottlenecks.forEach(b => {
        if (b.status === "danger") bottleneckRisk += 15;
        else if (b.status === "warning") bottleneckRisk += 7;
    });

    //SPOF scoring 
    let spofRisk = 0;
    spof.forEach(s => {
        if (s.risk === "critical") spofRisk += 20;
        else if (s.risk === "high") spofRisk += 10;
    });

    // Latency scoring 
    let latencyRisk = 0;
    if (latency.risk === "high") latencyRisk = 25;
    else if (latency.risk === "warning") latencyRisk = 15;

    score = bottleneckRisk + spofRisk + latencyRisk;

    if (score > 100) score = 100;

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

function generateSuggestions(bottlenecks, spof, latency) {
    const suggestions = [];

    bottlenecks.forEach(b => {
        if (b.status === "danger") {
            suggestions.push(
                `Service ${b.service} is overloaded. Consider scaling or load balancing.`
            );
        }
    });

    spof.forEach(s => {
        if (s.risk === "critical") {
            suggestions.push(
                `${s.service} is a single point of failure. Add redundancy or replica.`
            );
        }
    });

    if (latency.risk === "high" || latency.risk === "warning") {
        suggestions.push(
            "Critical path latency is high. Optimize service communication or caching."
        );
    }

    return suggestions;
}

module.exports = { calculateRiskScore, generateSuggestions };
