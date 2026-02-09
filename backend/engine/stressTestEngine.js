const { calculateUtilization, getStatus } = require('./graphUtils');

function simulateLoadIncrease(nodes, percentage) {
    const multiplier = 1 + percentage / 100;
    const simulation = nodes.map(node => {
        const capacity = Number(node.capacity) || 0;
        const currentLoad = Number(node.load) || 0;

        const newLoad = Math.round(currentLoad * multiplier);
        const utilization = calculateUtilization(newLoad, capacity);

        return {
            service: node.id,
            originalLoad: currentLoad,
            newLoad,
            capacity,
            status: getStatus(utilization),
            utilization: (utilization * 100).toFixed(1) + "%"
        };
    });
    const crashedService = simulation.find(s => s.status === "crashed");

    return {
        increase: percentage + "%",
        simulationResults: simulation,
        firstFailure: crashedService ? crashedService.service : "None"
    };
}

function runStressTests(nodes) {
    const levels = [20, 50, 100];
    return levels.map(level => simulateLoadIncrease(nodes, level));
}

module.exports = { runStressTests };
