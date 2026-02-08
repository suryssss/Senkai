function buildGraph(edges) {
    const graph = {};

    edges.forEach(edge => {
        if (!graph[edge.source]) {
            graph[edge.source] = [];
        }
        graph[edge.source].push(edge.target);
    });

    return graph;
}

function dfs(node, graph, failed, visited) {
    if (visited.has(node)) return;
    visited.add(node);

    const neighbors = graph[node] || [];

    neighbors.forEach(n => {
        if (!failed.has(n)) {
            dfs(n, graph, failed, visited);
        }
    });
}

function simulateCascadeFailure(nodes, edges, failedService) {
    const graph = buildGraph(edges);

    const failed = new Set([failedService]);
    const affected = [];

    // any service depending on failed node becomes affected
    nodes.forEach(node => {
        if (node.id === failedService) return;

        const visited = new Set();
        dfs(node.id, graph, failed, visited);

        if (visited.has(failedService)) {
            affected.push(node.id);
        }
    });

    return {
        initialFailure: failedService,
        cascadedFailures: affected,
        totalAffected: affected.length + 1
    };
}

function runCascadeAnalysis(nodes, edges) {
    const results = [];

    nodes.forEach(node => {
        const simulation = simulateCascadeFailure(nodes, edges, node.id);
        results.push(simulation);
    });

    return results;
}

module.exports = { runCascadeAnalysis };
