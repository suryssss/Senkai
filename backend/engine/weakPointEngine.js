const { calculateUtilization } = require('./graphUtils');

function findWeakestService(nodes = []) {
    if (!nodes || !nodes.length) return null;

    let weakestNode = null;
    let highestUtil = -1;

    nodes.forEach(node => {
        const capacity = Number(node.capacity) >= 0 ? Number(node.capacity) : 0;
        const load = Math.max(0, Number(node.load) || 0);
        const utilization = calculateUtilization(load, capacity);
        const remaining = capacity - load;

        // Compare by utilization: higher utilization is weaker.
        // If utilization is tied (e.g. both Infinity/crashed), the one with lower remaining capacity is weaker.
        if (
            utilization > highestUtil ||
            (utilization === highestUtil && remaining < (weakestNode ? weakestNode.remainingCapacity : Infinity))
        ) {
            highestUtil = utilization;
            weakestNode = {
                service: node.id,
                remainingCapacity: remaining,
                capacity,
                load,
                utilizationVal: utilization,
                utilization: Number.isFinite(utilization)
                    ? (utilization * 100).toFixed(2) + "%"
                    : "100.00%+"
            };
        }
    });

    if (!weakestNode) return null;

    let risk = "low";
    if (weakestNode.utilizationVal >= 1 || weakestNode.remainingCapacity <= 0) {
        risk = "critical";
    } else if (weakestNode.utilizationVal >= 0.85 || weakestNode.remainingCapacity < weakestNode.capacity * 0.2) {
        risk = "high";
    } else if (weakestNode.utilizationVal >= 0.6) {
        risk = "warning";
    }

    return {
        weakestService: weakestNode.service,
        remainingCapacity: weakestNode.remainingCapacity,
        utilization: weakestNode.utilization,
        risk
    };
}

module.exports = { findWeakestService };

