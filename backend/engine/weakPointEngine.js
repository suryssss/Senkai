function findWeakestService(nodes) {
    if (!nodes.length) return null;

    let weakest = null;
    let weakestCapacity = 0;
    let minRemaining = Infinity;

    nodes.forEach(node => {
        const capacity = Math.max(1, Number(node.capacity) || 100);
        const load = Math.max(0, Number(node.load) || 0);

        const remaining = capacity - load;

        if (remaining < minRemaining) {
            minRemaining = remaining;
            weakestCapacity = capacity;
            weakest = {
                service: node.id,
                remainingCapacity: remaining,
                utilization: ((load / capacity) * 100).toFixed(2) + "%"
            };
        }
    });

    let risk = "low";

    if (weakest.remainingCapacity <= 0) risk = "critical";
    else if (weakest.remainingCapacity < weakestCapacity * 0.2) risk = "high";

    return {
        weakestService: weakest.service,
        remainingCapacity: weakest.remainingCapacity,
        utilization: weakest.utilization,
        risk
    };
}

module.exports = { findWeakestService };
