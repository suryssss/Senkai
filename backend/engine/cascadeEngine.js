const { buildGraph, dfsWithFailed } = require('./graphUtils');

function simulateCascadeFailure(nodes, edges, failedService) {
    const graph = buildGraph(edges);
    const failed = new Set([failedService]);
    const affected = [];

    nodes.forEach(node => {
        if (node.id === failedService) return;
        const visited = new Set();
        dfsWithFailed(node.id, graph, failed, visited);
        if (visited.has(failedService)) affected.push(node.id);
    });

    return {
        initialFailure: failedService,
        cascadedFailures: affected,
        totalAffected: affected.length + 1
    };
}

function runCascadeAnalysis(nodes, edges) {
    return nodes.map(node => simulateCascadeFailure(nodes, edges, node.id));
}

module.exports = { runCascadeAnalysis };
