const { buildGraphExcluding, dfs } = require('./graphUtils');

function detectSpof(nodes, edges) {
    if (!nodes.length) return [];

    const startNode = nodes[0].id;
    const totalNodes = nodes.length;

    return nodes.map(node => {
        const removed = node.id;

        if (removed === startNode) {
            return { service: removed, affectedServices: totalNodes - 1, risk: "critical" };
        }

        const graph = buildGraphExcluding(nodes, edges, removed);
        const visited = new Set();
        dfs(startNode, graph, visited);

        const reachable = visited.size;
        const affected = totalNodes - reachable - 1;

        let risk = "low";
        if (affected > totalNodes * 0.5) risk = "high";
        if (affected >= totalNodes - 2) risk = "critical";

        return { service: removed, affectedServices: affected, risk };
    });
}

module.exports = { detectSpof };