const Workflow = require("../models/Workflow");
const NodeState = require("../models/NodeState");
const ExecutionRun = require("../models/ExecutionRun");

const {
    executeTransformNode,
    executeHttpNode
} = require("./nodeExecutor");

const {
    resolveTemplate
} = require("./variableMapper");

const {
    evaluateCondition
} = require("./conditionService");


// ======================================================
// VARIABLE MAPPING
// ======================================================

const resolveNodeInput = (
    value,
    data
) => {

    if (typeof value === "string") {

        return resolveTemplate(
            value,
            data
        );
    }


    if (Array.isArray(value)) {

        return value.map(
            (item) =>
                resolveNodeInput(
                    item,
                    data
                )
        );
    }


    if (
        value &&
        typeof value === "object"
    ) {

        const result = {};

        for (
            const key of Object.keys(value)
        ) {

            result[key] =
                resolveNodeInput(
                    value[key],
                    data
                );
        }

        return result;
    }


    return value;
};


// ======================================================
// GET PARENT NODES
// ======================================================

const getParentNodeIds = (
    workflow,
    nodeId
) => {

    return workflow.edges
        .filter(
            (edge) =>
                edge.targetNodeId ===
                nodeId
        )
        .map(
            (edge) =>
                edge.sourceNodeId
        );
};


// ======================================================
// WAIT FOR ALL PARENT NODES
// ======================================================

const waitForParentNodes = async (
    workflow,
    runId,
    nodeId
) => {

    const parentNodeIds =
        getParentNodeIds(
            workflow,
            nodeId
        );


    /*
     * No parents means the node
     * can execute immediately.
     */
    if (
        parentNodeIds.length <= 1
    ) {

        return null;
    }


    console.log(
        `Waiting for ${parentNodeIds.length} parent nodes before executing ${nodeId}`
    );


    while (true) {

        const parentStates =
            await NodeState.find({
                runId,
                nodeId: {
                    $in: parentNodeIds
                }
            });


        const allCompleted =
            parentStates.length ===
                parentNodeIds.length &&
            parentStates.every(
                (state) =>
                    state.status ===
                    "COMPLETED"
            );


        if (allCompleted) {

            console.log(
                `All parent nodes completed for ${nodeId}`
            );


            /*
             * Collect outputs from
             * all parent nodes.
             */
            const parentOutputs = {};

            for (
                const state of parentStates
            ) {

                parentOutputs[
                    state.nodeId
                ] = state.output;
            }


            return parentOutputs;
        }


        /*
         * If any parent failed,
         * don't wait forever.
         */
        const failedParent =
            parentStates.find(
                (state) =>
                    state.status ===
                    "FAILED"
            );


        if (failedParent) {

            throw new Error(
                `Parent node ${failedParent.nodeId} failed`
            );
        }


        /*
         * Check again after 500ms.
         */
        await new Promise(
            (resolve) =>
                setTimeout(
                    resolve,
                    500
                )
        );
    }
};


// ======================================================
// EXECUTE SINGLE NODE
// ======================================================

