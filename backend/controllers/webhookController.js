const Workflow = require("../models/Workflow");
const ExecutionRun = require("../models/ExecutionRun");
const NodeState = require("../models/NodeState");

const executionQueue = require("../services/executionQueue");


const triggerWorkflow = async (req, res) => {
    try {
        const { workflowId } = req.params;

        // Find deployed workflow
        const workflow = await Workflow.findOne({
            _id: workflowId,
            isActive: true
        });

        if (!workflow) {
            return res.status(404).json({
                message: "Active workflow not found"
            });
        }

        // Create execution run
        // ExecutionRun automatically generates the UUID runId.
        const executionRun = await ExecutionRun.create({
            workflowId: workflow._id,
            status: "RUNNING",
            triggerPayload: req.body
        });

        // Create NodeState for every workflow node
        // Keep MongoDB _id internally for the current execution engine.
        const nodeStates = workflow.nodes.map((node) => ({
            runId: executionRun._id,
            nodeId: node.nodeId,
            status: "PENDING"
        }));

        await NodeState.insertMany(nodeStates);

        // Queue workflow execution
        await executionQueue.add(
            "execute-workflow",
            {
                runId: executionRun._id.toString()
            }
        );

        // Return the SRS runId UUID to the caller
        return res.status(202).json({
            message: "Workflow execution started",
            runId: executionRun.runId,
            workflowId: workflow._id
        });

    } catch (error) {
        console.error(
            "Webhook trigger error:",
            error
        );

        return res.status(500).json({
            message: "Failed to trigger workflow",
            error: error.message
        });
    }
};


module.exports = {
    triggerWorkflow
};