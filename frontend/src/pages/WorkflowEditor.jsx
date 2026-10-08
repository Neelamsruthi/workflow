import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import WorkflowCanvas from "../components/WorkflowCanvas";
import { useNavigate } from "react-router-dom";

/*
 * FR-DAG-02
 * Validate workflow DAG using Kahn's Algorithm
 */

const validateDAG = (nodes, edges) => {

    if (!nodes.length) {
        return {
            valid: false,
            message: "Workflow must contain at least one node"
        };
    }


    /*
     * Workflow must contain a webhook trigger
     */
    const hasTrigger = nodes.some(
        (node) =>
            node.data?.type === "TRIGGER_WEBHOOK"
    );

    if (!hasTrigger) {
        return {
            valid: false,
            message: "Workflow must contain a Webhook Trigger"
        };
    }


    /*
     * Create adjacency list
     */
    const adjacencyList = {};

    const inDegree = {};


    nodes.forEach((node) => {

        adjacencyList[node.id] = [];
        inDegree[node.id] = 0;

    });


    /*
     * Build graph
     */
    for (const edge of edges) {

        if (
            !adjacencyList[edge.source] ||
            !adjacencyList[edge.target]
        ) {
            return {
                valid: false,
                message: "Invalid edge detected"
            };
        }


        /*
         * Self-loop
         */
        if (edge.source === edge.target) {

            return {
                valid: false,
                message:
                    `Cycle detected: ${edge.source} connects to itself`
            };

        }


        adjacencyList[edge.source].push(
            edge.target
        );

        inDegree[edge.target]++;

    }


    /*
     * Kahn's Algorithm
     *
     * Start with nodes having
     * zero incoming edges.
     */
    const queue = [];

    nodes.forEach((node) => {

        if (inDegree[node.id] === 0) {

            queue.push(node.id);

        }

    });


    let processedNodes = 0;


    /*
     * Remove nodes with zero
     * incoming edges one by one.
     */
    while (queue.length > 0) {

        const currentNode =
            queue.shift();

        processedNodes++;


        for (
            const nextNode
            of adjacencyList[currentNode]
        ) {

            inDegree[nextNode]--;


            if (inDegree[nextNode] === 0) {

                queue.push(nextNode);

            }

        }

    }


    /*
     * If we couldn't process
     * every node, a cycle exists.
     */
    if (processedNodes !== nodes.length) {

        return {
            valid: false,
            message:
                "❌ Workflow contains a cycle. Deployment blocked."
        };

    }


    return {
        valid: true,
        message: "Workflow DAG is valid"
    };
};