const executeSingleNode = async (
    workflow,
    executionRun,
    currentNode,
    currentOutput
) => {

    /*
     * Atomically claim the node.
     *
     * This is important for JOIN nodes.
     *
     * When two branches reach the same
     * node at almost the same time,
     * only one branch is allowed to
     * execute the node.
     */
    const nodeState =
        await NodeState.findOneAndUpdate(
            {
                runId:
                    executionRun._id,

                nodeId:
                    currentNode.nodeId,

                status:
                    "PENDING"
            },
            {
                $set: {
                    status:
                        "RUNNING",

                    startedAt:
                        new Date(),

                    input:
                        currentOutput
                }
            },
            {
               
    returnDocument: "after"

            }
        );


    /*
     * Another branch already claimed
     * this node.
     */
    if (!nodeState) {

        console.log(
            `Node ${currentNode.nodeId} was already processed or is running`
        );

        return {
            claimed: false,
            output: undefined
        };
    }


    const nodeInput =
        resolveNodeInput(
            currentNode.config || {},
            currentOutput
        );


    let output =
        currentOutput;


    try {

        // ==================================================
        // WEBHOOK TRIGGER
        // ==================================================

        if (
            currentNode.type ===
            "TRIGGER_WEBHOOK"
        ) {

            output =
                currentOutput;
        }


        // ==================================================
        // JAVASCRIPT TRANSFORM
        // ==================================================

        else if (
            currentNode.type ===
            "TRANSFORM_JS"
        ) {

            const transformNode = {
                ...currentNode.toObject(),

                config: {
                    ...currentNode.config,
                    ...nodeInput
                }
            };


            output =
                await executeTransformNode(
                    transformNode,
                    currentOutput
                );
        }


        // ==================================================
        // HTTP ACTION
        // ==================================================

        else if (
            currentNode.type ===
            "ACTION_HTTP"
        ) {

            const httpNode = {
                ...currentNode.toObject(),

                config: {
                    ...currentNode.config,
                    ...nodeInput
                }
            };


            output =
                await executeHttpNode(
                    httpNode,
                    currentOutput
                );
        }


        // ==================================================
        // DELAY
        // ==================================================

        else if (
            currentNode.type ===
            "DELAY"
        ) {

            const delay =
                Number(
                    currentNode.config?.delay ||
                    0
                );


            if (delay < 0) {

                throw new Error(
                    "Delay cannot be negative"
                );
            }


            console.log(
                `Delaying workflow for ${delay}ms`
            );


            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        delay
                    )
            );


            output =
                currentOutput;
        }


        // ==================================================
        // IF / ELSE CONDITION
        // ==================================================

        else if (
            currentNode.type ===
            "ROUTER_IF_ELSE"
        ) {

            const conditionResult =
                evaluateCondition(
                    currentNode.config,
                    currentOutput
                );


            output = {
                ...currentOutput,

                conditionResult
            };


            console.log(
                `Condition result: ${conditionResult}`
            );
        }


        // ==================================================
        // OTHER NODE TYPES
        // ==================================================

        else {

            output =
                currentOutput;
        }


        // ==================================================
        // NODE COMPLETED
        // ==================================================

        nodeState.status =
            "COMPLETED";

        nodeState.output =
            output;

       nodeState.completedAt =
    new Date();

nodeState.latencyMs =
    nodeState.completedAt -
    nodeState.startedAt;

await nodeState.save();

        return {
            claimed: true,
            output
        };

    } catch (error) {

        // ==================================================
        // NODE FAILED
        // ==================================================

       nodeState.status =
    "FAILED";

nodeState.error =
    error.message;

nodeState.completedAt =
    new Date();

nodeState.latencyMs =
    nodeState.completedAt -
    nodeState.startedAt;

await nodeState.save();


        throw error;
    }
};


// ======================================================
// START WORKFLOW EXECUTION
// ======================================================

