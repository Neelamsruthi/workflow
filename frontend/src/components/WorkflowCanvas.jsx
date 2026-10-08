import { useCallback, useEffect, useState } from "react";

import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Handle,
    Position,
    useNodesState,
    useEdgesState
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import NodePalette from "./NodePalette";



function WorkflowCanvas({
    initialNodes = [],
    initialEdges = [],
    onWorkflowChange
}) {

    const [nodes, setNodes, onNodesChange] =
        useNodesState(initialNodes);

    const [edges, setEdges, onEdgesChange] =
        useEdgesState(initialEdges);

    const [selectedNodeId, setSelectedNodeId] =
        useState(null);
useEffect(() => {
    onWorkflowChange({
        nodes,
        edges
    });
}, [nodes, edges, onWorkflowChange]);

    /*
     * Send current workflow data
     * to WorkflowEditor
     */
  

    /*
     * React Flow connection
     */
    const onConnect = useCallback(
        (connection) => {

            console.log(
                "✅ CONNECTION FIRED:",
                connection
            );

            setEdges((currentEdges) => {

                const newEdge = {

                    id:
                        `edge-${Date.now()}`,

                    source:
                        connection.source,

                    target:
                        connection.target,

                    sourceHandle:
                        connection.sourceHandle,

                    targetHandle:
                        connection.targetHandle
                };


                const updatedEdges = [
                    ...currentEdges,
                    newEdge
                ];


                console.log(
                    "✅ UPDATED EDGES:",
                    updatedEdges
                );


                return updatedEdges;
            });

        },
        [setEdges]
    );


    /*
     * Add workflow node
     */
    const addNode = (type) => {

        const nodeId =
            `${type}-${Date.now()}`;


        const newNode = {

            id: nodeId,

            position: {
                x:
                    200 +
                    nodes.length * 50,

                y:
                    100 +
                    nodes.length * 50
            },

            data: {

                label:
                    getNodeLabel(type),

                type,

                config: {}

            },

            type:
                "workflowNode"
        };


        setNodes((currentNodes) => [

            ...currentNodes,

            newNode

        ]);
    };


    /*
     * Update Transform code
     */
    const updateTransformCode = (
        code
    ) => {

        if (!selectedNodeId) {
            return;
        }


        setNodes((currentNodes) =>

            currentNodes.map((node) => {

                if (
                    node.id !==
                    selectedNodeId
                ) {
                    return node;
                }


                return {

                    ...node,

                    data: {

                        ...node.data,

                        config: {

                            ...node.data?.config,

                            code

                        }

                    }

                };

            })

        );
    };


    /*
     * Update HTTP URL
     */
    const updateHttpUrl = (
        url
    ) => {

        if (!selectedNodeId) {
            return;
        }


        setNodes((currentNodes) =>

            currentNodes.map((node) => {

                if (
                    node.id !==
                    selectedNodeId
                ) {
                    return node;
                }


                return {

                    ...node,

                    data: {

                        ...node.data,

                        config: {

                            ...node.data?.config,

                            url

                        }

                    }

                };

            })

        );
    };


    /*
     * Update HTTP method
     */
    const updateHttpMethod = (
        method
    ) => {

        if (!selectedNodeId) {
            return;
        }


        setNodes((currentNodes) =>

            currentNodes.map((node) => {

                if (
                    node.id !==
                    selectedNodeId
                ) {
                    return node;
                }


                return {

                    ...node,

                    data: {

                        ...node.data,

                        config: {

                            ...node.data?.config,

                            method

                        }

                    }

                };

            })

        );
    };


    /*
     * Update HTTP body
     */
    const updateHttpBody = (
        body
    ) => {

        if (!selectedNodeId) {
            return;
        }


        setNodes((currentNodes) =>

            currentNodes.map((node) => {

                if (
                    node.id !==
                    selectedNodeId
                ) {
                    return node;
                }


                return {

                    ...node,

                    data: {

                        ...node.data,

                        config: {

                            ...node.data?.config,

                            body

                        }

                    }

                };

            })

        );
    };


    /*
     * Update Delay
     */
    const updateDelay = (
        delay
    ) => {

        if (!selectedNodeId) {
            return;
        }


        setNodes((currentNodes) =>

            currentNodes.map((node) => {

                if (
                    node.id !==
                    selectedNodeId
                ) {
                    return node;
                }


                return {

                    ...node,

                    data: {

                        ...node.data,

                        config: {

                            ...node.data?.config,

                            delay:
                                Number(delay)

                        }

                    }

                };

            })

        );
    };


    /*
     * Update Condition
     */
  const updateCondition = (
    field,
    value
) => {

    if (!selectedNodeId) {
        return;
    }

    setNodes((currentNodes) =>
        currentNodes.map((node) => {

            if (
                node.id !== selectedNodeId
            ) {
                return node;
            }

            const currentConfig =
                node.data?.config || {};

            return {
                ...node,

                data: {
                    ...node.data,

                    config: {
                        field:
                            currentConfig.field || "",

                        operator:
                            currentConfig.operator ||
                            "equals",

                        value:
                            currentConfig.value || "",

                        [field]: value
                    }
                }
            };
        })
    );
};

    const selectedNode =
        nodes.find(
            (node) =>
                node.id ===
                selectedNodeId
        );


    return (

        <div className="workflow-builder">


            <NodePalette
                onAddNode={addNode}
            />


            <div className="canvas">


                <ReactFlow

                    nodes={nodes}

                    edges={edges}

                    onNodesChange={
                        onNodesChange
                    }

                    onEdgesChange={
                        onEdgesChange
                    }

                    onConnect={
                        onConnect
                    }


                    onNodeClick={
                        (event, node) => {

                            console.log(
                                "SELECTED NODE:",
                                node
                            );

                            setSelectedNodeId(
                                node.id
                            );

                        }
                    }


                    nodeTypes={{
                        workflowNode:
                            WorkflowNode
                    }}


                    fitView

                >

                    <Background />

                    <Controls />

                    <MiniMap />

                </ReactFlow>


                {/*
                 * Transform configuration
                 */}
                {selectedNode?.data?.type ===
                    "TRANSFORM_JS" && (

                    <div
                        className="node-config-panel"
                    >

                        <h3>
                            JavaScript Transform
                        </h3>


                        <textarea

                            value={
                                selectedNode
                                    .data
                                    ?.config
                                    ?.code || ""
                            }


                            onChange={
                                (e) =>
                                    updateTransformCode(
                                        e.target.value
                                    )
                            }


                            placeholder={
                                "return { name: input.name.toUpperCase() };"
                            }


                            rows={8}

                        />

                    </div>

                )}


                {/*
                 * HTTP configuration
                 */}
                {selectedNode?.data?.type ===
                    "ACTION_HTTP" && (

                    <div
                        className="node-config-panel"
                    >

                        <h3>
                            HTTP Request
                        </h3>


                        <label>
                            Method
                        </label>


                        <select

                            value={
                                selectedNode
                                    .data
                                    ?.config
                                    ?.method ||
                                "GET"
                            }


                            onChange={
                                (e) =>
                                    updateHttpMethod(
                                        e.target.value
                                    )
                            }
                        >

                            <option value="GET">
                                GET
                            </option>

                            <option value="POST">
                                POST
                            </option>

                            <option value="PUT">
                                PUT
                            </option>

                            <option value="PATCH">
                                PATCH
                            </option>

                            <option value="DELETE">
                                DELETE
                            </option>

                        </select>


                        <label>
                            URL
                        </label>


                        <input

                            type="text"

                            value={
                                selectedNode
                                    .data
                                    ?.config
                                    ?.url || ""
                            }


                            onChange={
                                (e) =>
                                    updateHttpUrl(
                                        e.target.value
                                    )
                            }


                            placeholder={
                                "https://httpbin.org/post"
                            }

                        />


                        <label>
                            Request Body
                        </label>


                        <textarea

                            value={
                                selectedNode
                                    .data
                                    ?.config
                                    ?.body || ""
                            }


                            onChange={
                                (e) =>
                                    updateHttpBody(
                                        e.target.value
                                    )
                            }


                            placeholder={
                                '{"message":"Hello"}'
                            }


                            rows={6}

                        />

                    </div>

                )}


                {/*
                 * Delay configuration
                 */}
                {selectedNode?.data?.type ===
                    "DELAY" && (

                    <div
                        className="node-config-panel"
                    >

                        <h3>
                            Delay
                        </h3>


                        <label>
                            Delay (milliseconds)
                        </label>


                        <input

                            type="number"

                            min="0"

                            value={
                                selectedNode
                                    .data
                                    ?.config
                                    ?.delay || 0
                            }


                            onChange={
                                (e) =>
                                    updateDelay(
                                        e.target.value
                                    )
                            }

                        />


                        <p
                            style={{
                                marginTop:
                                    "8px",

                                color:
                                    "#777"
                            }}
                        >
                            Example:
                            5000 = 5 seconds
                        </p>

                    </div>

                )}


                {/*
                 * Condition configuration
                 */}
                {selectedNode?.data?.type ===
                    "ROUTER_IF_ELSE" && (

                    <div
                        className="node-config-panel"
                    >

                        <h3>
                            Condition
                        </h3>


                        <label>
                            Field
                        </label>


                        <input

                            type="text"

                            value={
                                selectedNode
                                    .data
                                    ?.config
                                    ?.field || ""
                            }


                            onChange={
                                (e) =>
                                    updateCondition(
                                        "field",
                                        e.target.value
                                    )
                            }


                            placeholder="status"

                        />


                        <label>
                            Operator
                        </label>


                        <select

                            value={
                                selectedNode
                                    .data
                                    ?.config
                                    ?.operator ||
                                "equals"
                            }


                            onChange={
                                (e) =>
                                    updateCondition(
                                        "operator",
                                        e.target.value
                                    )
                            }

                        >

                            <option value="equals">
                                Equals
                            </option>

                            <option value="not_equals">
                                Not Equals
                            </option>

                            <option value="contains">
                                Contains
                            </option>

                            <option value="greater_than">
                                Greater Than
                            </option>

                            <option value="less_than">
                                Less Than
                            </option>

                        </select>


                        <label>
                            Value
                        </label>


                        <input

                            type="text"

                            value={
                                selectedNode
                                    .data
                                    ?.config
                                    ?.value || ""
                            }


                            onChange={
                                (e) =>
                                    updateCondition(
                                        "value",
                                        e.target.value
                                    )
                            }


                            placeholder="success"

                        />

                    </div>

                )}

            </div>

        </div>

    );
}


