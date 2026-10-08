const express = require("express");

const {
    triggerWorkflow
} = require("../controllers/webhookController");

const validateWebhookSignature =
    require("../middleware/webhookAuth");

const router = express.Router();

router.post(
    "/:workflowId",
    validateWebhookSignature,
    triggerWorkflow
);

module.exports = router;