const startExecution = async (
    runId
) => {

    const executionRun =
        await ExecutionRun.findById(
            runId
        );


    if (!executionRun) {

        throw new Error(
            "Execution run not found"
        );
    }


    const workflow =
        await Workflow.findById(
            executionRun.workflowId
        );


    if (!workflow) {

        throw new Error(
            "Workflow not found"
        );
    }


    const triggerNode =
        workflow.nodes.find(
            (node) =>
                node.type ===
                "TRIGGER_WEBHOOK"
        );


    if (!triggerNode) {

        throw new Error(
            "Webhook trigger node not found"
        );
    }


    // ==================================================
    // PROCESS NODE
    // ==================================================

    const processNode = async (
        currentNode,
        currentOutput
    ) => {

        /*
         * Wait for parent nodes.
         *
         * For a JOIN node this returns
         * the output of every parent.
         */
        const parentOutputs =
            await waitForParentNodes(
                workflow,
                executionRun._id,
                currentNode.nodeId
            );


        /*
         * If this is a JOIN node,
         * pass all parent outputs.
         *
         * Otherwise use the normal
         * previous node output.
         */
        const nodeInput =
            parentOutputs !== null
                ? parentOutputs
                : currentOutput;


        // ==================================================
        // EXECUTE CURRENT NODE
        // ==================================================

        const executionResult =
            await executeSingleNode(
                workflow,
                executionRun,
                currentNode,
                nodeInput
            );


        /*
         * Another branch already
         * executed this JOIN node.
         */
        if (
            !executionResult.claimed
        ) {

            return;
        }


        const output =
            executionResult.output;


        // ==================================================
        // FIND OUTGOING EDGES
        // ==================================================

        const outgoingEdges =
            workflow.edges.filter(
                (edge) =>
                    edge.sourceNodeId ===
                    currentNode.nodeId
            );


        /*
         * No outgoing edges means
         * this branch has finished.
         */
        if (
            outgoingEdges.length === 0
        ) {

            return;
        }


        // ==================================================
        // IF / ELSE CONDITION
        // ==================================================

        if (
            currentNode.type ===
            "ROUTER_IF_ELSE"
        ) {

            const targetHandle =
                output.conditionResult
                    ? "true"
                    : "false";


            const selectedEdge =
                outgoingEdges.find(
                    (edge) =>
                        edge.conditionHandle ===
                        targetHandle
                );


            if (!selectedEdge) {

                throw new Error(
                    `No ${targetHandle} branch found for condition node ${currentNode.nodeId}`
                );
            }


            const nextNode =
                workflow.nodes.find(
                    (node) =>
                        node.nodeId ===
                        selectedEdge.targetNodeId
                );


            if (!nextNode) {

                throw new Error(
                    `Next workflow node ${selectedEdge.targetNodeId} not found`
                );
            }


            await processNode(
                nextNode,
                output
            );


            return;
        }


        // ==================================================
        // NORMAL NODE
        //
        // Execute ALL outgoing branches
        // in parallel.
        // ==================================================

        const branchPromises =
            outgoingEdges.map(
                async (edge) => {

                    const nextNode =
                        workflow.nodes.find(
                            (node) =>
                                node.nodeId ===
                                edge.targetNodeId
                        );


                    if (!nextNode) {

                        throw new Error(
                            `Next workflow node ${edge.targetNodeId} not found`
                        );
                    }


                    await processNode(
                        nextNode,
                        output
                    );
                }
            );


        await Promise.all(
            branchPromises
        );
    };


    // ==================================================
    // EXECUTION START
    // ==================================================

    try {

    const failedNodeState = await NodeState.findOne({
        runId: executionRun._id,
        status: "FAILED"
    }).sort({ completedAt: 1 });

    let startNode = triggerNode;
    let startOutput = executionRun.triggerPayload;

    if (failedNodeState) {

        const failedNode = workflow.nodes.find(
            (node) => node.nodeId === failedNodeState.nodeId
        );

        if (!failedNode) {
            throw new Error(
                `Failed node ${failedNodeState.nodeId} not found`
            );
        }

        console.log(
            `Resuming workflow from failed node: ${failedNodeState.nodeId}`
        );

        failedNodeState.status = "PENDING";
        failedNodeState.error = null;
        failedNodeState.completedAt = null;

        await failedNodeState.save();

        startNode = failedNode;
        startOutput = failedNodeState.input;
    }

    await processNode(
        startNode,
        startOutput
    );


        /*
         * At this point all branches
         * have completed.
         */
        executionRun.status =
            "COMPLETED";

        executionRun.completedAt =
            new Date();


        await executionRun.save();


        console.log(
            `Workflow execution ${executionRun._id} completed`
        );


        return {
            message:
                "Workflow completed",

            runId:
                executionRun._id
        };

    } catch (error) {

        executionRun.status =
            "FAILED";

        executionRun.completedAt =
            new Date();


        await executionRun.save();


        console.error(
            "Workflow execution failed:",
            error.message
        );
  throw error;

        return {
            message:
                "Workflow execution failed",

            runId:
                executionRun._id,

            error:
                error.message
        };
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    startExecution
};