const getNodeLabel = (type) => {

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
};
function WorkflowEditor() {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
   const { id } = useParams();
    const [workflowData, setWorkflowData] =
        useState({
            nodes: [],
            edges: [],
            workflowId: null
        });


    const [workflowName, setWorkflowName] =
        useState("My Workflow");
const [webhookSecret, setWebhookSecret] =
    useState("");

    const [message, setMessage] =
        useState("");


    const handleWorkflowChange = useCallback((data) => {
    setWorkflowData((current) => ({
        ...current,
        nodes: data.nodes,
        edges: data.edges
    }));

    setMessage("");
}, []);


    const handleSave = async () => {

        try {

            setMessage("Saving...");


            const workflow = {

                title: workflowName,

                description:
                    "Workflow created using React Flow",
  
                nodes:
                    workflowData.nodes.map(
                        (node) => ({

                            nodeId: node.id,

                            type:
                                node.data?.type,

                            config:
                                node.data?.config || {},

                            position: {

                                x:
                                    node.position.x,

                                y:
                                    node.position.y

                            }

                        })
                    ),


                edges:
                    workflowData.edges.map(
                        (edge) => ({

                            sourceNodeId:
                                edge.source,

                            targetNodeId:
                                edge.target,

                            conditionHandle:
                                edge.sourceHandle ||
                                "default"

                        })
                    )

            };
if (webhookSecret) {
    workflow.webhookSecret = webhookSecret;
}
let response;

if (workflowData.workflowId || id) {

    response = await axios.put(
        `http://localhost:5000/api/workflows/${workflowData.workflowId}`,
        workflow,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

} else {

    response = await axios.post(
        "http://localhost:5000/api/workflows",
        workflow,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );
}

console.log(
    "WORKSPACES RESPONSE:",
    response.data
);

console.log(
    "WORKSPACES LIST:",
    response.data.workflows
);

          const savedWorkflowId =
    response.data.workflow._id;

setWorkflowData((current) => ({
    ...current,
    workflowId: savedWorkflowId
}));

console.log(
    "Saved workflow ID:",
    savedWorkflowId
);


            setMessage(
                "✅ Workflow saved successfully!"
            );

        } catch (error) {

            console.error(error);


            setMessage(
                error.response?.data?.message ||
                "❌ Failed to save workflow"
            );

        }

    };

useEffect(() => {

    if (!id) {
        return;
    }

    const fetchWorkflow = async () => {

        try {

            const response = await axios.get(
                `http://localhost:5000/api/workflows/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const workflow =
                response.data.workflow;
console.log("Loaded workflow:", workflow);
console.log("Loaded nodes:", workflow.nodes);
console.log("Loaded edges:", workflow.edges);
            setWorkflowData({
                workflowId: workflow._id,
                nodes: workflow.nodes.map((node) => ({
                    id: node.nodeId,
                   type: "workflowNode",
                    position: node.position,
                   data: {
    label: getNodeLabel(node.type),
    type: node.type,
    config: node.config || {}
}
                })),
               edges: workflow.edges.map((edge) => ({
    id: `${edge.sourceNodeId}-${edge.targetNodeId}`,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    sourceHandle: edge.conditionHandle || "default",
    targetHandle: "target"
}))
            });

            setWorkflowName(workflow.title);
           

        } catch (error) {

            console.error(
                "Failed to load workflow:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to load workflow"
            );
        }
    };

    fetchWorkflow();

}, [id]);
    const handleDeploy = async () => {

        try {

            /*
             * =====================================
             * FR-DAG-02
             * Frontend Kahn's Algorithm validation
             * =====================================
             */

            const validation =
                validateDAG(
                    workflowData.nodes,
                    workflowData.edges
                );


            if (!validation.valid) {

                setMessage(
                    validation.message
                );

                return;

            }


            /*
             * Workflow must be saved
             * before deployment.
             */
            if (!workflowData.workflowId) {

                setMessage(
                    "❌ Please save the workflow first"
                );

                return;

            }
console.log(
    "Running workflow ID:",
    workflowData.workflowId
);

            setMessage(
                "Deploying workflow..."
            );

const response =
    await axios.post(
        `http://localhost:5000/api/workflows/${workflowData.workflowId}/deploy`,
        {},
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );
            const result =
                response.data;


            setMessage(
                `✅ Workflow deployed successfully! Version: ${result.version}`
            );

        } catch (error) {

            console.error(error);


            setMessage(
                error.response?.data?.message ||
                "❌ Workflow deployment failed"
            );

        }

    };
const handleRunWorkflow = async () => {

    try {

        if (!workflowData.workflowId) {
            setMessage(
                "❌ Please save the workflow first"
            );
            return;
        }

        setMessage(
            "Running workflow..."
        );

        const response =
            await axios.post(
                `http://localhost:5000/api/workflows/${workflowData.workflowId}/run`,
                {
                    name: "Sruthi",
                    message: "Hello Workflow"
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        setMessage(
            `✅ Workflow started! Run ID: ${response.data.runId}`
        );

    } catch (error) {

        console.error(error);

        setMessage(
            error.response?.data?.message ||
            "❌ Failed to run workflow"
        );

    }
};

    return (

        <div className="workflow-page">

            <header className="workflow-header">

                <div>

                    <input
                        value={workflowName}
                        onChange={(e) =>
                            setWorkflowName(
                                e.target.value
                            )
                        }
                        className="workflow-name"
                    />


<button
    onClick={() => navigate("/workspaces")}
>
    Back to Workflows
</button>
                    <p>
                        Create and automate your workflow
                    </p>

                </div>


                <div className="header-actions">

                    <button
                        onClick={handleSave}
                    >
                        Save
                    </button>


                    <button
                        onClick={handleDeploy}
                    >
                        Deploy
                    </button>
<button
    onClick={handleRunWorkflow}
>
    ▶ Run Workflow
</button>
                </div>

            </header>


            {message && (

                <div className="workflow-message">

                    {message}

                </div>

            )}


            <div className="workflow-content">

            <WorkflowCanvas
    key={workflowData.workflowId || "new-workflow"}
    initialNodes={workflowData.nodes}
    initialEdges={workflowData.edges}
    onWorkflowChange={handleWorkflowChange}
/>
            </div>

        </div>

    );

}


export default WorkflowEditor;