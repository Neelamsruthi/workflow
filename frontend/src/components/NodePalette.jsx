function NodePalette({ onAddNode }) {

    const nodeTypes = [
        {
            type: "TRIGGER_WEBHOOK",
            label: "Webhook Trigger"
        },
        {
            type: "ACTION_HTTP",
            label: "HTTP Request"
        },
        {
            type: "TRANSFORM_JS",
            label: "JavaScript Transform"
        },
        {
            type: "ROUTER_IF_ELSE",
            label: "Condition"
        },
        {
            type: "DELAY",
            label: "Delay"
        }
    ];

    return (
        <div className="node-palette">

            <h3>Add Node</h3>

            {nodeTypes.map((node) => (
                <button
                    key={node.type}
                    onClick={() => onAddNode(node.type)}
                >
                    {node.label}
                </button>
            ))}

        </div>
    );
}

export default NodePalette;