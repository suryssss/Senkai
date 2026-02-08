function buildGraph(nodes, edges, removedNode = null) {
    const graph = {}

    nodes.forEach(node => {
        if (node.id !== removedNode) {
            graph[node.id] = []
        }
    })

    edges.forEach(edges => {
        if (
            edges.source != removedNode &&
            edges.target != removedNode &&
            graph[edges.source]
        ) {
            graph[edges.source].push(edges.target)
        }
    })
    return graph
}

function dfs(start, graph, visited) {
    if (!graph[start]) return;

    visited.add(start)

    for (let neighbour of graph[start]) {
        if (!visited.has(neighbour)) {
            dfs(neighbour, graph, visited)
        }
    }
}


function detectSpof(nodes, edges) {
    if (!nodes.length) return []

    const startNode = nodes[0].id //assuming first node is entry

    const totalNodes = nodes.length

    const results = []

    nodes.forEach(node => {
        const removed = node.id

        const graph = buildGraph(nodes, edges, removed)


        if (removed == startNode) {
            results.push({
                service: removed,
                affected: totalNodes,
                risk: "critical"
            })
            return
        }


        const visited = new Set()
        dfs(startNode, graph, visited)

        const reachable = visited.size
        const affected = totalNodes - reachable

        let risk = "low"
        if (affected > totalNodes * 0.5) risk = 'high'
        if (affected === totalNodes - 1) risk = "critical"

        results.push({
            service: removed,
            affectedServices: affected,
            risk
        })
    })

    return results
}

module.exports = { detectSpof };