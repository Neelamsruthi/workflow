const Workflow = require("../models/Workflow");
const validateDAG = require("../services/dagService");
const ExecutionRun = require("../models/ExecutionRun");
const NodeState = require("../models/NodeState");
const {
    startExecution
} = require("../services/executionService");
const { encrypt } = require("../utils/encryption");

const createWorkflow = async (req, res) => {
    try {
   const {
    title,
    description,
    nodes,
    edges,
    webhookSecret
} = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Workflow title is required"
            });
        }

      const workflow = await Workflow.create({
     tenantId: req.user.userId,
    title,
    description,
    nodes: nodes || [],
    edges: edges || [],
    webhookSecret: webhookSecret
        ? encrypt(webhookSecret)
        : null
});

        res.status(201).json({
            message: "Workflow created successfully",
            workflow
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create workflow",
            error: error.message
        });
    }
};


const validateWorkflow = async (req, res) => {

    try {

        const {
            nodes,
            edges
        } = req.body;

        if (!nodes || !Array.isArray(nodes)) {
            return res.status(400).json({
                valid: false,
                message: "Nodes are required"
            });
        }

        if (!edges || !Array.isArray(edges)) {
            return res.status(400).json({
                valid: false,
                message: "Edges are required"
            });
        }

        const result =
            validateDAG(nodes, edges);

        if (!result.valid) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            valid: false,
            message: "Workflow validation failed",
            error: error.message
        });
    }
};

const runWorkflow = async (req, res) => {
    try {
if (req.user.role !== "WORKFLOW_DEVELOPER") {
    return res.status(403).json({
        message: "Only Workflow Developers can run workflows"
    });
}
       const workflow = await Workflow.findOne({
    _id: req.params.id,
    tenantId: req.user.userId,
    isActive: true
});

        if (!workflow) {
            return res.status(404).json({
                message:
                    "Active workflow not found"
            });
        }

        const executionRun =
            await ExecutionRun.create({
                workflowId:
                    workflow._id,

                status:
                    "RUNNING",

                triggerPayload:
                    req.body
            });

        const nodeStates =
            workflow.nodes.map((node) => ({
                runId:
                    executionRun._id,

                nodeId:
                    node.nodeId,

                status:
                    "PENDING"
            }));

        await NodeState.insertMany(
            nodeStates
        );

        await startExecution(
            executionRun._id
        );

        return res.status(202).json({
            message:
                "Workflow execution started",

            runId:
                executionRun._id,

            workflowId:
                workflow._id
        });

    } catch (error) {

        console.error(
            "Run workflow error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to run workflow",

            error:
                error.message
        });
    }
};
/*
    DEPLOY WORKFLOW
*/
const deployWorkflow = async (req, res) => {
    if (req.user.role !== "WORKFLOW_DEVELOPER") {
    return res.status(403).json({
        message: "Only Workflow Developers can deploy workflows"
    });
}

    try {

       const workflow = await Workflow.findOne({
    _id: req.params.id,
    tenantId: req.user.userId
});
        if (!workflow) {

            return res.status(404).json({
                message: "Workflow not found"
            });
        }


        // Validate the stored workflow
        const validationResult =
            validateDAG(
                workflow.nodes,
                workflow.edges
            );


        // Don't deploy invalid workflows
        if (!validationResult.valid) {

            return res.status(400).json({
                message:
                    "Workflow cannot be deployed",

                validation:
                    validationResult
            });
        }

await Workflow.updateMany(
    {
        tenantId: req.user.userId,
        title: workflow.title,
        _id: { $ne: workflow._id }
    },
    {
        isActive: false
    }
);


        // Activate current workflow
        workflow.isActive = true;

        workflow.version =
            (workflow.version || 0) + 1;


        await workflow.save();


        res.status(200).json({

            message:
                "Workflow deployed successfully",

            workflowId:
                workflow._id,

            version:
                workflow.version,

            isActive:
                workflow.isActive,

            executionOrder:
                validationResult.executionOrder
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to deploy workflow",

            error:
                error.message
        });
    }
};


const getWorkflows = async (req, res) => {
    try {

        let workflows;

        if (req.user.role === "OPERATIONS") {

            // Operations can view all workflows
            workflows = await Workflow
                .find()
                .sort({ createdAt: -1 });

        } else {

            // Workflow Developer can view only their own workflows
            workflows = await Workflow
                .find({
                    tenantId: req.user.userId
                })
                .sort({ createdAt: -1 });
        }

        return res.status(200).json({
            workflows
        });

    } catch (error) {

        console.error(
            "Get workflows error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch workflows",
            error: error.message
        });
    }
};
      


const getWorkflowById = async (req, res) => {

    try {

      const workflow = await Workflow.findOne({
    _id: req.params.id,
    tenantId: req.user.userId
});

        if (!workflow) {

            return res.status(404).json({
                message:
                    "Workflow not found"
            });
        }

        res.status(200).json({
            workflow
        });

    } catch (error) {

        res.status(500).json({

            message:
                "Failed to fetch workflow",

            error:
                error.message
        });
    }
};


const updateWorkflow = async (req, res) => {

    try {
if (req.user.role !== "WORKFLOW_DEVELOPER") {
    return res.status(403).json({
        message: "Only Workflow Developers can edit workflows"
    });
}
      const workflow = await Workflow.findOneAndUpdate(
    {
        _id: req.params.id,
        tenantId: req.user.userId
    },
    req.body,
    { new: true }
);

        if (!workflow) {

            return res.status(404).json({
                message:
                    "Workflow not found"
            });
        }

        res.status(200).json({

            message:
                "Workflow updated successfully",

            workflow
        });

    } catch (error) {

        res.status(500).json({

            message:
                "Failed to update workflow",

            error:
                error.message
        });
    }
};


const deleteWorkflow = async (req, res) => {

    try {
if (req.user.role !== "WORKFLOW_DEVELOPER") {
    return res.status(403).json({
        message: "Only Workflow Developers can delete workflows"
    });
}
      const workflow = await Workflow.findOne({
    _id: req.params.id,
    tenantId: req.user.userId
});

        if (!workflow) {

            return res.status(404).json({
                message:
                    "Workflow not found"
            });
        }

        res.status(200).json({

            message:
                "Workflow deleted successfully"
        });

    } catch (error) {

        res.status(500).json({

            message:
                "Failed to delete workflow",

            error:
                error.message
        });
    }
};

const getWorkflowExecutions = async (req, res) => {
    try {
      let workflow;

if (req.user.role === "OPERATIONS") {
    workflow = await Workflow.findById(req.params.id);
} else {
    workflow = await Workflow.findOne({
        _id: req.params.id,
        tenantId: req.user.userId
    });
}
        if (!workflow) {
            return res.status(404).json({
                message: "Workflow not found"
            });
        }

        const ExecutionRun = require("../models/ExecutionRun");

        const executions = await ExecutionRun.find({
            workflowId: workflow._id
        })
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            executions
        });

    } catch (error) {
        console.error(
            "Get workflow executions error:",
            error
        );

        return res.status(500).json({
            message: "Failed to load executions"
        });
    }
};
module.exports = {

    createWorkflow,

    validateWorkflow,

    deployWorkflow,

    getWorkflows,

    getWorkflowById,

    updateWorkflow,

    deleteWorkflow,
    runWorkflow,
    getWorkflowExecutions
};