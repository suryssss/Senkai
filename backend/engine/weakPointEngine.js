function findWeakestService(nodes) {
    if (!nodes.length) return null;

    let weakest = null;
    let minRemaining = Infinity;

    nodes.forEach(node => {
        const capacity = Number(node.capacity);
        const load = Number(node.load);

        const remaining = capacity - load;

        if (remaining < minRemaining) {
            minRemaining = remaining;
            weakest = {
                service: node.id,
                remainingCapacity: remaining,
                utilization: ((load / capacity) * 100).toFixed(2) + "%"
            };
        }
    });

    let risk = "low";

    if (weakest.remainingCapacity <= 0) risk = "critical";
    else if (weakest.remainingCapacity < weakest.remainingCapacity * 0.2) risk = "high";

    return {
        weakestService: weakest.service,
        remainingCapacity: weakest.remainingCapacity,
        utilization: weakest.utilization,
        risk
    };
}

module.exports = { findWeakestService };
