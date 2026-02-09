const { calculateUtilization, getStatus } = require('./graphUtils');

function detectBottleneck(nodes) {
    if (!nodes || nodes.length === 0) return [];

    return nodes.map(node => {
        const capacity = Number(node.capacity) || 0;
        const load = Number(node.load) || 0;
        const utilization = calculateUtilization(load, capacity);

        return {
            service: node.id,
            load,
            capacity,
            utilization: (utilization * 100).toFixed(1) + "%",
            status: getStatus(utilization)
        };
    });
}

module.exports = { detectBottleneck };