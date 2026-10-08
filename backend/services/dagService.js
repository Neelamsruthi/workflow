const validateDAG = (nodes, edges) => {
    const nodeIds = nodes.map((node) => node.nodeId);

    const inDegree = {};

    const graph = {};

    // Initialize every node
    for (const nodeId of nodeIds) {
        inDegree[nodeId] = 0;
        graph[nodeId] = [];
    }

    // Build graph
    for (const edge of edges) {

        const { sourceNodeId, targetNodeId } = edge;

        // Check source node
        if (!graph[sourceNodeId]) {
            return {
                valid: false,
                message: `Source node ${sourceNodeId} does not exist`
            };
        }

        // Check target node
        if (!graph[targetNodeId]) {
            return {
                valid: false,
                message: `Target node ${targetNodeId} does not exist`
            };
        }

        // Self-loop
        if (sourceNodeId === targetNodeId) {
            return {
                valid: false,
                message: `Node ${sourceNodeId} cannot connect to itself`
            };
        }

        graph[sourceNodeId].push(targetNodeId);

        inDegree[targetNodeId]++;
    }

    // Start with nodes having zero incoming edges
    const queue = [];

    for (const nodeId of nodeIds) {
        if (inDegree[nodeId] === 0) {
            queue.push(nodeId);
        }
    }

    const sortedNodes = [];

    // Kahn's Algorithm
    while (queue.length > 0) {

        const currentNode = queue.shift();

        sortedNodes.push(currentNode);

        for (const neighbor of graph[currentNode]) {

            inDegree[neighbor]--;

            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        }
    }

    // If not all nodes were processed,
    // a cycle exists.
    if (sortedNodes.length !== nodeIds.length) {

        const cycleNodes = nodeIds.filter(
            (nodeId) => !sortedNodes.includes(nodeId)
        );

        return {
            valid: false,
            message: "Workflow contains a cycle",
            cycleNodes
        };
    }

    return {
        valid: true,
        message: "Workflow is a valid DAG",
        executionOrder: sortedNodes
    };
};

module.exports = validateDAG;