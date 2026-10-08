const express = require("express");

const {
    getExecutionStates,
    streamExecution,
    getFailedJobs,
    retryFailedJob
} = require("../controllers/executionController");

const authenticateToken =
    require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/failed",
    authenticateToken,
    getFailedJobs
);
router.post(
    "/failed/:jobId/retry",
    authenticateToken,
    retryFailedJob
);
// Get historical execution states
router.get(
    "/:runId",
    authenticateToken,
    getExecutionStates
);


// Live execution stream
router.get(
    "/:runId/stream",
    authenticateToken,
    streamExecution
);


module.exports = router;