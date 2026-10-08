const express = require("express");

const {
    createWorkflow,
    getWorkflows,
    getWorkflowById,
    updateWorkflow,
    deleteWorkflow,
    validateWorkflow,
    deployWorkflow,
    runWorkflow,
    getWorkflowExecutions
} = require("../controllers/workflowController");

const authenticateToken =
    require("../middleware/authMiddleware");

const router =
    express.Router();


// Validate workflow
router.post(
    "/validate",
    authenticateToken,
    validateWorkflow
);


// Create workflow
router.post(
    "/",
    authenticateToken,
    createWorkflow
);


// Get all workflows
router.get(
    "/",
    authenticateToken,
    getWorkflows
);
router.get(
    "/:id/executions",
    authenticateToken,
    getWorkflowExecutions
);
router.post(
    "/:id/run",
    authenticateToken,
    runWorkflow
);

// Deploy workflow
router.post(
    "/:id/deploy",
    authenticateToken,
    deployWorkflow
);


// Get workflow by ID
router.get(
    "/:id",
    authenticateToken,
    getWorkflowById
);


// Update workflow
router.put(
    "/:id",
    authenticateToken,
    updateWorkflow
);


// Delete workflow
router.delete(
    "/:id",
    authenticateToken,
    deleteWorkflow
);


module.exports = router;