/*
 * Custom React Flow node
 */
function WorkflowNode({ data }) {

    return (

        <div

            style={{

                padding:
                    "15px 25px",

                border:
                    "2px solid #333",

                borderRadius:
                    "8px",

                background:
                    "#fff",

                minWidth:
                    "150px",

                textAlign:
                    "center",

                position:
                    "relative"

            }}

        >


            <Handle

                type="target"

                position={
                    Position.Top
                }

                id="target"

                style={{

                    width: 14,

                    height: 14,

                    background:
                        "#555",

                    top: -7,

                    cursor:
                        "crosshair"

                }}

            />


            <div>
                {data.label}
            </div>


            {/*
             * Condition node has
             * TRUE and FALSE outputs
             */}
            {data.type ===
                "ROUTER_IF_ELSE" ? (

                <>

                    <Handle

                        type="source"

                        position={
                            Position.Bottom
                        }

                        id="true"

                        style={{

                            width: 14,

                            height: 14,

                            background:
                                "#22c55e",

                            bottom: -7,

                            left:
                                "35%",

                            cursor:
                                "crosshair"

                        }}

                    />


                    <Handle

                        type="source"

                        position={
                            Position.Bottom
                        }

                        id="false"

                        style={{

                            width: 14,

                            height: 14,

                            background:
                                "#ef4444",

                            bottom: -7,

                            left:
                                "65%",

                            cursor:
                                "crosshair"

                        }}

                    />

                </>

            ) : (

                <Handle

                    type="source"

                    position={
                        Position.Bottom
                    }

                    id="source"

                    style={{

                        width: 14,

                        height: 14,

                        background:
                            "#555",

                        bottom: -7,

                        cursor:
                            "crosshair"

                    }}

                />

            )}

        </div>
    );
}


function getNodeLabel(type) {

    switch (type) {

        case "TRIGGER_WEBHOOK":
            return "Webhook Trigger";

        case "ACTION_HTTP":
            return "HTTP Request";

        case "TRANSFORM_JS":
            return "JavaScript Transform";

        case "ROUTER_IF_ELSE":
            return "Condition";

        case "DELAY":
            return "Delay";

        default:
            return "Node";
    }
}


export default WorkflowCanvas;