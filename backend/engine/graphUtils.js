
function buildGraph(edges) {
    const graph = {};
    edges.forEach(edge => {
        if (!graph[edge.source]) graph[edge.source] = [];
        graph[edge.source].push(edge.target);
    });
    return graph;
}

function buildGraphExcluding(nodes, edges, excludedNode = null) {
    const graph = {};
    nodes.forEach(node => {
        if (node.id !== excludedNode) graph[node.id] = [];
    });
    edges.forEach(edge => {
        if (edge.source !== excludedNode && edge.target !== excludedNode && graph[edge.source]) {
            graph[edge.source].push(edge.target);
        }
    });
    return graph;
}

function buildGraphWithLatency(edges) {
    const graph = {};
    edges.forEach(edge => {
        if (!graph[edge.source]) graph[edge.source] = [];
        graph[edge.source].push({ target: edge.target, latency: edge.latency || 10 });
    });
    return graph;
}

function dfs(start, graph, visited = new Set()) {
    if (!graph[start] || visited.has(start)) return;
    visited.add(start);
    for (const neighbor of graph[start]) {
        if (!visited.has(neighbor)) dfs(neighbor, graph, visited);
    }
    return visited;
}

function dfsWithFailed(node, graph, failed, visited) {
    if (visited.has(node)) return;
    visited.add(node);
    const neighbors = graph[node] || [];
    neighbors.forEach(n => {
        if (!failed.has(n)) dfsWithFailed(n, graph, failed, visited);
    });
}
function calculateUtilization(load, capacity) {
    if (!capacity || capacity <= 0) return 0;
    return load / capacity;
}

function getStatus(utilization) {
    if (utilization >= 1) return "crashed";
    if (utilization >= 0.85) return "danger";
    if (utilization >= 0.6) return "warning";
    return "safe";
}

module.exports = {
    buildGraph,
    buildGraphExcluding,
    buildGraphWithLatency,
    dfs,
    dfsWithFailed,
    calculateUtilization,
    getStatus
};
