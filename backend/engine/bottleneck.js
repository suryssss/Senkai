function detectBottleneck(nodes) {
    if (!nodes || nodes.length == 0) return []

    const results = nodes.map(node => {
        const capacity = Number(node.capacity)
        const load = Number(node.load)

        let utilization = 0

        if (capacity > 0) {
            utilization = load / capacity
        }

        let status = "safe"

        if (utilization >= 0.85) {
            status = "danger"
        }
        else if (utilization >= 0.6) {
            status = "warning"
        }

        return {
            service: node.id,
            utilization,
            load,
            utilization: (utilization * 100).toFixed(1) + " %",
            status
        }
    })

    return results
}

module.exports = { detectBottleneck }