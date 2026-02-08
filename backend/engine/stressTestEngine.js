function simulateLoadIncrease(nodes, percentage) {
    const multiplier = 1 + percentage / 100;

    const simulated = nodes.map(node => {
        const newLoad = node.load * multiplier;
        const capacity = node.capacity;

        let status = "safe";
        if (newLoad >= capacity) status = "crashed";
        else if (newLoad >= capacity * 0.85) status = "critical";
        else if (newLoad >= capacity * 0.6) status = "warning";

        return {
            service: node.id,
            originalLoad: node.load,
            newLoad: Math.round(newLoad),
            capacity: capacity,
            status
        };
    });

    //first crashed service
    const crashed = simulated.find(s => s.status === "crashed");

    return {
        increase: percentage + "%",
        results: simulated,
        firstFailure: crashed ? crashed.service : "none"
    };
}

function runStressTests(nodes) {
    const levels = [20, 50, 100];

    return levels.map(level => simulateLoadIncrease(nodes, level));
}

module.exports = { runStressTests };
